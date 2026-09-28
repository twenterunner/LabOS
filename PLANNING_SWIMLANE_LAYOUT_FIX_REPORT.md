# LabOS REV 1.0.185 · Planning Swimlane Layout Fix TEST-4

## Scope
Focused canonical Planning UI correction requested during browser acceptance. No PlanningEngine feasibility, booking, network-transfer, readiness, workflow, execution, or persistence rules were changed.

## User-visible corrections
- Canonical Planning swim lanes now use the full available viewport width: desktop from the fixed sidebar edge to the right viewport edge; mobile uses the full device width.
- Removed the fixed 4/8/13-week Horizon selector from the canonical Planning UI.
- Removed the FIT control from canonical Planning. The only visible temporal zoom controls are `−` and `+`.
- The displayed date range is derived from actual visible bookings, required/forecast/commitment dates and potential-project dates, rather than a fixed week-span selector.
- Added a three-level calendar axis: Month, ISO calendar week (`CW nn`) and Day.
- The calendar header is sticky while the swim-lane body scrolls vertically.
- The Programme / project corner remains sticky horizontally and vertically.
- Project-column text is constrained to its project cell with controlled wrapping/clamping; lane actions remain inside the project column.
- Planned-work labels are contained inside their booking bars and use ellipsis instead of spilling into adjacent time columns.
- Portfolio lane minimum height was increased so project identity, dates and actions fit within the matching lane row.

## Automated regression evidence
Focused Planning layout QA: 6/6 PASS.

Protected recent corrections re-run:
- Prototype Create Draft: 3/3 PASS.
- Scenario Planner / external-lab restoration: 8/8 PASS.
- Future Projects / KPI: 6/6 PASS.
- Future Project work-package / bounded Scenario: 7/7 PASS.
- Future Project copy-scope modal: 4/4 PASS.

## Headless Chromium render verification
Desktop viewport 1440×1000:
- canonical Planning board x=244, width=1196, i.e. exactly viewport width minus 244px desktop sidebar;
- fixed Horizon selector: absent;
- FIT control: absent;
- one `−` and one `+` zoom control present;
- Month / Calendar Week / Day axis present;
- swimlane scroller has both horizontal and vertical overflow as required;
- header computed `position: sticky; top: 0`; header Y remained unchanged after vertical scrolling;
- project-lane overflow violations: 0;
- booking-bar horizontal overflow violations: 0.

Mobile viewport 412×915:
- canonical Planning board x=0, width=412 — full device width;
- fixed Horizon selector / FIT absent;
- Month / Calendar Week / Day axis present;
- project-lane overflow violations: 0;
- toolbar overflow violations: 0.

## Build identity
`REV 1.0.185 · PLANNING SWIMLANE LAYOUT FIX TEST-4`
