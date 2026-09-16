# LabOS REV 1.0.148 — resource semantics cleanup & execution regression

**Baseline:** REV 1.0.147  
**Regression reference:** REV 1.0.98 accepted working baseline

## Root cause corrected
The execution start/complete gate still compared the selected equipment's legacy human-facing `capability` field directly with the process planning capability. A valid microscope could therefore be offered by the readiness UI through the canonical `planningCapability` resolver but rejected by `Start operation` as soon as execution began.

REV 1.0.148 removes that split-brain behavior. Planning, execution, load balancing, capacity forecasting and cost estimation now use one canonical technical equipment capability.

## Structural cleanup
- Added `canonicalPlanningCapability`.
- Added `equipmentSupportsCapability` and `equipmentEquivalent`.
- Added `equipmentExecutionReadiness` / `equipmentExecutionReady`.
- Execution readiness now also checks operational status in addition to calibration / maintenance / governance readiness.
- Added a model-boundary migration that materialises canonical `planningCapability` values for older/imported equipment, process, standard-test and booking records while preserving the original descriptive fields.
- Updated equipment rebalancing and verification logic to compare canonical capabilities rather than raw legacy labels.
- Updated pipeline cost equipment lookup and forward-demand capacity counts to use canonical capability semantics.
- Updated Resource Assurance capability metadata to use the canonical value.
- Removed all direct `.capability === ...` and `.capability !== ...` comparisons from LabOS core, services and app business logic.

## Verification
- JavaScript syntax: PASS for core, services, repository, demo data, app and service worker.
- Version references: PASS; no stale `1.0.147` runtime references remain.
- Runtime file references in `index.html`: PASS.
- Legacy microscope fixture with `planningCapability` removed and raw `capability = "Precision bench"` resolves to `Optical Inspection`: PASS.
- `equipmentSupportsCapability(legacyMicroscope, "Optical Inspection")`: PASS.
- Boundary migration restores `planningCapability = "Optical Inspection"`: PASS.
- Resource semantic audit after migration: no mismatch for the migrated microscope fixture.
- Static scan for direct raw capability equality/inequality comparisons in core/services/app: zero remaining.

## Preserved behavior
REV 1.0.147's review-before-decision flow and independent Control Plan approval separation-of-duties logic remain in place. No planning, build, sister-lab, execution, resource-assurance or approval data structures were removed.
