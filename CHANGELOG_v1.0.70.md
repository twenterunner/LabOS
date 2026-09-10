# LabOS REV 1.0.70

## Planning correctness
- Stale preferred staff assignments are now treated as preferences, not structural constraints. If the preferred person is unavailable, removed, or lacks the required competency, the optimizer discards that preference and selects feasible qualified capacity instead of blocking the portfolio.
- Drag/move options are now simulated through the complete remaining build before they are displayed. A slot is labelled feasible only after every downstream activity can be placed and data-integrity checks pass.
- The exact prevalidated move snapshot is committed, preventing a slot from being presented as feasible and then failing under a different calculation when selected.
- Pure within-build shifts apply directly without an approval dialog.
- The move transaction has explicit cross-build impact handling: if another build's bookings change, the affected builds/bookings are quantified and user acceptance with rationale is required.

## Planning blocker resolution
- Missing-competency resolution now follows simulate → offer → commit. Only people/training solutions that have already produced a complete feasible affected-build plan are offered.
- If no validated resolution exists, LabOS shows no false solution button and routes the user to the underlying staffing/competency master instead.
- After a validated portfolio blocker resolution, portfolio optimization is retried.

## Build sticky planning view
- The build plan now uses one visible swimlane per planned activity instead of stacking all activities into one common lane.
- Each lane shows the route step and assigned equipment.
- The entire flow remains visible with Morning/Afternoon resolution and Fit / zoom controls.
- Planning moves can be initiated directly from the sticky build-plan lanes, using the same prevalidated move engine as the Planning page.
