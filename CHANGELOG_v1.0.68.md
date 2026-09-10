# LabOS REV 1.0.68

## Planning decision simplification
- Replaced the separate actionable **Commitment decisions** control and **PREVIEW OPTIMIZED PORTFOLIO** workflow with one controlled **REVIEW & OPTIMIZE PLAN** decision.
- Existing committed-date movements are shown inside that one review and are recorded together with the accepted resource/forecast plan. The original commitment remains immutable in commitment history.
- The commitment-movement tile is now informational only; it explicitly states that movement is included in plan review.
- Dashboard planning-decision actions route into the same unified review instead of opening a second commitment workflow.

## Technically correct resource planning
- Added an explicit planning-capability layer for the built-in demo equipment and processes instead of relying on the old rotating generic capability assignments.
- Programming / Flashing is planned on the Programming Rig; laser welding is planned only on the laser welders; electrical, leak, dimensional, torque, environmental and optical work use their matching resource classes.
- Added corrected planning competencies for the standard process library.
- Existing demo bookings are repaired on upgrade where a legacy booking is on the wrong technical resource. A booking that cannot be safely reassigned at its existing time is shown as **Unassigned / resource gap** rather than on the wrong machine.
- AUTO-PLAN and drag feasible-slot selection use the same technical capability model.

## Swimlane interaction
- Planning swimlane build items no longer navigate immediately when clicked.
- Clicking an item opens a small confirmation/details dialog with **Stay in planning** and **Open build**.
- Dragging remains available directly from the swimlane and still uses constrained feasible-slot logic.

## Verification
- Full demo portfolio AUTO-PLAN completed with zero planner failures.
- 198 generated demo bookings were checked against required technical planning capability: zero mismatches.
- Programming / Flashing bookings resolve only to Programming Rig; Laser Welding resolves only to Laser Welder 1/2.
- JavaScript syntax and invariant smoke checks pass.
