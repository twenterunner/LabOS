# LabOS REV 1.0.127 — Verification Summary

**Date:** 15 September 2026  
**Base:** REV 1.0.126  
**Schema:** 35

## Static/runtime package checks
- All five JavaScript runtime files: `node --check` PASS.
- Manifest JSON: parse PASS.
- `index.html` references only REV 1.0.127 runtime filenames.
- Version badge/runtime core: REV 1.0.127 / `1.0.127-poc`.
- ZIP integrity: PASS.

## Fresh-state regression
- Demo requests: 24.
- Current planned bookings: 81.
- State invariants on fresh startup model: **0**.
- Planning-integrity findings: **0**.
- Expected seeded planning blocker: P26-1023 / Detroit / High-speed vibration (`ZERO_EQUIPMENT_CAPABILITY`). This is intentional guided demo data, not a regression.

## Exact manual-move failure reproduction and repair
The REV 1.0.125 planner was exercised directly. A valid manual plan rebuilt the selected canonical task with a **new booking ID** while removing the old ID. This reproduces why the old commit transaction could not find its prevalidated target.

The REV 1.0.127 commit path was then exercised with an actual shifted feasible task:
- old booking ID absent after replan: expected;
- canonical `requestId + stepId` target present: PASS;
- applied start exactly equals prevalidated target: PASS;
- reason category/explanation retained: PASS;
- post-commit invariants: **0**.

## Controlled Business Unit checks
- configured demo Business Units: **5**;
- active Business Units: **5**;
- Project Teams with a stable Business Unit ID: **6 / 6**;
- demo requests with a stable Business Unit snapshot: **24 / 24**;
- demo request allocation: **5 / 5 / 5 / 5 / 4** across the five Business Units;
- duplicate Business Unit invariant findings: **0**;
- dangling Project Team/request Business Unit references: **0**;
- legacy free-text migration to master record: PASS;
- Business Unit rename by stable ID: PASS;
- Project Team reassignment while historical request retains prior Business Unit ID: PASS.

The existing selected-period KPI query and Time/Direct resource cost pie remain driven by the request Business Unit resolved from controlled master data.

## Network/planning regression after changes
All active canonical routable tasks in the fresh portfolio were compared with both active sister labs:
- canonical routable tasks: 169;
- sister-lab alternatives evaluated: 338;
- feasible alternatives: 300;
- structured blocked alternatives: 38;
- unhandled task-context exceptions: **0**.

## Browser qualification boundary
Direct Chromium navigation in this execution environment did not complete reliably and was terminated after timeout. Therefore this report does not claim a physical Android/browser-origin qualification. The exact domain transaction that caused the reported error, the corrected commit path, state/integrity logic, KPI calculations, render-generation code, package syntax and archive integrity were tested directly. A quick physical-device smoke check after GitHub Pages deployment remains appropriate.


## REV 1.0.127 manual/AUTO-PLAN policy verification
- REV 1.0.125 hard-lock reproduction: PASS.
- Soft manual-delay release via real planner candidate: PASS (27 Oct → 22 Oct).
- Original manual reason surfaced in assessment: PASS.
- Same-metrics synthetic soft refinement: PASS (7 calendar days earlier).
- Explicit protected case suppressed from refinement: PASS.
- Fresh-state invariants: 0.
- Planning-integrity findings: 0.
- Sister-lab routing sweep: 169 tasks / 338 alternatives / 0 exceptions.
- AUTO PLAN tier sweep: 21 open/non-final builds / 0 exceptions.
