# LabOS REV 1.0.118

This build fixes the mobile swimlane tap/drag conflict while preserving the qualified REV 1.0.117 planning and single-test sister-lab engine. IndexedDB schema remains 35.

## Deploy

1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.118_WEB.zip`.
2. Upload **all files and the assets folder** to the same GitHub Pages repository/folder.
3. Replace the prior release files.
4. Reload the site and confirm the header shows **REV 1.0.118**.

## REV 1.0.118 focus

Manual planning is now date-based rather than hour/minute based. Tapping a future process/test and choosing **Move / replan this step** opens a date-level search through the same constrained planning engine as AUTO-PLAN. The visible chart range is not a planning horizon. LabOS searches beyond it and surfaces the next complete feasible day; controlled readiness creates Yellow options, while structural equipment/skill blockers route into guided recovery.

No schema reset is required (schema 35).

### Mobile planning hotfix
Tap a planning bar to open Planned Task. On phones/tablets, movement is started explicitly from the dialog; on desktop only the small grip is draggable. Tests expose **Send only this test to a sister lab →**.
