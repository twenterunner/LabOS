# LabOS REV 1.0.131 — capacity-event replanning and build-change resolution

## Fixed
- Planning situations such as vacation, lab closure, equipment outage and other capacity restrictions no longer require every affected build to be fully resolvable before the event can be accepted.
- The preview now calculates and presents the best feasible portfolio around the new operating constraint. Builds that cannot be completely scheduled are left unplanned / at risk instead of blocking the situation.
- Calibration, maintenance and training reservations use the same non-blocking capacity policy for affected build plans. Fixed readiness/readiness or lab-event collisions remain invalid because two hard reservations cannot occupy the same controlled capacity.
- The planning-situation review explicitly distinguishes consequences from prerequisite blockers.
- Build Readiness no longer becomes the first place a pending reused-document/build-specific change approval appears. Route/work-instruction changes are owned by the definition/process-risk step; Control Plan/other controlled-document changes are owned by the controls step.
- The yellow “Resolve approvals” path now opens the real consolidated build-specific change sign-off package and can actually clear the approval records.

## Revision governance
- Runtime assets, visible header badge, boot text and deployment cache-busting references are synchronized to REV 1.0.131.
