# LabOS REV 1.0.125 — KPI Period, Replan Governance & Manual-Move QA

**Audit date:** 15 September 2026  
**Audit target:** `ProtoLabOS_Prototype_Build_POC_v1.0.125_WEB.zip`  
**Regression base:** REV 1.0.124  
**Accepted historical reference:** REV 1.0.98  
**Schema:** 35

## Executive result
REV 1.0.125 fixes the reported manual-replan transaction failure and introduces a single selected-period model for the KPI page. It also closes an auditability gap: task-level replans now retain a structured reason even when the committed delivery date does not move.

No data-schema reset is required.

## 1. Reported manual replan error
### Symptom
The live page could show:
> Move not applied: The move transaction did not reproduce its prevalidated target.

### Root cause
`PlanningEngineV1096.manualPlan()` correctly deep-clones/replans the schedule through the unified planning engine, but the regenerated bookings receive new `BOOK-*` IDs. The proposal still carried the source booking ID. The prior commit routine replaced live state with the validated next state and then tried to verify the move by finding that obsolete ID. The valid target therefore appeared to be missing.

### Repair
REV 1.0.125 keeps the stale-plan fingerprint guard and whole-plan integrity gate, but resolves the applied target using stable canonical task identity:
- request ID;
- step/task ID;
- expected prevalidated date;
- expected equipment;
- expected staff.

If the live plan changed since proposal generation, the move is still rejected and the alternatives are recalculated.

### Direct verification
A real current demo booking was passed through `manualPlan()`.
- old booking ID survived: **false** (expected);
- new canonical booking existed: **true**;
- IDs differed: **true**;
- output invariants: **0**.

The corrected commit path was then run against a shifted feasible target:
- commit returned true;
- applied canonical booking ID matched the planner-generated target;
- applied start matched the target exactly;
- structured reason retained (`Capacity / congestion` + free-text explanation);
- post-commit invariants: **0**.

## 2. Replan rationale — before vs REV 1.0.125
### Before
There were multiple partial mechanisms:
- committed-date movements used `commitmentHistory` and required a reason category/explanation;
- AUTO-PLAN acceptance had a mandatory planning decision note and audit record;
- sister-lab/scenario decisions had rationales;
- Yellow manual moves had a rationale field;
- but Green manual moves could use generated text, and task moves that did not alter the commitment did not have a unified structured KPI history.

Therefore audit evidence existed, but **task-level replan-cause analytics were incomplete**.

### REV 1.0.125
- Green and Yellow in-lane manual moves: category + explanation required.
- Full Manual Planner Save: category + explanation required.
- AUTO-PLAN / portfolio replan acceptance: mandatory decision note retained + reason category added.
- `planningReplanHistory` stores task-level causal events.
- If commitment moves too, its commitment record links to the same causal event where applicable.
- Build Planning shows Task Replan History.
- KPI shows selected-period Replan Causes.
- CSV export includes task + commitment replan history.

## 3. KPI selected-period model
One period selector drives the headline KPI page. Supported windows:
- Last 13 calendar weeks;
- Last 12 calendar months;
- Last 8 calendar quarters;
- Selected week;
- Selected month;
- Custom date range.

Selected-period evidence basis:
- Delivery/OTD: actual deliveries in period.
- Quality: completed build-history and quality-case timestamps in period.
- Readiness: resource readiness at bookings in period + readiness activities starting in period.
- Capacity/utilization: active-lab booked hours in period / configured available period hours.
- Cost: completed build history in period.
- 5S: checks/actions arising from selected-period audits.
- Internal network utilization: accepted transfer/external decisions timestamped in period.
- Replan causes: task/commitment replan events timestamped in period.

## 4. Business-unit allocation
Business unit is read from Configuration → Project Teams. For active-lab bookings within the selected period:
- **Time spent** = booking duration hours;
- **Direct resource cost** = booking duration × staff role rate + booking duration × equipment hourly rate.

The pie chart can switch between those two bases and is accompanied by a table with hours, direct resource cost and distinct builds.

The fresh demo-only master data was diversified into several BUs so this can be tested. Persisted user business-unit assignments are not overwritten.

Custom-window deterministic check (Twente, 15 Sep–31 Oct 2026):
- 33 bookings selected;
- 0 selected bookings outside window;
- 4 BUs represented in the generated Twente slice;
- far-future Jan 2035 window: 0 bookings.

## 5. Regression / fault-injection continuation
Fresh-state checks after all changes:
- 24 requests;
- 81 seeded bookings;
- 0 invariants;
- 0 planning-integrity findings;
- only P26-1023 remains intentionally blocked at Detroit by absent High-speed vibration capability.

Network route comparison:
- 169 active canonical routable tasks;
- 338 sister-lab alternatives evaluated;
- 298 feasible;
- 40 blocked with structured planner results;
- 0 unhandled exceptions.

## 6. Known qualification boundary
Chromium direct-navigation testing in the execution environment did not complete and was terminated after timeout. No claim is made that this substitutes for an Android/GitHub Pages smoke test. The exact reported transaction mechanism and its corrected path were exercised directly in the domain model, and source/package checks passed.
