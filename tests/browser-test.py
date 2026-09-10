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
    context=pw.chromium.launch_persistent_context(tempfile.mkdtemp(prefix='customtab-test-'),executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',headless=True,args=['--enable-unsafe-extension-debugging','--remote-debugging-port=9338'],ignore_default_args=['--disable-extensions'],viewport={'width':1920,'height':1080})
    cdp=pw.chromium.connect_over_cdp('http://127.0.0.1:9338').new_browser_cdp_session()
    print(cdp.send('Extensions.loadUnpacked',{'path':str(ROOT)}),flush=True)
    worker=context.service_workers[0] if context.service_workers else context.wait_for_event('serviceworker')
    extension_id=worker.url.split('/')[2]
    print('Loaded unpacked extension:',extension_id,flush=True)
    errors=[]
    page=context.new_page()
    page.on('pageerror',lambda error: errors.append(str(error)))
    console=[]
    page.on('console',lambda msg: console.append(msg.text) if msg.type=='error' else None)
    page.goto(f'chrome-extension://{extension_id}/newtab.html')
    page.wait_for_function("document.querySelectorAll('.bookmark').length === 24")
    assert page.locator('.wallpaper').count()==2
    assert page.locator('.bookmark:visible').count()==8
    for _ in range(4):
        tab=context.new_page(); tab.goto('chrome://newtab/'); tab.wait_for_selector('#clock'); assert tab.locator('.bookmark').count()==24; tab.close()
    page.bring_to_front()
    print('Four new tabs opened and closed successfully',flush=True)
    page.wait_for_timeout(2000)
    icon_state=page.locator('.icon').evaluate_all("els => els.map(e => ({name:e.parentElement.textContent, valid: [...e.children].some(c => !c.hidden && (c.tagName !== 'IMG' || c.naturalWidth > 0))}))")
    assert all(x['valid'] for x in icon_state),icon_state
    for w,h in [(1920,1080),(2560,1440),(3440,1440),(1366,768),(1024,600),(390,640)]:
        page.set_viewport_size({'width':w,'height':h})
        for group in ['UBC','Courses','General']:
            page.get_by_role('tab',name=group,exact=True).click()
            dims=page.evaluate('({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight})')
            assert dims['sw']<=w,dims
            if w>=1024: assert dims['sh']<=h,(group,dims)
        page.get_by_role('tab',name='UBC',exact=True).click()
        if w in [1920,1366,390]: page.screenshot(path=str(OUT/f'{w}x{h}.png'))
    page.set_viewport_size({'width':1920,'height':1080})
    page.keyboard.press('/'); assert page.locator('#search').evaluate('(e)=>e===document.activeElement')
    page.locator('#search').fill('   '); page.keyboard.press('Enter'); assert page.url.endswith('newtab.html')
    page.locator('#search').fill('hello'); page.keyboard.press('Escape'); assert page.locator('#search').input_value()==''
    page.route('https://www.google.com/search?*',lambda route:route.fulfill(status=200,body='Search received'))
    page.locator('#search').fill('  UBC engineering  '); page.keyboard.press('Enter'); page.wait_for_url('**/search?*')
    assert page.url.endswith('q=UBC+engineering'),page.url
    page.goto(f'chrome-extension://{extension_id}/newtab.html')
    baseline=page.evaluate('document.querySelectorAll("*").length')
    seen=set()
    until=time.time()+42
    while time.time()<until:
        seen.add(page.locator('.is-current').evaluate('(e)=>getComputedStyle(e).backgroundImage'))
        for i in range(12): page.mouse.move(500+i*45,650+(i%3)*10)
        page.locator('.bookmark:visible').first.hover()
        page.wait_for_timeout(900)
    print('Real wallpaper backgrounds observed:',len(seen),flush=True)
    assert len(seen)>=3,'Need at least two real rotations'
    assert page.locator('.wallpaper').count()==2
    assert page.evaluate('document.querySelectorAll("*").length')==baseline
    assert page.locator('.bookmark').evaluate_all("els=>els.every(e=>!e.style.transform)")
    print('Real console errors:',console,flush=True)
    assert not errors,errors
    # Deterministic failure/timeout/visibility/reduced-motion tests keep real extension code.
    fixture=context.new_page()
    fixture.route('https://**/*',lambda route:route.fulfill(path=str(ROOT/'assets/default-wallpaper.jpg'),content_type='image/jpeg'))
    fixture.goto(f'chrome-extension://{extension_id}/newtab.html')
    fixture.evaluate("Math.random = () => .99; backgroundImages.splice(0, backgroundImages.length, 'https://fixture.test/good.jpg', 'https://fixture.test/dead.jpg')")
    fixture.route('https://fixture.test/dead.jpg',lambda route:route.abort())
    for _ in range(100):
        if fixture.locator('.is-current').evaluate("e => e.style.backgroundImage.includes('good.jpg')"): break
        fixture.wait_for_timeout(100)
    assert fixture.locator('.is-current').evaluate("e => e.style.backgroundImage.includes('good.jpg')")
    assert fixture.locator('.wallpaper').count()==2
    fixture.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, value:true}); document.dispatchEvent(new Event('visibilitychange'))")
    before=fixture.locator('.is-current').evaluate('(e)=>e.style.backgroundImage')
    fixture.wait_for_timeout(13000)
    assert fixture.locator('.is-current').evaluate('(e)=>e.style.backgroundImage')==before
    fixture.emulate_media(reduced_motion='reduce')
    fixture.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, value:false}); document.dispatchEvent(new Event('visibilitychange'))")
    fixture.mouse.move(100,100)
    assert fixture.locator('.bookmark').first.evaluate('(e)=>getComputedStyle(e).transform')=='none'
    fixture.evaluate("document.querySelector('.icon img').dispatchEvent(new Event('error'))")
    assert fixture.locator('.icon').first.locator('.icon-fallback').count()==1
    print('PASS: manifest, unpacked load, 4 new tabs, 6 viewports, 24 icons/fallbacks, search, rotations, parallax, DOM stability, failed wallpaper, hidden pause, reduced motion; page errors:',errors,flush=True)
    (OUT/'results.json').write_text(json.dumps({'wallpapersObserved':len(seen),'pageErrors':errors,'consoleErrors':console,'icons':icon_state},indent=2))
    context.close()





