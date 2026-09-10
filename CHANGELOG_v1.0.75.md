# LabOS REV 1.0.75

## Guided workflow / blocker resolution
- Reworked guided-build blocker logic so a red action only blocks the workflow stage it actually belongs to; an unrelated open action no longer makes the first incomplete stage look blocked.
- The current workflow stage now states the exact blocker, owner and required resolution.
- Route/method blockers now route directly to the concrete next action: choose route, confirm route, resolve the first method gap, complete planning data/equipment/competency, or define the missing test.
- Build-readiness blockers route to the existing contextual readiness resolver instead of a generic "complete this section" instruction.
- Current route/method actions are presented with the yellow next-action treatment.

## 5S corrective-action flow
- 5S corrective actions no longer open the generic action resolver.
- They open a dedicated correction + recheck workflow for the exact zone and pillar.
- The original audit remains in history; the user records the physical correction, recheck score and verification evidence.
- A recheck score of 4/5 or 5/5 closes the action; lower results remain open.

## Lab Standards & Resources
- Consolidated resource assurance into Lab Standards & Resources and kept the separate Resource Assurance navigation hidden.
- Removed the non-functional section chips next to the search field; search is now a single full-width sticky control.
- Resource assurance is the operational first section and shows calibration, maintenance and training together with resource, due date, reserved out/return window, build impact/next use and status.
- Added manual multi-select scheduling and "Plan all due" actions for 30, 60 and 90 days.
- Equipment, methods, people/competencies and 5S are organized as focused fold-out master sections.
- Costing configuration was removed from the daily lab-resource workspace and placed under Administrator Configuration.
- Navigation/page naming is again simply "Lab Standards & Resources".

## Terminology
- Replaced the ambiguous "Readiness load" wording in Capacity with "Resource assurance work": hours reserved for calibration, maintenance and training.

## Regression protection
- Preserved the v1.0.74 planning-move transaction logic and weekend planning behavior.
- Version/cache-busting updated to REV 1.0.75.
