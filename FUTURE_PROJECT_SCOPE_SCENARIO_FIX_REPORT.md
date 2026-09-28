# LabOS REV 1.0.185 · Future Project Scope + Scenario Fix TEST-2

## User feedback addressed

1. A future potential project must state what Prototype Build and/or Validation work is expected so LabOS can forecast the correct equipment, competencies and money.
2. Scenario Planner could remain on “Scenario Lab · solving” and appear hung / non-responsive.

## Future potential project work package

The existing `pipelineProjects` model remains scenario-only; it still does not create live programmes or bookings.

A potential project can now define:

- Prototype Build required: yes/no
- Prototype quantity / samples
- Prototype estimate basis:
  - product default released route; or
  - scope copied from an existing Prototype build (released process route plus referenced standard tests)
- Validation required: yes/no
- Validation DUT quantity
- expected Validation start offset in weeks after project start
- Validation estimate basis:
  - exact released Test Library selections; or
  - scope copied from an existing Validation programme
- Validation execution assumption:
  - internal lab; or
  - configured external benchmark where available
- optional manual lab-cost override

The modal shows a live estimate before save: work items, equipment hours, competency hours, estimated lab cost, probability-weighted expected cost, major equipment/competency needs and external-service cost.

## Forecast / KPI semantics

`ForwardDemandService` now recognizes an explicit future-project work package. It removes the previous generic default-route estimate for that project and adds the selected Prototype / Validation items exactly once.

- internal work contributes equipment and competency hours
- tests explicitly assumed external do not consume internal equipment / competency capacity
- configured external quote benchmark contributes estimated external spend
- project probability is applied to capacity demand once
- project cost is shown both at 100% win and probability-weighted expected cost
- KPI “Future resource needs” includes a Scope Assumptions table so the Prototype / Validation content behind the forecast is inspectable
- Resource-care forecasting (calibration / maintenance / training placement) consumes the same explicit forward-demand service
- Planning potential-project timeline uses the explicit work items rather than showing a generic prototype route for scoped projects

Legacy potential projects without an explicit work package retain the old default-prototype-route behavior until edited/saved.

## Scenario Planner responsiveness correction

Root cause: Scenario Lab synchronously evaluated the full active portfolio across six Stage-2 order strategies, plus escalation/network alternatives. On the demo portfolio a simple “Current risk / recovery scan” could exceed a minute.

Correction:

- the same canonical `PlanningEngine` / `PlanningPortfolioService` remains the scheduler
- scenario replanning is bounded to the selected target plus builds directly intersecting the simulated disruption
- all unselected LIVE bookings remain protected in place
- candidate qualification still uses whole-portfolio metrics, so an option that worsens protected LIVE delivery is not silently presented as an optimization
- Stage-2 strategies for Scenario Lab are bounded to `priorityDue` and `leastSlack`
- Scenario generation is executed through the existing planning Web Worker where available
- a 20-second safe-stop terminates the worker and reports a controlled error; LIVE state is never changed
- Cancel terminates the active scenario worker

Measured Node regression on the demo state: the current-risk scan used in the reported screenshot returned in about 2–3 seconds instead of exceeding the previous 120-second test ceiling.

## Regression evidence

Focused tests:

- Prototype Create Draft: 3/3 PASS
- Planning Scenario / external lab restoration: 8/8 PASS
- Future Projects / KPI restoration: 6/6 PASS
- Future Project work-package + Scenario responsiveness: 7/7 PASS
- JavaScript syntax: PASS for core, services, app and planning worker

A broad Stage-2 suite run was started but exceeded the execution container’s per-command time limit while the unchanged graph suite was running. No Stage-2 planning-kernel file was edited. The Scenario change is limited to its orchestration scope and strategy selection; the canonical planning kernel remains unchanged.

Interactive Chromium verification could not be completed in this environment because the organization browser policy blocks localhost pages (`chrome-error://chromewebdata/`). Manual browser acceptance is therefore still required for this TEST-2 build.
