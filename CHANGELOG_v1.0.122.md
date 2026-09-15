# LabOS REV 1.0.122 — changelog

## Sister-lab routing completion

- Removed the remaining process/test-only gate from the Planned Task popup.
- Removed the matching process/test-only gate from `MultiLabPlanningV1170._taskContext`.
- Extended cross-site integrity validation to the complete canonical planning-task set: process, test, development and closeout.
- Corrected the closeout planner branch, which previously hard-coded `homeSiteId`; final quality review / release / handover now respects a governed per-task sister-lab site override.
- Remote closeout bookings retain home-site ownership metadata, are marked as remote execution, include sister-lab transfer lead time before execution, and remain subject to full planning coverage/invariant/integrity validation.
- Generalised the UI wording from “operation” to “step” so users do not need to understand internal task classifications.
- Network KPI descriptions now refer to individual planned steps rather than only process steps/tests.

## Compatibility

- IndexedDB schema remains 35.
- No data reset is required when upgrading from REV 1.0.121.
- Existing Green/Yellow in-swimlane manual replanning and whole-build sister-lab routing are unchanged.
