# LabOS REV 1.0.101 changelog

REV 1.0.101 is a narrow startup-regression hotfix on top of REV 1.0.100.

## Fixed
- Restored the missing `enablePlanningDragV1065` implementation that prevented REV 1.0.100 from starting.
- Restored the adjacent planning-move panel, Resource Assurance integration and navigation compatibility code that was removed by the same accidental edit.
- Bumped runtime filenames/version markers to REV 1.0.101 so GitHub Pages/mobile browsers cannot silently reuse the broken REV 1.0.100 app asset.

## Preserved
- Multi-lab demo projects across the internal laboratory network.
- Long-horizon demo plans that cross months.
- Deliberately late home-lab scenarios for sister-lab testing.
- Exact plan-finish vs 17:00 requested-delivery health logic.
- Left/right timeline panning plus − / Fit / + controls.
- REV 1.0.98 protected functional baseline and all later workflow features.

No schema change and no deliberate data reset are included.
