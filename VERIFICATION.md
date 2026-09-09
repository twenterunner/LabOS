# LabOS REV 1.0.49 Verification

REV 1.0.49 uses **schema 24**. The release was tested against the executable-only workflow contract, governed build execution, large-batch UX, serial search, setup/migration and atomic planning/resource-resolution behavior.

## Current acceptance results

- `verification-node.js` — **46 / 46** core domain/planning checks
- `verification-repository-node.js` — **6 / 6** persistence/migration checks
- `verification-ui-v149-node.js` — **23 / 23** base UI/source regression checks
- `verification-v149-node.js` — **18 / 18** governed execution/Control Plan behavior checks
- `verification-v149-ux-node.js` — **15 / 15** REV 1.0.49 UX, migration and no-dead-end behavior checks
- `scenarios-v149.js` — **10 / 10** realistic disruption/planning scenarios
- `ui-stress-v149.js` — **1,783 / 1,783** role/build/workspace render combinations
- `verification-static-v149.py` — **31 / 31** responsive/static/package checks

**Acceptance total: 1,932 passed / 0 failed.**

## Explicitly verified in this revision

- Large sample registers are collapsed/searchable instead of creating impractical long pages.
- Large execution groups are collapsed/searchable while preserving functional per-sample selection.
- Serial History has search, foldout groups and structured, non-concatenated sample metadata.
- Results & Capability is analytics/review only and does not duplicate governed measurement-entry controls.
- Lab Setup Wizard covers lab scope, customers/internal use, products, people/skills, equipment, readiness evidence, standards and go-live integrity.
- LIMS import supports equipment, calibration, maintenance, staff, competencies, training certificates, products and customers.
- Imported calibration/maintenance/training evidence URLs are retained; equipment/service durations survive import.
- LIMS import is transactional and validated before live-state replacement.
- Improvement Scan suppresses non-executable load-balancing observations.
- A prevalidated staffing load-balance proposal changes the actual booking assignments and verifies the result on acceptance.
- Resource-care duration is editable in the scheduling transaction and updates the master duration.
- Planning-situation preview does not mutate the live capacity state before acceptance.
- Blocked portfolio changes route to the exact guided resolver, and the pending complete solution is retried automatically after resolution.
- Planner blocker results preserve task/skill/capability/staff details needed by the guided resolver.
- v1.0.48 governed process/Control Plan sampling and real execution-group completion gates remain green.

## Environment limitation

A genuine physical-device browser exploratory pass cannot be claimed from this execution environment. DOM/state stress, mobile-responsive/static checks and 1,783 role/build/workspace render combinations passed. Before production release, run exploratory Android/iOS/desktop testing, accessibility testing and real printer/PDF-output checks.
