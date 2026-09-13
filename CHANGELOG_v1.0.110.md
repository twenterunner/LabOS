# LabOS REV 1.0.110 changelog

REV 1.0.110 fixes the confirmed multi-lab Planning KPI scoping defect in REV 1.0.109. IndexedDB schema remains **35**.

## Fixed
- The six Master Planner health tiles now use only builds assigned to the selected laboratory by `executionSiteId`.
- `All`, `On time`, `Late builds`, `Total days late`, `Commitment movement`, and `Unplanned` now change when the Active lab changes.
- Build Commitment Health now lists only builds in the selected execution laboratory.
- Planning health filters use the same active-lab request set as the tiles and Commitment Health list.
- The post-render planning enhancement now re-enters active-lab scope before rebuilding KPI cards and grouped calendar headers; enterprise state can no longer leak back into those local planning elements.
- The planning-health helper treats an explicitly supplied empty row list as empty instead of falling back to the full enterprise portfolio.

## Transfer semantics retained
A sister-lab transfer remains an execution-site change. Once accepted, the build contributes to the receiving laboratory's operational planning metrics. Home-site and transfer history remain retained for traceability.

## Preserved from REV 1.0.109
- Shared readiness/resource-care ownership and whole-portfolio transfer integrity gates.
- Scenario Lab LIVE-baseline qualification and stale-scenario protection.
- AUTO PLAN optimization vs recovery-trade-off separation.
- Input/calendar/sample boundary guards.
- Compact Android role selection and responsive fixes.

## Compatibility
No database migration is required. Schema remains 35.
