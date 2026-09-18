# LabOS REV 1.0.187 — Reliability / Architecture Rebuild QA

## Release basis

REV 1.0.187 is built from the latest REV 1.0.185 package, with REV 1.0.151 and REV 1.0.98 used as regression and architectural references. It is not a rollback.

## Core changes verified

- Canonical `PlanningEngine` is the public scheduling core for Prototype and Validation planning.
- Validation split/parallel dependencies are preserved into scheduling rather than flattened into a sequential list.
- Manual/locked bookings are hard commitments; invalidated locks stop replanning with `LOCKED_BOOKING_CONFLICT` instead of silently moving.
- Planning horizon is bounded; infeasible work stops rather than drifting into absurd distant dates.
- Whole-programme and task-level sister-lab comparison/transfer use the same constrained planner.
- Process-development matching prioritizes explicit route-step linkage and prevents duplicate/missing development bookings.
- Closed Validation programmes resolve to terminal workflow state without false Planning blockers.
- Canonical workflow/readiness/reporting/lessons facades provide stable service entry points for UI compatibility.

## Automated regression result

The repeatable Node regression harness is in `qa/run-regression.js`. It covers 24 golden end-to-end domain scenarios, deliberate negative/failure tests, architecture invariants and the repository persistence contract.

Current result: **40 PASS / 0 FAIL / 40 total**.

See `VERIFICATION_MATRIX_v1.0.187.md` and `qa/regression-results-1.0.187.json` for the scenario-level evidence.

## Browser verification

Browser runtime and real IndexedDB checks are reported separately after Chromium verification. Node persistence uses the repository's documented memory fallback because Node does not expose browser IndexedDB.

## Release rule

A green UI toast, modal opening, or source-level hook is not treated as proof of business completion. PASS means the tested domain action completed with the expected state/result and, where applicable, survived the repository save/export/reset/import contract.

## REV 1.0.187 deployment-package integrity correction

REV 1.0.187 supersedes the incomplete REV 1.0.186 ZIP packaging. The release ZIP now contains the complete runtime dependency set referenced by `index.html`, including core, demo data, repository, services, canonical planning, reliability, application runtime, styles, icons/manifest, user manual, QA harness and deployment metadata. A static dependency audit verifies that every local `script`, stylesheet, icon and manifest reference in `index.html` exists in the ZIP root. The complete packaged runtime was then re-run through the regression harness with **40 PASS / 0 FAIL**.
