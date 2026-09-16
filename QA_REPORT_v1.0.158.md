# LabOS REV 1.0.158 — QA Report

**Release:** LabOS REV 1.0.158  
**Baseline:** released REV 1.0.157  
**Schema:** 38 (unchanged)

## Scope
REV 1.0.158 concentrates on making Prototype and Validation operate as one LabOS product rather than adjacent applications, with particular emphasis on the high-frequency Validation requirements-to-programme workflow.

## Implemented
- Shared Archive Manager now lists Prototype builds and Validation programmes in one controlled view.
- Any active Prototype build or Validation programme can be archived with a required reason and audit history.
- Archived Prototype and Validation records can be restored from the same manager.
- Validation navigation is now explicitly **1 Requirements → 2 Programme Logic → 3 Resource Plan → 4 Execution → 5 Report & Close**.
- Opening a Validation programme defaults to Requirements. A programme without requirements cannot silently open into the builder.
- New Validation requests finish at the Requirements step instead of the Programme Builder.
- Added a prominent guided **Requirements → mapping → leg-snapped programme** generator.
- Per-requirement mapping is explicit: released Standard Test reuse, adaptation, combined tests, new-method development, or other verification.
- Programme generation remains a draft/review action; mapping proposals do not automatically approve requirement coverage.
- Validation node placement is now snapped to explicit test-leg lanes. Horizontal movement remains layout-only inside a leg.
- Dragging a node into another leg requires an explicit confirmation because that changes controlled programme structure.
- Prototype and Validation both retain the same shared Programme Logic canvas grammar, toolbar language, node-card treatment and shared planning model.
- Existing Twente Validation demo/KPI data, planning, reports, lessons learned, Standard Test promotion, Resource Assurance and Prototype workflows are preserved.

## Static / release checks
- `node --check`: PASS for every release JavaScript file.
- `index.html` local asset resolution: PASS.
- Visible revision badge: REV 1.0.158.
- Runtime asset filenames: REV 1.0.158.
- Shared Archive Manager implementation present.
- Requirements-first Validation tabs present.
- Guided Validation programme generator present.
- Leg-snapping implementation present.
- Schema remains 38; no reset/migration is required.
- ZIP extraction/integrity test: PASS.

## Browser-environment limitation
A fresh headless Chromium file-navigation smoke was attempted in this execution environment, but Chromium did not complete navigation before the environment timeout. This report therefore does not claim a new automated browser-interaction pass for REV 1.0.158. The release was statically validated, syntax checked, packaged, extracted, and integrity checked. A physical/mobile browser smoke remains appropriate after deployment.

## Important planner boundary
Processes/tests may retain multiple equipment-capability and competency associations. The existing constrained planner still uses the primary selected capability/competency as its capacity-driving requirement; simultaneous reservation of several independent machines/people remains a future booking-kernel enhancement rather than being falsely represented as implemented.
