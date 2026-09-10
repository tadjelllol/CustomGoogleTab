# Tadjell's Custom Tab

A build-free, vanilla HTML/CSS/JavaScript Manifest V3 extension.

## Load or reload in Chrome

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked**, then select this folder (the one containing `manifest.json`).
3. If already installed, press its **Reload** button instead.
4. Open a fresh tab. Existing new-tab pages need their own refresh to pick up edits.

Installation opens one welcome/new-tab page. Updates do not open extra tabs.
There are no requested permissions or host permissions.

## Edit your links and wallpapers

- `bookmarks.js`: UBC (8 links), Courses (6), General (10). UBC opens first.
  Edit one object per bookmark. `icon: null` uses initials; otherwise use a local
  icon path or a favicon URL. The enclosing group supplies group membership.
- `wallpapers.js`: all 76 original nonblank wallpaper URLs, unchanged.
- `assets/default-wallpaper.jpg`: a bundled copy of the first original wallpaper
  (`https://w.wallhaven.cc/full/48/wallhaven-4859q2.jpg`) for immediate/offline display.
- `assets/icons/`: bundled favicons fetched from their sites; no runtime icon service.
- `newtab.js`: timing constants, rendering, wallpaper manager, theme, clock,
  search and parallax. `styles.css` owns all bookmark transforms.

## Behavior

A shuffled wallpaper queue loads and decodes one image at a time. The old layer
stays opaque beneath the incoming layer throughout its gentle vertical crossfade.
There are exactly two permanent wallpaper layers and one rotation timer. Failed
or timed-out images are skipped for the rest of the page session. If all fail,
the last good background remains. Refresh to retry skipped images.

Rotation waits 12 seconds after a completed change, pauses animations and cancels
pending image loads while hidden, then resumes when visible. Reduced motion uses
instant image swaps and disables parallax/hover movement. Remote canvas sampling
silently falls back to a neutral accent without CORS requests or extra permissions.

Search submits trimmed text to Google. Escape clears and blurs; `/` focuses search.
The group selector supports arrow keys, Home and End. Small screens scroll normally.

## Link verification notes

URLs were requested on 2026-09-09. Canvas, Workday, Gmail and Docs reach their
login/service pages; authenticated access cannot be verified without signing in.
The dedicated PHYS 157 Canvas/Piazza links were removed on 2026-09-10.
Courses now contains PrairieTest, PrairieLearn, Achieve, Pearson MyLab, UBC WebMO
and CHEMpendix. The five new URLs are preserved exactly as supplied; authenticated
course access has not been verified. They use local initials fallbacks.
Brightspace, UBC Student Services, Reddit, ChatGPT and Merlin blocked automated
requests (403); Outlook returned 417. Their supplied URLs are preserved.
v0 redirects to v0.app. Other public destinations responded successfully.

Intentional initials fallbacks: Brightspace, Workday, UBC Email, StudentAid BC,
CHEMpendix, ChatGPT, v0 and Merlin. Other shortcuts use downloaded site favicons;
every card retains an initials fallback if its icon fails.

## Verification

See `../tests/README.md` for the Chrome checks and screenshots. The extension
loaded unpacked, opened four new tabs, displayed four real rotating wallpapers
without console errors, and passed all six viewport checks. A 100-rotation fixture
stress run kept listener counts stable. Failure, timeout, offline, visibility and
reduced-motion scenarios also passed. Test tools are optional development tools
and are not dependencies of the extension.

## Hide Chrome's footer

Chrome adds the bottom attribution and Customize Chrome bar outside the extension
page. Right-click that bar and select **Hide footer on New Tab page**. Alternatively,
open **Customize Chrome**, find **Footer**, and turn off **Show footer on New Tab page**.
This is a browser setting; extension CSS cannot remove that browser-owned bar.
See [Google Chrome Help](https://support.google.com/chrome/answer/11032183?hl=en).
