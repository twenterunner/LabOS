# LabOS REV 1.0.80

## Manual planning is now conflict-visible before the user chooses

- Replaced the REV 1.0.78 free-slot guess-and-reject experience with a staged manual-planning workflow built on the same end-to-end move simulations already used by the visual planner.
- Every planned process/test can open alternatives classified in disruption order:
  - **Tier 1 / Green:** current qualified capability, no other build moves.
  - **Tier 2 / Yellow:** prevalidated training/qualification recovery, no other build moves.
  - **Tier 3 / Red:** another build must move; quantified cross-build impact is shown and explicit approval/rationale is required before staging.
- The current draft slot shows conflicts immediately, including lab closures/capacity events, calibration-maintenance-training reservations, resource overlaps, invalid readiness, qualifications and disabled weekends.
- Alternatives are staged only in a temporary planning draft. Nothing changes in the live plan until **Save manual plan**.
- Saving performs a stale-plan guard, conflict scan and invariant validation before atomically replacing the live plan.
- If a build has no schedule yet, a scratch AUTO-PLAN baseline is generated only inside the manual draft so the planner has validated activities from which to choose.

## Swimlane calendar context

- Main swimlane headers now show month, ISO calendar week (`CW`), weekday and day number.
- With weekend planning disabled, Saturday/Sunday columns are shaded through every swimlane track, not only in the date header.
- The detailed build swimlane date labels also include month and CW.

## Lab closure and hard-capacity replanning

- A future booking lock no longer overrides an explicit hard planning situation that removes its capacity (whole-lab closure/capacity block, equipment outage, or staff absence).
- Feasible locked bookings are now treated as fixed assignments and are not recreated a second time during AUTO-PLAN; if a lock itself becomes infeasible, the proposal releases and replans it rather than producing duplicate task bookings.
- Portfolio AUTO-PLAN removes those infeasible locks before calculating the new schedule, allowing every affected open-build activity to be replanned.
- Planning-event preview includes a final lab-closure overlap safety gate. If even one open planned activity remains inside an active whole-lab closure, the proposal cannot be accepted.
- Existing REV 1.0.79 browser data is also reconciled on first REV 1.0.80 load: if an already-saved whole-lab closure still contains future open-build work, LabOS recalculates that portfolio automatically, preserves commitments, and surfaces any resulting commitment decisions.

## Compatibility

- Built directly on REV 1.0.79 and retains the 24-request power-tool demo portfolio, E0/E1/V/P profile mapping, readiness/planner semantic consistency, sticky Lab Standards & Resources navigation, 5S scroll preservation, zoom controls and prior planning governance.
