# Tadjell's Custom Tab

A build-free, vanilla HTML/CSS/JavaScript Manifest V3 extension.

## Load or reload in Chrome

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked**, then select this folder (the one containing `manifest.json`).
3. If already installed, press its **Reload** button instead.
4. Open a fresh tab. Existing new-tab pages need their own refresh to pick up edits.

Installation opens one welcome/new-tab page. Updates do not open extra tabs.
There are no requested permissions or host permissions.

## Manage your bookmarks

Recent opens by default. It shows up to twelve locally ranked bookmarks using decaying recency and bounded frequency. First use shows suggestions. UBC includes the former Courses shortcuts; General holds other links; All shows everything. Filter bookmarks searches labels and URLs across categories, separately from Google search.

Choose **Manage bookmarks** for add, edit, move, delete and category controls. Choose a bundled icon or initials. Category deletion requires moving its bookmarks to another category; Recent and All are protected views. Changes persist in local browser storage without extra extension permissions, a server or remote usage tracking. Clearing this extension's site data clears these local edits.

The first load migrates the defaults in bookmarks.js. Later changes to that file do not overwrite saved edits. Invalid saved data is preserved and reported; a failed save does not replace the in-memory bookmark list. Limits: 500 bookmarks, 30 categories and one bounded usage summary per bookmark.

Wallpapers remain defined in wallpapers.js; the 76 original nonblank URLs and bundled offline wallpaper are unchanged. The full wallpaper manager is deferred. Icon sources and hashes are recorded in assets/icons/SOURCES.json. Brightspace uses official Brightspace Pulse artwork. Every icon retains an initials fallback.

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
UBC retains PrairieTest, PrairieLearn, Achieve, Pearson MyLab and UBC WebMO. Merlin AI and CHEMpendix were removed as requested. Authenticated course access has not been re-verified. v0 redirects to v0.app. Other public destinations responded successfully.

UBC Email uses an initials fallback. Other requested icon corrections use bundled official assets; every card retains initials if its image fails.

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
