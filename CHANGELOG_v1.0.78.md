# LabOS REV 1.0.78

## Manual planning
- Added **Manual plan** alongside AUTO-PLAN in both the main Planning view and individual build planning.
- Manual planning opens one controlled schedule sheet covering the route plus requested test/development activities.
- The planner/user selects the day, Morning/Afternoon window, technically valid equipment and qualified person for each activity.
- Suggested values are only an editable starting point; nothing is committed until **Save manual plan**.
- Manual plan validation rejects equipment-capability mismatches, unavailable/unready equipment, expired/missing qualifications, resource-care conflicts, planning situations, double bookings, disabled weekends and dependency/order violations.
- Morning/Afternoon means a planning window, not an exact minute: LabOS selects a conflict-free start inside that half-day while retaining AM/PM resolution in the UI.
- A valid manual plan becomes the reviewed resource plan and exposes **Commit forecast** as the next controlled action.

## Swimlane zoom
- Added persistent **− / Fit / +** controls to the main swimlane planner.
- Build-plan swimlane zoom controls are no longer disabled at the previous discrete limits; all three controls remain interactive.
- Build zoom now uses continuous scaling, while Fit returns to the entire-build view.

## Replan reason KPI
- Build Commitment Health now displays the latest accepted replan reason/category for each affected build.
- Added **Planning Stability – Why are committed dates being replanned?** to Lab Performance/KPIs.
- Replan causes are grouped by reason category with replan count, builds affected, net movement, churn days and latest example.
- The KPI is sourced from the same immutable commitment history already used for commitment control, preserving audit traceability.
