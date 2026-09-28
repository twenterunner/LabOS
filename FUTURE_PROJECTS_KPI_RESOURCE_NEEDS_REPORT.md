# LabOS REV 1.0.185 · Future Projects + KPI Resource Needs Restoration · TEST-1

## Scope
This build restores the existing potential-project capability to the live canonical Planning route and explicitly features future resource requirements in Lab Performance / KPI.

## Restored / added
- Future Potential Projects can be added, edited and removed from Planning.
- Project entry records project/opportunity name, product, expected lab, expected quantity, probability, expected start, strategic priority, estimated project cost and owner/source.
- Potential projects remain scenario-only. They do not create live bookings or approved programmes.
- The existing `pipelineProjects` model and `ForwardDemandService` remain the source of probability-weighted demand. No new Stage-2 planning algorithm was introduced.
- Planning shows potential projects and their weighted equipment / skill need.
- Lab Performance / KPI now has a dedicated **Future resource needs** section with 13 / 26 / 52 week horizons.
- KPI separates committed work from probability-weighted potential-project demand and shows combined peak weekly load versus capacity.
- Resource status identifies capacity gaps (>100%) and watch items (>85%).
- KPI also shows the potential-project pipeline and weighted demand contribution.
- The final composed canonical Planning renderer is re-registered with the router. This corrects the earlier condition where restoration wrappers could exist in source but the live Planning route still referenced the pre-restoration renderer.
- Scenario Planner live capacity events, What-if Scenario Lab and task-level external-lab outsourcing remain preserved.
- Prototype Create Draft correction remains preserved.

## Focused regression evidence
- Future projects + KPI resource needs: 6 / 6 PASS
- Planning Scenario / external lab restoration: 8 / 8 PASS
- Prototype Create Draft correction: 3 / 3 PASS
- JavaScript syntax: PASS (`node --check`)

A broader Stage-2 graph-suite run was started. Its first 8 graph checks passed, but the suite did not complete within the container execution timeout, so no full Stage-2 regression count is claimed by this restoration package.

## Manual browser acceptance
1. Open Planning and verify **Future projects & expected resource load** is visible.
2. Add a future potential project with an expected lab, quantity, probability and future start date.
3. Verify it appears on Planning without becoming a live approved programme.
4. Open Lab Performance / KPI and verify **Future resource needs** appears near the top.
5. Change the horizon between 13, 26 and 52 weeks.
6. Confirm the project changes probability-weighted equipment / skill demand and the resource table.
7. Edit the project's probability or quantity and verify the KPI demand updates.
8. Confirm Scenario Planner still supports staff absence/vacation, equipment calibration/maintenance and lab closure.
9. Open an eligible planned test and confirm **Outsource this test to external lab** remains available.
10. Verify Prototype **Create draft** still creates and persists a draft.
