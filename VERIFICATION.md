# ProtoLab OS REV 1.0.17 — Verification

REV 1.0.17 is a focused operational-dashboard, KPI simplification and workspace-layout update on top of REV 1.0.16.

## Focused runtime checks

`node verification-v117-node.js` — **9/9 PASS**

Verified:
- REV 1.0.17 is active in runtime and header.
- Lab/Admin dashboard renders the operational control-room view.
- Dashboard uses calculated bookings / route plan data rather than hard-coded "Build flow health" values.
- Last-week/current-week pulse, operational week board, resource-use views, decisions/blockers and 14-day delivery watch render.
- Dashboard blockers retain the guided Resolve workflow.
- Management KPI page renders a reduced decision-focused metric set.
- Old wall-of-tables KPI sections are removed from the primary management view.
- KPI trend, forward-capacity, bottleneck and recurring-issue visuals render.
- Workspace summary is non-sticky and responsive to prevent content rendering behind the top tiles.

## Static / deployment checks

`python verification-static.py` — **31/31 PASS**

Includes GitHub Pages root structure, relative assets, cache-busted 1.0.17 URLs, mobile breakpoints, modal safety, guided workspace, planning/master-data controls, calibration certificate controls and decision-focused KPI outlook.

## JavaScript syntax

`node --check` passed for `app.js`, `core.js`, and `services.js`.

## Browser automation note

No claim is made for exhaustive real-Chrome/Android automation in this environment. The focused runtime harness executes the render functions with seeded application state; final phone/browser acceptance remains the deployed GitHub Pages test.
