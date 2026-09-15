# Verification — LabOS REV 1.0.132

## Acceptance points
1. Selecting a new role updates the active identity and both role selectors.
2. Navigation is regenerated for the newly selected role on every page render.
3. Accessible views remain open during a role switch; inaccessible views have an explicit dashboard fallback.
4. AUTO PLAN never labels an unplanned target as a valid baseline to keep.
5. AUTO PLAN explains which strategy stopped, which concrete resource/readiness condition caused it, and what action is required next.
6. A calibration/training prerequisite can be automatically scheduled and the full build retried from the AUTO PLAN flow.
7. A generic integrity/coverage message is not presented as a second user “approval” when a concrete resource/readiness cause is available.
8. Existing vacations, lab closures, calibration windows and other planning situations remain constraints that the planner works around, not blockers the user is forced to remove.
9. All runtime JS parses successfully and all index runtime assets exist.

## Versioning
Visible application badge, core version and packaged runtime asset names are REV 1.0.132.
