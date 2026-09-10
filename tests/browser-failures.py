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
    context=pw.chromium.launch_persistent_context(tempfile.mkdtemp(prefix='customtab-test-'),executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',headless=True,args=['--enable-unsafe-extension-debugging','--remote-debugging-port=9341'],ignore_default_args=['--disable-extensions'],viewport={'width':1920,'height':1080})
    cdp=pw.chromium.connect_over_cdp('http://127.0.0.1:9341').new_browser_cdp_session()
    print(cdp.send('Extensions.loadUnpacked',{'path':str(ROOT)}),flush=True)
    worker=context.service_workers[0] if context.service_workers else context.wait_for_event('serviceworker')
    extension_id=worker.url.split('/')[2]
    print('Loaded unpacked extension:',extension_id,flush=True)
    page=context.new_page()
    stalled=[]
    page.route('https://**/*',lambda route:route.fulfill(path=str(ROOT/'assets/default-wallpaper.jpg'),content_type='image/jpeg'))
    page.route('https://fixture.test/stalled.jpg',lambda route:stalled.append(route))
    page.goto(f'chrome-extension://{extension_id}/newtab.html')
    page.evaluate("Math.random=()=>.99; backgroundImages.splice(0,backgroundImages.length,'https://fixture.test/good.jpg','https://fixture.test/stalled.jpg')")
    page.wait_for_timeout(1500)
    assert page.locator('.is-current').evaluate("e=>getComputedStyle(e).opacity")=='1'
    assert page.locator('.is-current').evaluate("e=>getComputedStyle(e).backgroundImage.includes('default-wallpaper')")
    page.wait_for_timeout(11000)
    assert page.locator('.is-current').evaluate("e=>e.style.backgroundImage.includes('good.jpg')")
    print('Stalled image timed out; bundled background stayed visible; next good image loaded',flush=True)
    page.unroute_all(behavior='ignoreErrors')
    page.close()
    offline=context.new_page()
    offline.route('https://**/*',lambda route:route.abort())
    offline.goto(f'chrome-extension://{extension_id}/newtab.html')
    offline.evaluate("backgroundImages.splice(0,backgroundImages.length,'https://fixture.test/dead.jpg')")
    offline.wait_for_timeout(1500)
    assert offline.locator('.is-current').evaluate("e=>getComputedStyle(e).backgroundImage.includes('default-wallpaper')")
    assert offline.locator('.bookmark').count()==24
    print('All images failed: offline background and 24 bookmarks intact',flush=True)
    offline.unroute_all(behavior='ignoreErrors')
    context.close()
