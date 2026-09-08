# ProtoLab OS — Verification Report

**Application version:** 1.0.12-poc  
**Schema version:** 6  
**Target:** static GitHub Pages / Chrome / Edge / Android browser

## REV 1.0.12 focus

This revision was verified specifically for the move from one-size-fits-all prototype governance to purpose-based workflow scaling.

| Area | Result | Verification focus |
|---|---|---|
| Purpose scaling | PASS | Four assurance profiles: E0 Rapid Engineering, E1 Controlled Engineering, V Validation / Customer, P Production Intent |
| Safety floor | PASS | Product-safety-relevant work cannot be reduced below Validation |
| Rapid engineering | PASS | Formal Control Plan/PFMEA/release approval/serialisation are not required by default; test-only requests may operate without a process route |
| Controlled engineering | PASS | Lean repeatability/traceability without production/customer release formalities |
| Validation / production intent | PASS | Released methods, controlled risk/Control Plan evidence, genealogy and formal release retained |
| Route from scratch | PASS | Blank build route can be selected and populated operation-by-operation |
| Reuse product standard | PASS | Product default route can be copied into the request |
| Reuse previous build | PASS | Previous build route can be copied without modifying the original historical record |
| Route editing | PASS | Visible move earlier/later, Edit and Remove controls; drag/drop remains optional |
| Control Plan editing | PASS | Draft plans directly editable; editing an Approved plan creates a new Draft revision and preserves the approved revision |
| Guided execution | PASS | Ambiguous “Serialise & execute digital traveller” label removed; UI explicitly explains unit identification and build evidence capture |
| Rapid build-level evidence | PASS | E0 supports build-level execution/results without mandatory unit IDs or a Control Plan |
| Engineering closeout | PASS | E0/E1 can complete as Engineering-use-only without misrepresenting the build as customer/production released |
| Mobile layout | PASS | Route-source choices and route editing controls reflow on narrow screens |

## Automated results

- **29 / 29** REV 1.0.12 domain/static feature checks passed.
- **11 / 11** REV 1.0.12 lightweight UI/runtime rendering checks passed across all four assurance profiles.
- **6 / 6** IndexedDB repository, JSON export/import, reset and migration checks passed.
- **21 / 21** inherited enterprise-governance checks from REV 1.0.6 passed, including governed skills, work instructions, cost master data and improvement proposals.
- **12 / 12** GitHub Pages/static/mobile source checks passed.
- JavaScript syntax checks passed for `app.js`, `core.js`, `demo-data.js`, `repository.js` and `services.js`.
- **9 / 9** principal deployment files returned HTTP 200 from a local static HTTP server.

Total counted current/relevant deterministic checks: **79 / 79 passed**.

Older revision-specific regression scripts were also exercised. Their substantive planning/KPI/equipment tests continued to pass; obsolete assertions that explicitly expected an earlier revision number/schema were not counted as REV 1.0.12 failures.

## Browser-automation disclosure

The application is tested with deterministic Node/VM DOM harnesses, static checks and local HTTP serving. This report does **not** claim full real-Chrome automated interaction. Android/Chrome deployment remains the real-browser acceptance check.

## Data migration

Schema 5 data migrates to schema 6 by assigning a build assurance profile to existing requests while preserving existing request/build history. Existing approved controlled records are not silently rewritten.

## REV 1.0.12 focused verification

Focused checks were added for the three requested changes and executed after implementation:

- Process Library exposes a complete **Edit process** action.
- Editing a released process creates a new Under-review revision instead of silently editing the released revision.
- Process editor includes planning inputs, equipment capability, certified skill, work instruction and required evidence.
- Request-specific created build routes remain editable with Add / Edit / Move / Remove controls.
- Lab Staff section exposes **+ Add staff**, **Edit person**, and certificate actions.
- Staff editing does not directly grant skills; planning competence remains certificate-gated.
- Equipment page exposes **+ Add certificate**.
- Calibration certificate capture includes certificate number, issuer, calibration date, next due date, traceability/reference standard, result and evidence/file reference.
- Existing REV 1.0.11 purpose-based UI regression suite still passes.
- Existing enterprise-governance/process/skills/calibration regression suite still passes.
- `node --check` passed for modified JavaScript.
- Static HTTP serving returned 200 for all 9 principal GitHub Pages files.

Focused REV 1.0.12 test result: **9/9 passed**.
