# LabOS REV 1.0.106 changelog

REV 1.0.106 builds on REV 1.0.105 and keeps schema 35. It addresses the dashboard/header formatting issue visible in compact desktop-mode layouts and makes Scenario Lab recommendations decision-useful instead of showing alternatives that do not improve the baseline.

## Responsive formatting
- Preserves the collapsed-sidebar hamburger as the first visible top-bar control on compact desktops, tablets and mobile browsers using desktop mode.
- Prevents top-bar controls from pushing navigation off-screen; search/role controls yield space before navigation does.
- Daily Operations Check proposal cards now reserve full width for proposal text and place actions below it, preventing one-character vertical text columns.
- Added additional min-width / wrapping protection for proposal labels and top-bar controls.

## Scenario Lab Stage 2
- Defines a clear **scenario baseline**: the current accepted plan with the selected scenario assumption applied, before optimization. LIVE data is still untouched.
- Candidate alternatives are now filtered by the selected decision objective. **Only verified alternatives that beat the scenario baseline are shown.**
- Options with unresolved target plans or residual scenario conflicts are suppressed.
- Non-improving candidates are counted and reported rather than presented as recommendations.
- Added an overview comparison table with baseline plus every surviving optimization scenario, including target finish/status, network OTD, portfolio late days, scenario conflicts, worsened projects, moved bookings, incremental cost and the quantified improvement vs baseline.
- Each scenario card now explicitly states why it is better than baseline.
- If no candidate improves the baseline, LabOS tells the user to keep the baseline (or change assumptions when the baseline is structurally infeasible) rather than proposing a worse option.
- Apply-to-LIVE now rejects any option that was not verified as an improvement over baseline.

## Preserved
- Same canonical planner for AUTO PLAN, manual replanning and Scenario Lab.
- Same multi-lab / sister-lab framework, external benchmark logic, audit trail and undo behavior.
- Same IndexedDB schema **35**; no reset or migration required.
