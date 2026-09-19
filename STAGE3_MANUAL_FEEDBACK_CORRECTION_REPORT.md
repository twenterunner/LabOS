# LabOS Controlled Rebuild — Stage 3 Manual Feedback Correction Report

Date: 2026-09-19
Controlled checkpoint: **STAGE3-GITHUB-TEST-3**
Product revision: **1.0.185**

This build remains a GitHub Pages manual-test checkpoint. It is **not** a Stage-3 RC and does not start Stage 4.

## Feedback classified and corrected inside the 10-stage framework

### Stage 3 — Network / Sister-Lab
1. **Requested receiver work in My Work**
   - Cause: the final canonical Stage-3 My Work wrapper derived only `UnderReview`, `Accepted`, and `InExecution`, assuming an older queue would always supply `Requested`.
   - Correction: canonical receiver workload now derives `Requested`, `UnderReview`, `Accepted`, and `InExecution` through `NetworkRecordAdapter`. Requested items expose the governed receiver review action. No UI-only transfer state was introduced.

2. **Single-test / single-operation routing discoverability**
   - Cause: the canonical Planning bar opened the generic manual-slot modal directly, bypassing the older task-level route entry point even though governed task transfer still existed.
   - Correction: the task manual/replan modal exposes `Route only this test / operation to sister lab`, which continues through the existing V1170 compatibility entry into canonical `TransferScope` / Stage-3 `NetworkTransferService`. No second scheduler or direct SiteAssignment path was created.

### Controlled reopen of Stage 2 — Planning Engine
3. **Future/potential projects missing from Overall Planning**
   - Cause: the canonical Overall board replaced the older integrated swimlane renderer without carrying forward `pipelineProjects` presentation.
   - Correction: Overall Planning again renders potential-project lanes using the existing potential-event/planning data model, with probability and probability-weighted load. Visibility is controlled by the existing `planPotential` filter; data is not deleted when hidden.

4. **Planning perspectives effectively lost**
   - Cause: Overall / Per programme / Per equipment / Per person controls still existed, but canonical event handling depended on older post-render binding rather than owning the view switch.
   - Correction: the canonical Planning event layer now owns `data-plan-view` switching. The four perspectives continue to use the same underlying planning data/kernel; no parallel planner was added.

## Dedicated regression coverage
`qa/stage3-manual-feedback-tests.js` contains **11** cases covering the four findings above, including canonical-state derivation, governed task routing, potential-project representation/toggle behavior, and all four planning perspectives.

## Architectural constraints preserved
- Stage-2 PlanningEngine / PlannerService remains the only scheduling authority.
- `homeSiteId`, `executionSiteId`, and `booking.siteId` retain distinct meanings.
- Partial routing remains canonical SiteAssignment-based after governed acceptance.
- No direct repository save or direct App.state replacement was introduced.
- No UI-only transfer authority was introduced.
- Internal sister-lab and external supplier governance remain distinct.
