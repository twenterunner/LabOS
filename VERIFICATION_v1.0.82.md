# LabOS REV 1.0.82 — verification

This release specifically verifies the two defects reported after REV 1.0.81 rather than relying on source-string presence alone.

## Static/source checks
- Version and cache-bust identity are REV 1.0.82.
- Final active portfolio/resource swimlane renderer contains month, ISO CW, weekday, date and full-lane weekend bands.
- Final active build-workspace swimlane renderer contains the same calendar structure.
- The old material blocker self-link (`Open material resolution` → `data-workspace-tab="materials"`) is absent from the stage-issue path.
- Material assessment supports controlled incoming lab supply without treating it as physical issue.
- All release JavaScript files pass `node --check`.

## Runtime planning/material checks
- Fresh demo planning-integrity audit remains clean.
- A lab-supplied request with sufficient exact stock becomes planning-ready after exact reservation.
- A four-line 123-unit true-shortage fixture becomes planning-ready only after owner + date + controlled reference are recorded as incoming supply.
- Future supply sets the planner material date but leaves Build Readiness false.
- Physical receipt creates real lot inventory and reserves it to the exact BOM.
- Issuing those reservations makes Build Readiness true.

## Browser UI regression
Chromium is loaded through an in-memory document rather than localhost navigation (localhost is blocked by this environment). The actual `core.js`, `demo-data.js`, `repository.js`, `services.js`, `app.js` and `styles.css` are executed.

The test verifies:
- 8-week Planning view: 56 visible calendar cells with month/CW/weekday/date/AM/PM;
- disabled-weekend shading exists in the complete swimlane tracks;
- global `− / Fit / +` zoom controls are all active;
- planned build workspace renders month/CW/weekday/date and complete-lane weekend shading;
- an unplanned build renders a 14-day calendar skeleton with the same fields and grey weekends when expanded;
- workspace `− / Fit / +` controls are all active;
- **Open material resolution** opens an actual root-cause modal;
- exact-stock reservation changes application state;
- the zero-stock 123-unit shortage path records incoming supply, exposes receipt, reserves received lots and supports final issue;
- no browser page errors occur during the tested flows.

See `VERIFICATION_RESULTS_v1.0.82.txt` for the executed result set.
