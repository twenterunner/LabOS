# LabOS REV 1.0.116 — changelog

## Manual planning: day-resolution, horizon-independent search

- Manual planning is now a **calendar-day decision**. Exact start/finish times remain an internal solver detail.
- Tapping a future process/test opens the same unified planning engine used by AUTO-PLAN and searches for the **next end-to-end feasible day**, independent of the currently visible swimlane horizon.
- The search includes near-term day-by-day coverage, every known finite availability/resource boundary, and days after all currently known finite commitments. This allows valid options weeks or months into the future instead of stopping at the chart horizon.
- Green options use existing released capability/readiness without moving another build.
- Yellow options are complete solver-validated plans that insert controlled readiness work such as training, calibration or maintenance before execution.
- True structural blockers such as **no registered equipment capability** or **no controlled skill/qualification path** open the existing guided recovery workflow instead of returning a dead-end message.
- Obsolete/stale planning tiles are detected and redirected to route/test definition rather than searched indefinitely.
- The manual planner no longer asks users to choose AM/PM or minute-level slots; displayed choices are dates only.
- Direct swimlane move mode now routes into the same day-based manual planner rather than half-day overlays.

IndexedDB schema remains 35; no reset is required.
