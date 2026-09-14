# LabOS REV 1.0.120 — focused regression qualification

## Startup
- All five JavaScript runtime files pass `node --check`.
- The full app was executed in headless Chromium using an inlined-runtime harness (used because environment policy blocks browser navigation to localhost/file URLs).
- Startup reached `window.__PROTOLAB_READY__ === true` with boot phase `ready`.
- No browser `pageerror` events occurred after the V1070 compatibility fix.
- The harness origin does not permit IndexedDB, so the repository correctly exercised the existing in-memory fallback in this test. The IndexedDB schema remains unchanged.

## Planning-tab manual replanning
- Switched to Prototype Lab Coordinator / Planner.
- Opened Visual Resource Planning and selected a canonical `Test · …` booking.
- Planned Task opened without starting manual movement.
- `Move / replan in swimlane` initiated the REV 1.0.119/120 direct day planner.
- Test run produced 46 valid day alternatives: 16 Green and 30 Yellow.
- The full-width replanning ribbon measured exactly the same width as its parent lane track (desktop sample: 750 px / 750 px; mobile sample: 212 px / 212 px).

## Mobile interaction
- Chromium viewport: 390 × 844.
- Canonical test tap exposed both `Move / replan in swimlane` and `Send only this test to a sister lab`.
- Direct replanning rendered all 46 alternatives on the lane and remained free of browser runtime errors.

## Specific-build planning
- Opened the selected build and its `Schedule` tab.
- The build-specific planning swimlane exposed `Move / replan in swimlane`.
- Direct replanning rendered the full-width ribbon in the build-specific swimlane and generated valid day alternatives.

## Static/package checks
- Runtime references in `index.html` are all REV 1.0.120 names.
- Manifest parses as JSON.
- ZIP is flat and suitable for upload to a GitHub Pages repository root.
- ZIP integrity verified after packaging.
