# LabOS REV 1.0.151 — KPI dashboard redesign & regression QA

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.151_WEB.zip`  
**Baseline:** REV 1.0.150  
**Regression reference:** REV 1.0.98 accepted working baseline

## 1. Scope implemented

REV 1.0.151 replaces the former KPI scorecard-style page with a reusable laboratory analytics framework and executive operating dashboard. The implementation keeps KPI calculation separate from rendering and uses normalized operational facts plus a KPI metadata/definition engine.

Implemented dashboard families include:

- sticky combined filters for period, lab/network, domain, Business Unit, product, programme, project, test/process family, equipment category and priority;
- automatic day/week/month/quarter graph resolution plus previous-equivalent-period comparison;
- eight executive KPIs with business-target directionality, trend, sparkline and drilldown;
- requested-date OTD versus accepted-commitment reliability;
- total days late, lost programme days, recovered programme days and delay-cause Pareto;
- RFT, invalid/repeat-test analytics and cause Pareto with product failures kept separate from lab-caused invalid tests;
- constrained capacity/load analytics, bottleneck ranking and resource-local filters;
- configured-BU allocation by hours, cost, builds/cases or tests plus BU allocation over time;
- actual/planned cost, cost coverage, cost breakdown, external testing and sister-lab cost;
- internal network capture, sister-lab transfer hours, evidenced outsourcing avoidance and programme days recovered;
- development estimate accuracy/time trend and learning/lesson analytics;
- equipment availability/downtime, calibration status, skill-coverage risk and current-state assurance;
- replanning events/cause/time movement analytics;
- Prototype domain KPI layer plus Validation/DV/PV and Failure Analysis KPI definitions ready for future source records without fabricated production values;
- configurable KPI business targets clearly separated from standards/certification requirements.

## 2. Data architecture

The KPI framework follows:

`raw operational facts/events -> filtered aggregation layer -> KPI definition metadata -> reusable visual components`

KPI definitions include ID, name, description, domain, unit, aggregation method, favourable direction, target, thresholds, period/current-status applicability, numerator/denominator definitions, drilldown entity, applicable filters and recommended visualization.

REV 1.0.151 keeps requested date, accepted committed date, current forecast/current commitment and actual completion as separate facts. Derived KPI values are not written back into operational build records.

Demo KPI facts now include explicit source metadata for external test spend and downtime records. Missing production data is shown as missing/coverage rather than silently fabricated.

## 3. KPI correctness verification

Browser/runtime reconciliation on the bundled demo population:

- Requested-date OTD: **25.0%** — PASS against source population.
- Accepted-commitment reliability: **62.5%** — PASS against accepted committed dates.
- Total Days Late: **54 d** — PASS against source requested/actual dates.
- Weighted RFT: **95.24%** — PASS against build/result population.
- Cost vs Plan: **-11.04%** — PASS against source planned/actual cost.
- Critical Capacity Load: **113.25%** — PASS from constrained capacity records.
- Internal Network Capture: **76.12%** — PASS from home-unmet/sister/external work.
- Evidenced Outsourcing Avoided: **€17,800** — PASS; only rows with a documented external alternative are included.
- Sister-lab transferred hours: **136 h** — PASS.
- External testing cost in the selected test period: **€2,400** with controlled source reference/evidence metadata — PASS.
- Unplanned downtime in the selected test period: **44.5 h** with raw equipment-event source references — PASS.
- Development estimate absolute percentage error: reconciled to source estimate/actual pairs — PASS.

## 4. Filter / period / domain acceptance

PASS:

- Last 7 days -> daily resolution.
- Last 30 days -> daily resolution.
- Last 90 days -> weekly resolution.
- Current and previous quarter -> weekly resolution.
- Last 12 months -> monthly resolution.
- Long custom range -> quarterly resolution.
- Combined lab + Business Unit + product filters.
- Domain filtering: Prototype active; Validation and FA show framework-ready empty production state.
- Comparison toggle on/off.
- Reset filters.
- BU allocation selector: Hours / Cost / Builds-Cases / Tests.
- Zero-activity period: explicit empty chart states.
- Current-state assurance is not incorrectly historical-period filtered.

## 5. Visual / interaction acceptance

PASS:

- 8 executive headline KPI cards.
- 9 major analytical sections.
- 11 primary visual chart components in the default dashboard view.
- all 8 executive cards open reconciled underlying-population drilldowns;
- Lost Programme Days cause chart provides cross-filter/drill source;
- configured KPI targets are editable;
- desktop layout has no horizontal page overflow at 1720 px;
- phone layout has no horizontal page overflow at 390 px;
- phone executive cards remain readable (>150 px effective width);
- no runtime page errors;
- no browser console errors.

Visual inspection was performed on both desktop and phone screenshots. The page is chart-led rather than a grid of static numbers, while detailed tables remain reserved for drilldown/definition detail.

## 6. Existing workflow regression

The existing operational workflow regression suite remains green after the KPI work:

- REV 1.0.142 workflow liveness: PASS across 22 demo builds.
- REV 1.0.142 fault-injection/self-healing: PASS.
- REV 1.0.142 idempotence: PASS across 22 demo builds.
- REV 1.0.142 serial/genealogy checks: PASS.
- REV 1.0.142 guided UI checks: PASS.
- REV 1.0.143 workflow regression: PASS across 22 demo builds.
- REV 1.0.144 Control Plan/material gate regression: PASS.
- REV 1.0.146 approve-later Control Plan flow: PASS.
- REV 1.0.146 complete My Work/action queue regression: PASS.
- REV 1.0.147 review-before-approval behavior: PASS.
- REV 1.0.148/1.0.150 canonical equipment capability semantics: PASS (`Optical Inspection` fixture resolves and supports execution correctly).
- application invariant validation: **0 issues**.
- regression page errors: **0**.

The KPI implementation does not alter planning, sister-lab routing, execution, approval or resource-state transition logic.

## 7. Package integrity

- JavaScript syntax (`node --check`) for core, demo data, repository, services, app and service worker: PASS.
- Manifest JSON parse: PASS.
- `index.html` points only to REV 1.0.151 runtime filenames: PASS.
- visible app revision and runtime version: REV 1.0.151: PASS.
- ZIP integrity is verified after packaging.
