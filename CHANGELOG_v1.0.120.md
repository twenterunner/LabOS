# LabOS REV 1.0.120 — startup recovery + in-swimlane manual replanning

## Corrected startup defect
- Fixed a REV 1.0.119 startup failure caused by a legacy render wrapper calling the missing `installV1070()` compatibility hook.
- Restored the V1070 interaction hook for build-step move controls and competency-resolution actions.
- Improved the startup watchdog so a real runtime/promise error is no longer overwritten by the generic “did not finish starting” message.
- Added startup phase reporting for cache cleanup, repository initialization/load, reconciliation, UI binding and ready state.

## Manual replanning retained
- Planning-tab swimlanes support direct calendar-day replanning.
- Specific-build `Schedule` swimlanes use the same direct replanning interaction.
- Green and Yellow alternatives are rendered at their actual dates across the full width of the selected lane track.
- Green = feasible with current controlled readiness and no other build moved.
- Yellow = feasible only after a validated local calibration, maintenance or training prerequisite; acceptance remains explicit.
- Selecting an option commits through the canonical planning engine and replans dependent downstream work.
- The visible swimlane width is evaluated progressively; if the next feasible option lies outside it, the timeline can expand and rescan.

## Sister-lab interaction retained
- Normal tap opens Planned Task; it does not initiate a move.
- Canonical test tasks retain `Send only this test to a sister lab`.
- A per-test sister-lab override remains governed independently from whole-build site transfer.
