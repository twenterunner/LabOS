# LabOS REV 1.0.71

## Unified role home
- Dashboard and Action Centre are consolidated into one role-specific **My Work** navigation destination.
- The standalone Action Centre navigation entry is removed.
- Mandatory actions assigned to the current user/role and assigned improvement proposals are shown directly in the role dashboard.
- The separate top “next/team action” tile is suppressed.

## Planning move UX
- Feasible move choices are highlighted directly on the planning swimlane instead of being listed in a separate timeslot column.
- Green = feasible with currently qualified staff/capable equipment and no other build movement.
- Yellow = feasible after a prevalidated staff-training action; user accepts or rejects training + move.
- Red = feasible only by moving other builds; LabOS quantifies affected builds, booking movements, forecast shifts and lateness before user approval.
- Green internal moves apply immediately without a second approval.
- The same in-lane move mode is used in the main Planning screen and the build-plan swimlane.

## Guard rails
- Alternatives are still simulated end-to-end before being exposed.
- Planning fingerprints invalidate stale alternatives if the live plan changes.
- Calibration, maintenance, training reservations, staff absence and lab closures remain hard constraints.
