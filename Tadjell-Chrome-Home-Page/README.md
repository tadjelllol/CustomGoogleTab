# Tadjell's Custom Tab V2.1

A build-free, vanilla HTML/CSS/JavaScript Manifest V3 extension with synchronized storage and stable identity.

## Load or reload in Chrome & Stable ID

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked**, then select this folder (containing `manifest.json`, which includes `manifest.key`).
3. If already installed, press its **Reload** button instead.
4. Open a fresh tab. Existing new-tab pages need their own refresh to pick up edits.

This version uses a stable development ID defined by `manifest.key` (a public base64 DER SPKI RSA key shared across clones).
Only the `storage` permission is requested; there are no host, tabs, scripting or unlimitedStorage permissions.

## Data Migration, Backups & Sync Quotas

### Upgrading from V2 Local Storage
Before loading this V2.1 candidate, export/back up your existing V2 local data (`orion-custom-tab-v2` from local storage). You can export its JSON using browser DevTools (e.g. `copy(localStorage.getItem('orion-custom-tab-v2'))`) to a backup file.

Upon first loading V2.1, export your candidate snapshot as a second backup. Then parse your old backup JSON, validate it, and perform a user-approved replacement through the global `BookmarkStore` class (via `new BookmarkStore(bookmarkGroups)` which exposes a `ready` Promise, state snapshot, `validate(data)`, and `change(updateCallback)`). `change` passes a cloned draft snapshot; mutate its version, categories, bookmarks, and usage from the validated backup. This persists locally and queues sync. Refresh the page afterward. Importing replaces the candidate collection and may sync to other devices. Never clear `chrome.storage.sync` or delete backups.

### Sync Quotas and Behavior (`chrome.storage.sync`)
- **Usage:** Small bookmarks, categories, usage data, settings, and icon URLs are synchronized across devices using `chrome.storage.sync`.
- **Quotas:** Respects 102,400 bytes total, 8,192 bytes per item, 512 items, 120 writes/minute, and 1,800/hour. Writes are debounced.
- **Fallback & Warnings:** A recoverable local-only warning is shown on failure or oversize conditions. Data is sharded to avoid exceeding the 8,192-byte monolithic item limit, preserving data at quota boundaries.
- **Multi-Device Sync:** Requires the same signed-in Chrome account with extension sync enabled on both devices. Supports offline eventual sync and last-write-wins simultaneous-edit handling. Actual cross-device delivery remains untested without two signed-in devices. Note that data sync does not install or update unpacked code (future device pull/reload orchestration applies: Git pull then `chrome://extensions` Reload; no automatic deployment now).
- **No Remote Wallpapers:** Wallpaper binaries are never synced.

## Icon Controls

Add/edit supports:
1. **Automatic:** Preserves bundled defaults.
2. **Custom image URL:** Accepts HTTP(S) URLs only without embedded credentials (never script, data, or file URLs). Rendered securely with `no-referrer`, falling back to initials on load errors.
3. **Initials:** Clean typographical fallback.

All icon sources and hashes are recorded in assets/icons/SOURCES.json. Every icon retains an initials fallback and guards against HTML injection.

## Manage your bookmarks

Recent opens by default. It shows up to twelve locally ranked bookmarks using decaying recency and bounded frequency. First use shows suggestions. UBC includes the former Courses shortcuts; General holds other links; All shows everything. Filter bookmarks searches labels and URLs across categories, separately from Google search.

Choose **Manage bookmarks** for add, edit, move, delete and category controls. Card width and height are preserved in Manage mode. Clicking or keyboard activation of a card in Manage opens the Edit dialog rather than navigating or recording use. Permanent per-card Edit/Delete rows are removed; deletion is available directly inside the edit dialog with confirmation. Category deletion requires moving its bookmarks to another category; Recent and All are protected views.

Changes persist in synced browser storage. Invalid saved data is preserved and reported; a failed save does not replace the in-memory bookmark list. Limits: 500 bookmarks, 30 categories and one bounded usage summary per bookmark.

Wallpapers remain defined in wallpapers.js; the 76 original nonblank URLs and bundled offline wallpaper are unchanged. The full wallpaper manager is deferred.

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
The group selector supports arrow keys, Home and End. Large and small screens scroll normally (no horizontal overflow or clipped bottom cards at 1366x768, 1920x1080, or 390x640).

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
