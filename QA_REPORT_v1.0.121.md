# LabOS REV 1.0.121 — focused QA report

## Result

PASS for the corrected and extended sister-lab operation-routing flow in the static POC test environment.

## Root cause reproduced

REV 1.0.120 opened the loading dialog correctly but then attempted to write the result into `#modalRoot .modal-body`. `openModal()` renders the supplied body directly under `.modal` and does not create `.modal-body`. Therefore the comparison could finish in code while the visible dialog remained permanently on the spinner.

REV 1.0.121 replaces that path with a dedicated operation-routing result container and checks that it still exists before every update.

## Core/service qualification

A Node execution harness loaded the shipped core, services and demo-data runtime and exercised all active canonical process/test operations:

- Active executable process tasks checked: **45**.
- Sister-lab process alternatives generated: **90 / 90**.
- Feasible process alternatives in the current demo state: **90**.
- Active formal test tasks checked: **24**.
- Sister-lab test alternatives generated: **48 / 48**.
- Feasible test alternatives in the current demo state: **47**; one intentionally blocked alternative remains represented as a structured blocker.
- No comparison threw an unhandled error.

An equipment-backed process example was explicitly verified: an Electrical Test process initially using `EQ-008` at Twente produced valid Stuttgart and Detroit alternatives with sister-lab equipment assigned by the canonical planner.

## Accepted process-step transfer qualification

A process step was accepted at Stuttgart while its build remained assigned to Twente. Verified after acceptance:

- build `executionSiteId`: unchanged;
- `taskSiteOverridesV1170[stepId]`: Stuttgart;
- resulting booking site: Stuttgart;
- booking `taskKind`: `process`;
- `remoteExecution`: true;
- generic state invariants: 0 findings;
- planning-integrity audit: 0 findings.

## Mobile UI execution

Because direct navigation to localhost/file URLs is blocked by administrator policy in the execution environment, the shipped runtime was loaded into Chromium as one inlined document at a **390 × 844** viewport. This executes the same shipped JavaScript and UI code without changing the application logic.

Verified:

- application reached `__PROTOLAB_READY__ === true` with no page/console errors;
- a future process booking opened the Planned Task popup;
- popup displayed **Route only this operation to a sister lab →**;
- routing dialog progressed beyond the spinner and rendered both sister-lab results;
- both available sister-lab process options were selectable in the exercised case;
- accepting Stuttgart kept the build at Twente and moved only the selected process booking to Stuttgart.

## Static/package checks

- JavaScript syntax: PASS.
- Current runtime references: REV 1.0.121.
- IndexedDB schema: 35, unchanged.
