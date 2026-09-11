# LabOS REV 1.0.94

## Master Planner

- Replaced repeated per-day month/week labels with three aligned bands: month + year, ISO week-year, and weekday/date with AM/PM.
- Added **Total days late** across open-build forecasts.
- Made Build commitment health tiles actionable filters and added **All**, **On time**, **Late**, **Unplanned**, and **Commitment movement**.
- Removed **Detailed bookings and estimate basis** from the planner page.
- Corrected probability normalization so 70% is stored and rendered as `0.70`, not 7000%.

## Tiered planning

- Tier 1 compares valid constrained strategies and favors the least disruptive high-quality proposal.
- Cross-project worsening is rejected unless the weighted total lab objective improves.
- Tier 2 Yellow alternatives now explain the required qualification/capacity action and require an explicit decision note before staging.
- Tier 3 retains quantified cross-project impact and rationale.
- Added **Escalation mode**: target project first, then controlled replanning of the remaining portfolio.
- Proposal banners show unplanned builds, total days late, late builds, collateral movement, and whether the overall objective improves.
- Capacity exhaustion now opens a recovery workflow with rebalance, qualification/capacity, and escalation choices; raw solver/horizon messages are not shown.

## Project teams and authorization

- Upgraded requesting teams to provider-neutral project teams.
- Added per-person workflow role and granular request, Control Plan, planning, readiness, quality, release and product-safety approval rights.
- Added identity-provider and external-group fields for future SSO/API integration.
- Approval checks can resolve team rights through stable local or external principals.

## Reliability fixes

- Added missing schema 31→32 and new 32→33 migrations, fixing startup failure for previously stored REV93/older browser data.
- Replaced independently reconstructed route/test lists with one controlled planning-task manifest shared by AUTO-PLAN, the sticky guided flow, the build swimlane and the manual planner.
- Preserved stable controlled sequence numbers when completed work is omitted from a remaining-work plan; completed work is now identified explicitly rather than shown as unplanned.
- AUTO-PLAN now fails closed before presenting a forecast if a process, development, test or final-handover task is missing, duplicated, mis-typed or mislabelled.
- Preserved atomic planner rollback for capacity, resource and integrity failures.
- Retained interval-jump bounded search and final overlap, sequence, working-calendar, capability, qualification and readiness audits.
- Added `verification-v194.js`; 40/40 automated checks pass.
