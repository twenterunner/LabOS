# LabOS REV 1.0.111 — targeted regression and defect-closure report

## Scope

REV 1.0.111 addresses three linked UX/workflow defects reported against REV 1.0.110:

1. the red required-delivery marker disappeared in **Planning → Per build**;
2. tapping a planned task no longer provided a direct manual-replan path into the Green / Yellow / Red feasible-slot workflow;
3. build `P26-1011` could appear trapped in the **Reuse released route / work instructions** stage when `Thermal Soak` was removed and the route was confirmed.

IndexedDB schema remains **35**.

## Root cause — P26-1011 route loop

The loop was not only a duplicate-confirmation UX problem. The Process/Route screen calls the reuse-package resolver on render. After a user removed `Thermal Soak`, the route was correctly marked as a build-specific delta and reopened for confirmation, but the reuse resolver could copy a reusable baseline route back over the edited route on the next render. That could restore `Thermal Soak`, making the same readiness blocker reappear.

REV 1.0.111 prevents automatic route reuse from overwriting a route whose reuse-package state is already `modified`. The edited route remains intact until the user explicitly confirms it.

A second source of loop-like behavior was also removed: once the edited route is technically ready, **Confirm route** now records both route confirmation and the explicit route/method review in the same controlled action, then advances the guided workflow to the next incomplete stage. A second “Confirm route & methods” action is no longer required.

## Functional changes

### Per-build required-delivery marker

Every task lane in the selected build now resolves its due-date source from the selected `requestId`. The red required-delivery line therefore remains visible across all task/test lanes in Per Build.

### Direct manual replan

Tapping/clicking a future planned task opens the planned-item panel with **Move / replan this step →**. That action closes the information panel and opens the existing validated manual-move engine, which exposes Green / Yellow / Red alternatives. Historical or completed work is explicitly locked and cannot be moved.

### Governed revision consistency

Process planning assessment and guided blocker resolution now resolve the exact process revision stored on the route. An unavailable historical revision fails closed instead of silently falling forward to the current library revision. This aligns the workflow gate with `ReadinessService`.

## Verification results

| Test | Result |
|---|---|
| JavaScript syntax — all runtime JS | PASS |
| REV / runtime asset references | PASS |
| Baseline domain invariants | PASS — 0 findings |
| Baseline planning integrity audit | PASS — 0 findings in all 15 categories |
| AUTO PLAN regression | PASS — baseline remains 4 unplanned / 9 total late days / 6 d max delay; 9 strategies; 0 false optimizations; 1 recovery trade-off; no false recommendation |
| `P26-1011` initially reports Thermal Soak release blocker | PASS |
| Remove Thermal Soak and mark route as build-specific modification | PASS |
| Re-render/reuse-package evaluation does **not** restore Thermal Soak | PASS |
| Edited route remains unconfirmed until explicit user confirmation | PASS |
| After confirmation, process planning assessment is ready | PASS |
| After confirmation, `Processes released` readiness blocker is absent | PASS |
| Subsequent reuse-package evaluation still does not restore removed step | PASS |
| Missing exact historical process revision fails closed | PASS |
| Per-build timeline source contains selected-build due-date resolution | PASS |
| Planned-item panel exposes direct manual-move action | PASS |
| Direct move action invokes current Green/Yellow/Red move engine | PASS |
| Route/process/method/test edits reopen process review | PASS |
| Route/process/method/test edits reopen applicable-controls review | PASS |
| Schema unchanged | PASS — 35 |

## Qualification boundary

The deterministic core/service regressions and package/source checks were executed in this environment. A container Chromium smoke attempt did not complete reliably, so this report does **not** claim a physical Android-device browser qualification. The targeted defect logic was reproduced directly against the seeded `P26-1011` state and the same reuse/readiness services used by the application.
