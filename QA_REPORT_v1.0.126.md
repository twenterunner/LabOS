# LabOS REV 1.0.126 — Manual/AUTO-PLAN Semantics, Replan Governance & Regression QA

**Audit date:** 15 September 2026  
**Audit target:** `ProtoLabOS_Prototype_Build_POC_v1.0.126_WEB.zip`  
**Regression base:** REV 1.0.125  
**Accepted historical reference:** REV 1.0.98  
**Schema:** 35

## Executive result
REV 1.0.126 preserves the 1.0.125 KPI/replan-governance work and fixes a second planning-policy defect: a manual replan was silently converted into a persistent hard optimizer constraint, so an immediate AUTO PLAN could not reconsider the manually delayed task even when an earlier slot was again best. Manual decisions are now re-optimizable by default, with explicit protection available for true hard commitments.

No data-schema reset is required.


## 0. Reported behaviour — manual delay immediately ignored by AUTO PLAN
### Exact reproduction on REV 1.0.125
A live demo test (`P26-1007 / Test · Load endurance`) was manually moved from 22 Oct to 27 Oct. The manual planner stored the selection in `planningConstraintsV1096`, and the resulting booking was marked `locked=true` / `manualConstraintV1096=true`.

AUTO PLAN was then run immediately against the same state. The feasible Yellow candidate retained the test on 27 Oct and was rejected as `No measurable delivery improvement versus the current LIVE baseline.` The Red candidate also retained 27 Oct. This reproduces the user's observation.

### Root cause
The manual planner needed hard constraints while validating the user's selected slot, but those temporary validation constraints were persisted as if they were permanent scheduling policy. The optimizer deliberately preserves a feasible locked booking. The free-text reason (`Priority / business request`) was audit evidence only; it was not a semantic instruction telling the optimizer whether it could reconsider the date.

### REV 1.0.126 policy
Manual replanning now separates two concepts:
- **Reason** = immutable evidence of why the human changed the schedule.
- **Protection** = explicit scheduling policy controlling whether AUTO PLAN may revisit that slot.

The default is **re-optimizable**. A manual dialog contains `Protect this slot from AUTO PLAN`, off by default. The full Manual Planner contains the equivalent control. Only explicit protection retains a hard task constraint/lock. Existing implicit manual constraints from REV 1.0.125 are migrated to soft on first REV 1.0.126 evaluation; their live date and history are retained.

AUTO PLAN also recognizes releasing a still-active soft manual delay as a valid schedule refinement, provided no critical delivery KPI becomes worse. This means it can surface an earlier test even when the programme's final delivery forecast happens to remain unchanged. The proposal shows the current/proposed dates and the original manual reason; it is still a proposal requiring user acceptance.

### Verification
- Exact REV 1.0.125 reproduction: 27 Oct manual slot remained 27 Oct in AUTO PLAN.
- Same scenario on REV 1.0.126 after soft release: AUTO PLAN proposed 22 Oct again and marked it a verified optimization.
- Detected refinement: **5 calendar days earlier**; original reason remained visible.
- Synthetic same-final-forecast case: soft 22 Sep → 15 Sep task movement was classified as an optimization even with all critical portfolio KPIs unchanged.
- Identical synthetic case with `protection=protected`: **not** classified as a manual refinement.
- Fresh demo state: 24 requests, 81 bookings, 0 state invariants, 0 planning-integrity findings.
- Network routing sweep: 169 canonical routable tasks, 338 sister-lab alternatives, 299 feasible, 39 structured blockers, 0 exceptions.
- AUTO PLAN tier evaluation across all 21 open/non-final demo builds: 0 exceptions, with the live state remaining at 0 invariants / 0 planning-integrity findings.

## 1. Reported manual replan error
### Symptom
The live page could show:
> Move not applied: The move transaction did not reproduce its prevalidated target.

### Root cause
`PlanningEngineV1096.manualPlan()` correctly deep-clones/replans the schedule through the unified planning engine, but the regenerated bookings receive new `BOOK-*` IDs. The proposal still carried the source booking ID. The prior commit routine replaced live state with the validated next state and then tried to verify the move by finding that obsolete ID. The valid target therefore appeared to be missing.

### Repair
REV 1.0.126 keeps the stale-plan fingerprint guard and whole-plan integrity gate, but resolves the applied target using stable canonical task identity:
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

## 2. Replan rationale — before vs REV 1.0.126
### Before
There were multiple partial mechanisms:
- committed-date movements used `commitmentHistory` and required a reason category/explanation;
- AUTO-PLAN acceptance had a mandatory planning decision note and audit record;
- sister-lab/scenario decisions had rationales;
- Yellow manual moves had a rationale field;
- but Green manual moves could use generated text, and task moves that did not alter the commitment did not have a unified structured KPI history.

Therefore audit evidence existed, but **task-level replan-cause analytics were incomplete**.

### REV 1.0.126
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
