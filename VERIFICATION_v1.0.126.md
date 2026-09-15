# LabOS REV 1.0.126 — Verification Summary

**Date:** 15 September 2026  
**Base:** REV 1.0.125  
**Schema:** 35

## Static/runtime package checks
- All five JavaScript runtime files: `node --check` PASS.
- Manifest JSON: parse PASS.
- `index.html` references only REV 1.0.126 runtime filenames.
- Version badge/runtime core: REV 1.0.126 / `1.0.126-poc`.
- ZIP integrity: PASS.

## Fresh-state regression
- Demo requests: 24.
- Current planned bookings: 81.
- State invariants on fresh startup model: **0**.
- Planning-integrity findings: **0**.
- Expected seeded planning blocker: P26-1023 / Detroit / High-speed vibration (`ZERO_EQUIPMENT_CAPABILITY`). This is intentional guided demo data, not a regression.

## Exact manual-move failure reproduction and repair
The REV 1.0.125 planner was exercised directly. A valid manual plan rebuilt the selected canonical task with a **new booking ID** while removing the old ID. This reproduces why the old commit transaction could not find its prevalidated target.

The REV 1.0.126 commit path was then exercised with an actual shifted feasible task:
- old booking ID absent after replan: expected;
- canonical `requestId + stepId` target present: PASS;
- applied start exactly equals prevalidated target: PASS;
- reason category/explanation retained: PASS;
- post-commit invariants: **0**.

## KPI period / business-unit checks
Custom period test: **15 Sep 2026 → 31 Oct 2026** at Twente.
- bookings inside period: 33;
- bookings leaking outside period: **0**;
- business units represented: 4;
- time and direct-resource cost positive for each represented unit;
- same KPI booking query against Jan 2035: 0 bookings.
- KPI HTML render contains selected-period basis, Internal network utilization, business-unit Time/Cost pie controls, replan causes and KPI definitions.

## Network/planning regression after changes
All active canonical routable tasks in the fresh portfolio were compared with both active sister labs:
- canonical routable tasks: 169;
- sister-lab alternatives evaluated: 338;
- feasible alternatives: 298;
- structured blocked alternatives: 40;
- unhandled task-context exceptions: **0**.

## Browser qualification boundary
Direct Chromium navigation in this execution environment did not complete reliably and was terminated after timeout. Therefore this report does not claim a physical Android/browser-origin qualification. The exact domain transaction that caused the reported error, the corrected commit path, state/integrity logic, KPI calculations, render-generation code, package syntax and archive integrity were tested directly. A quick physical-device smoke check after GitHub Pages deployment remains appropriate.


## REV 1.0.126 manual/AUTO-PLAN policy verification
- REV 1.0.125 hard-lock reproduction: PASS.
- Soft manual-delay release via real planner candidate: PASS (27 Oct → 22 Oct).
- Original manual reason surfaced in assessment: PASS.
- Same-metrics synthetic soft refinement: PASS (7 calendar days earlier).
- Explicit protected case suppressed from refinement: PASS.
- Fresh-state invariants: 0.
- Planning-integrity findings: 0.
- Sister-lab routing sweep: 169 tasks / 338 alternatives / 0 exceptions.
- AUTO PLAN tier sweep: 21 open/non-final builds / 0 exceptions.
