# LabOS REV 1.0.83 — root-cause proof

## 1. Missing sticky menu: proven render-order defect

REV82 contained a dedicated Lab Standards & Resources navigator, but the final render chain also ran the generic `installSectionNavigator()` implementation. That generic function explicitly removed `.section-jump-nav`, and the active render ordering meant the specialist menu could be replaced after it had been created. The symptom was therefore not a CSS z-index problem: the wrong navigator survived the render chain.

REV83 makes the specialist menu authoritative at the final render boundary. After the base render and legacy installers have finished, `installStandardsStickyV1083()` removes stale generic/superseded navigation and inserts exactly one `.standards-sticky-v1083`. Governance now has an explicit DOM target (`std-governance`) instead of a text-match heuristic.

Chromium proof: one specialist navigator, zero generic navigator, computed `position=sticky`, and its top remained 72 px after the page was scrolled by 1200 px. All seven links were present.

## 2. ADAS Sensors in a power-tool request: proven stale master-data defect

REV82 had two inconsistent concepts. The newer demo requests already used power-tool-oriented engineering-team labels, but the global `state.teams` seed still contained ADAS Sensors, Powertrain Electronics, Thermal Systems, Chassis Controls, Electrification and Advanced Engineering. The New prototype request wizard read directly from that old array and defaulted to its first entry. There was no UI master-data owner for the list.

REV83 creates a controlled Requesting teams master under Lab Standards & Resources and makes it the source for request creation. Fresh demo state uses six power-tool/general engineering teams. Existing demo states receive a one-time mapping of only the known legacy demo labels; custom organization-specific labels are not generalized or destroyed.

Service-layer proof: a request with no team is rejected; a request with an active controlled team is accepted. Chromium proof: Admin starts blank, while Engineering requester U01 inherits `Power Tool Platform`; the old ADAS label is absent.

## 3. AUTO-PLAN robustness: failure-state and selection weaknesses

The production planner already searched feasible time windows, but a thrown exception after intermediate mutations could leave an in-memory partially changed plan. Resource pairing also emphasized earliest finish and could over-focus on a preferred person rather than use equally timely, more robust capacity. At portfolio level, timing strategies did not expose enough of their collateral effect to the reviewer.

REV83 addresses all three failure modes:

1. A transaction snapshot wraps every AUTO-PLAN run. Any error restores the original state before rethrowing.
2. A final planning-integrity audit rejects a target plan with equipment readiness, qualification, resource overlap, hard planning-event or capability mismatch.
3. Near-equivalent resource candidates are scored by readiness work, preference, validity margin, near-term load and deterministic tie-breaks. Portfolio strategies are then scored by requested-date attainment, commitment damage, external movement/delay, booking churn and readiness intervention count.

Runtime rollback proof deliberately changed the first pending task to an impossible capability. AUTO-PLAN raised `ZERO_EQUIPMENT_CAPABILITY`; serialized state after failure was exactly equal to the state before the call.

Runtime resource proof used Electrical Bench B (EQ-008) as calibration-expired and Electrical Bench A (EQ-007) as ready for the same capability, with no competing bookings. AUTO-PLAN selected only EQ-007, scheduled zero avoidable EQ-008 readiness actions, reproduced the same selection on a second fresh state, and finished with zero integrity-audit findings.

Portfolio proof considered three strategies for P26-1001. Build-only missed the requested date by 7 days. Selective ripple met the date with 13 other builds moved, 1 aggregate external-delay day, 101 booking changes and 1 readiness intervention. Target-first also met the date but moved 20 builds, caused 65 external-delay days, 175 booking changes and 3 readiness interventions. The optimizer selected Selective ripple and reported zero hard integrity conflicts.
