import json, re, tempfile, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]/'Tadjell-Chrome-Home-Page'
OUT=Path(__file__).resolve().parent/'artifacts'; OUT.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'manifest.json').read_text())
assert manifest['manifest_version']==3 and not manifest.get('permissions') and not manifest.get('host_permissions')
for file in ['newtab.html','background.js','styles.css','newtab.js','bookmarks.js','wallpapers.js']:
    assert (ROOT/file).is_file()
with sync_playwright() as pw:
    context=pw.chromium.launch_persistent_context(tempfile.mkdtemp(prefix='customtab-test-'),executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',headless=True,args=['--enable-unsafe-extension-debugging','--remote-debugging-port=9340'],ignore_default_args=['--disable-extensions'],viewport={'width':1920,'height':1080})
    cdp=pw.chromium.connect_over_cdp('http://127.0.0.1:9340').new_browser_cdp_session()
    print(cdp.send('Extensions.loadUnpacked',{'path':str(ROOT)}),flush=True)
    worker=context.service_workers[0] if context.service_workers else context.wait_for_event('serviceworker')
    extension_id=worker.url.split('/')[2]
    print('Loaded unpacked extension:',extension_id,flush=True)
    page=context.new_page()
    page.route('https://**/*',lambda route:route.fulfill(path=str(ROOT/'assets/default-wallpaper.jpg'),content_type='image/jpeg'))
    page.add_init_script("const originalTimeout=window.setTimeout; window.setTimeout=(fn,delay,...args)=>originalTimeout(fn,delay===12000?25:delay,...args)")
    page.goto(f'chrome-extension://{extension_id}/newtab.html')
    page.emulate_media(reduced_motion='reduce')
    page.evaluate("backgroundImages.splice(0, backgroundImages.length, 'https://fixture.test/one.jpg','https://fixture.test/two.jpg')")
    page.wait_for_timeout(1500)
    assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    session=context.new_cdp_session(page)
    page.evaluate("window.changes=0; new MutationObserver(ms=>window.changes+=ms.filter(m=>m.attributeName==='class').length/2).observe(document.querySelector('.wallpapers'),{subtree:true,attributes:true,attributeFilter:['class']})")
    session.send('HeapProfiler.collectGarbage')
    before=session.send('Memory.getDOMCounters')
    for _ in range(200):
        if page.evaluate('window.changes')>=100: break
        page.wait_for_timeout(100)
    changes=page.evaluate('window.changes')
    assert changes>=100,changes
    session.send('HeapProfiler.collectGarbage')
    after=session.send('Memory.getDOMCounters')
    assert after['jsEventListeners']<=before['jsEventListeners'],(before,after)
    assert after['nodes']<=before['nodes']+2,(before,after)
    assert page.locator('.wallpaper').count()==2
    assert page.evaluate('document.getAnimations().length')==0
    print('100 accelerated reduced-motion rotations: stable DOM/listeners',before,after,flush=True)
    page.emulate_media(reduced_motion='no-preference')
    for _ in range(100):
        if page.evaluate("document.getAnimations().some(a=>a.constructor.name==='Animation')"): break
        page.wait_for_timeout(20)
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true}); document.dispatchEvent(new Event('visibilitychange'))")
    assert page.evaluate("document.getAnimations().filter(a=>a.constructor.name==='Animation').every(a=>a.playState==='paused')")
    assert page.locator('.is-current').evaluate("e=>getComputedStyle(e).opacity")=='1'
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:false}); document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(1100)
    print('In-flight transition paused/resumed; old layer remained opaque',flush=True)
    (OUT/'stress-results.json').write_text(json.dumps({'rotations':changes,'before':before,'after':after},indent=2))
    context.close()
