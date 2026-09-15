# QA Report — LabOS REV 1.0.132

## Scope
Targeted regression for role switching and explainable AUTO PLAN, based on REV 1.0.131.

## Automated/static checks
- All runtime JavaScript files pass `node --check`.
- `index.html` references resolve to files present in the package.
- Runtime/index/service-worker version references resolve to REV 1.0.132.
- ZIP integrity verified after packaging.

## Role-switch tests
A unit harness executed the actual REV 1.0.132 role-switch functions with mocked UI dependencies:
- permitted-page switch: identity changed, page retained, selectors re-synchronized;
- restricted-page switch: identity changed and dashboard fallback invoked;
- no stale role value remained in the role-switch state contract.

## Planner diagnostics tests
The canonical core/demo/repository/services stack was loaded in Node against the demo state.
- A seeded build requiring equipment calibration produced a named blocker: `Microscope Station` / `Calibration`, rather than only generic equipment readiness text.
- Protected strategy reported the readiness prerequisite.
- Automatic-readiness and portfolio tiers produced their own strategy outcomes.
- After forcing the target to an unplanned state, a feasible automatic-readiness candidate was classified as an improvement because it restored a forecast.
- `targetPlanningSummaryV132.currentPlanned` remained false for the forced unplanned baseline.
- Actionable blocker data contained the exact resource/readiness action.

## Regression intent
The change is UI/diagnostic and planning-decision routing only. No database/schema migration was introduced and no accepted planning-situation behavior was reverted.
