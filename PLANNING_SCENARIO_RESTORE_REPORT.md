# LabOS REV 1.0.185 — Planning Scenario Restore TEST-1

## Scope
Restore Planning-tab capabilities that were present before the canonical Planning UI transition:

- live planning/capacity events (vacation, staff absence, equipment outage, equipment calibration, equipment maintenance, lab closure, other capacity block);
- the what-if Scenario Planner / Scenario Lab on the canonical Planning screen;
- task-level outsourcing of an eligible planned test to an external laboratory.

## Root cause
The underlying capacity-event and scenario services were still present. The canonical Planning renderer no longer rendered the legacy capacity-event controls, while the Scenario Lab injector explicitly skipped pages containing `[data-canonical-planning]`. External execution services and task-scoped transfer architecture also remained available, but the direct planned-test entry point had disappeared from the canonical planning-item UI.

## Correction
- Added a canonical Planning panel for active capacity events with Add, Edit and Revoke actions.
- Restored Scenario Lab injection on the canonical Planning page without replacing the canonical PlanningEngine.
- Added explicit `Equipment calibration` and `Equipment maintenance` capacity-event types.
- Added `Outsource this test to external lab` to eligible planned-test detail.
- External outsourcing creates a governed task-scoped external request. It does **not** directly mutate LIVE routing; approval/order conversion remains a separate controlled action.
- Preserved the preceding Prototype Create Draft ownership/persistence correction.

## Automated release checks
- Planning scenario restoration focused suite: **8/8 PASS**.
- Prototype Create Draft regression suite: **3/3 PASS**.
- JavaScript syntax check: **PASS**.

Broader historical Stage-2/Stage-3 suites are computationally long in this execution environment; no failure was observed in the partial runs used during this correction. This TEST-1 build should therefore receive the listed manual browser checks before promotion.

## Manual browser checks
1. Open **Planning** and confirm `Scenario Planner · Live Capacity Events` is visible.
2. Add a staff Vacation event; verify it appears and can be edited/revoked.
3. Add Equipment calibration or Equipment maintenance; verify the correct equipment can be selected.
4. Add a Lab closure and verify the lab selection is available.
5. Open the what-if Scenario Planner / Scenario Lab and verify Person absence, Equipment outage and Lab closure scenarios remain available.
6. Click an eligible planned Prototype test and confirm `Outsource this test to external lab` is available.
7. Repeat for an eligible Validation test.
8. Submit an external test request with quote/RFQ reference, validity and rationale; verify a task-scoped request is created and LIVE execution site is unchanged until governed acceptance/order conversion.
9. Re-test Prototype submission -> Create draft and verify the draft persists.
