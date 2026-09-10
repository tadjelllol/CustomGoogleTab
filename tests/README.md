# Browser verification — 2026-09-09

The extension was installed unpacked in an isolated, headless Google Chrome
profile using Chrome DevTools Protocol's Extensions.loadUnpacked. Your normal
Chrome profile and installed extensions were not modified.

Passed:
- Manifest V3 validation, zero requested permissions, local script references.
- Four chrome://newtab/ tabs opened and closed with the override active.
- 21 bookmark cards and every local favicon/initials fallback.
- UBC/Courses/General switching at 1920x1080, 2560x1440, 3440x1440,
  1366x768, 1024x600 and 390x640. No desktop overflow or horizontal overflow.
- Google submission trims whitespace, empty input stays put, slash focuses,
  Escape clears/blurs. Google navigation was intercepted by the test.
- Four real wallpaper backgrounds observed during the live rotation run;
  no page exceptions or console errors in that run.
- Rapid pointer movement and hover during rotation; no inline card transforms
  or growing DOM count.
- Failed-image skipping, stalled-image timeout, all-images-failed fallback.
- Simulated document visibility changes pause rotation and an in-flight animation;
  the old layer remains opaque. This uses a synthetic visibility event because
  headless tabs do not consistently model foreground/background activation.
- Reduced-motion behavior and 100 accelerated fixture rotations: listeners stayed
  at 60; DOM nodes went from 441 to 440 after garbage collection; two layers remain.

Screenshots and JSON output are in `artifacts/`. URL checks are unauthenticated;
see the extension README for login/automation-blocked destinations. Live remote
wallpaper availability remains dependent on the third-party hosts. The stress and
failure scenarios use intercepted image requests; the live rotation test does not.

## Optional development tests

The extension itself needs no Python, npm or build step. These test scripts use
Python with `playwright==1.51.0` and the installed Chrome executable at
`C:\Program Files\Google\Chrome\Application\chrome.exe` (adjust if needed).
Run scripts individually; they use ports 9338, 9340 and 9341 and temporary profiles.

    python tests/browser-test.py
    python tests/browser-stress.py
    python tests/browser-failures.py

The temporary browser testing flag enables extension installation only inside
that isolated test process. The downloaded Chromium runtimes failed to launch on
this Windows machine, so verification used the installed Google Chrome instead.
