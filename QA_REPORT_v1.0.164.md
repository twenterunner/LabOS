# LabOS REV 1.0.164 — QA / Release Report

**Release:** 1.0.164-poc  
**Data schema:** 38 (unchanged; no reset required)  
**Release objective:** replace the generic Validation canvas with a ReisSlim-style flow-first Validation designer, remove the Portfolio navigation entry, improve preventive Lessons Learned, retain Prototype process flow, and preserve shared Validation planning.

## Delivered changes

### 1. Portfolio navigation removed
- The separate **Portfolio** item is removed from the main navigation.
- The Validation page no longer exposes a “Unified Portfolio” shortcut.
- Existing internal compatibility route code is retained so old saved/deep state cannot crash, but there is no user-facing Portfolio tab.

### 2. Prototype remains process-flow based
- Prototype does **not** render the Validation builder.
- Existing Build Workflow / Process Flow, yellow current action, controls, evidence, genealogy and planning hand-off remain unchanged.
- The older generic “Lessons from similar work” panel is replaced by the preventive-learning surface.

### 3. Validation rebuilt as flow-first Test Leg designer
The Validation programme now opens directly on **Validation Test Flow Definition**. The designer implements the interaction grammar requested from the ReisSlim reference:
- independent **Test Leg** columns;
- vertical sequential tests within each leg;
- **Next test** insertion;
- DUT/sample **Split** into branches such as 1a / 1b;
- controlled branch allocations;
- recursive sub-branching;
- automatic **Branches merged** / parent-path rejoin;
- **Test after merge**;
- additional independent Test Legs;
- Samples, Move, Edit and Delete controls on test cards;
- no floating activities or manually drawn connectors.

The canonical Validation activity/leg records are synchronised from the flow model so existing Planning, Execution, results, RTM and reporting logic continue to use controlled IDs.

### 4. Standard Test first / duplicate prevention
Every added Validation test starts with a test-intent description. LabOS then ranks the released Standard Test library before allowing method development.
- Exact released-name/alias matches are ranked at 99%.
- Strong existing matches are explicitly presented for reuse/adaptation.
- A generic “new test” is blocked when the intent already strongly matches a released standard and no controlled delta is supplied.
- Controlled variants retain the closest released Standard Test as their basis and record the engineering delta.

The matching percentage is decision support, not automatic technical approval of requirement coverage.

### 5. Learning test-development estimates
Adapt/new method development estimates use:
- closest Standard Test / basis method;
- similarity gap;
- controlled delta complexity;
- actual development hours from comparable completed Validation development work.

At development completion, the user can record actual hours and a learning note. The historical actual is added to the development-learning history and affects later comparable estimates. The UI shows estimate hours, confidence and estimate basis.

### 6. Requirements moved after flow definition
Requirements are now a **Requirements Coverage Check** rather than the starting point of programme construction.
- Requirements map onto already-defined flow tests.
- Multiple tests can support one requirement.
- Uncovered requirements remain visible.
- Tests without requirement/engineering rationale remain visible.
- Requirement mapping does not silently create duplicate tests.
- Workflow order is: **Test Flow → Requirements Coverage → Planning → Execution → Report**.

### 7. Validation remains in shared Planning
REV 1.0.163 shared-planning integration is retained. Clean demo-state planner verification produced:
- 4 active Validation programmes evaluated;
- 4 planned;
- 0 blocked;
- 17 Validation bookings written into the shared constrained booking calendar in the planning copy.

Validation bookings remain tagged as Validation while competing for the same people/equipment/readiness capacity as Prototype work.

### 8. Lessons Learned upgraded to preventive learning
Every completed Prototype Build and closed Validation Programme is still auto-captured. REV 1.0.164 enriches material lessons with:
- previous problem/event;
- failure mode;
- explicit root cause where captured, or an evidence-status warning where not verified;
- preventive control;
- detection/readiness check;
- applicability trigger conditions;
- risk priority and evidence confidence;
- effectiveness status;
- pre-start check for the next similar work.

Successful closeouts remain reference baselines but are excluded from the recurrence-prevention suggestion queue unless there is a material risk signal.

At the start of similar work, preventive lessons are ranked primarily by same product and related process/test methods. The user can:
- **Apply control**;
- mark **Not applicable** with rationale;
- **Create action** to carry the preventive control into the current work.

### 9. Product preventive-learning report
Reports now contains **Product Lessons Learned · Prevent Recurrence**, combining Prototype + Validation learning for a product. It shows:
- learning-record count;
- high-risk lessons;
- recurring problem patterns;
- unverified effectiveness;
- carried-forward prevention controls;
- complete source/evidence history;
- CSV export and browser Print/PDF.

## Automated model / fault-injection QA

**23 / 23 passed.** Covered:
1. revision and schema gates;
2. Validation fixture/migration;
3. independent Test Leg creation;
4. released Standard Test insertion;
5. split into branches;
6. recursive split;
7. graph/invariant validity;
8. duplicate new-method prevention;
9. exact/strong standard matching;
10. controlled variant creation;
11. development estimate learning from recorded actuals;
12. requirement mapping after flow;
13. flow-first workflow ordering;
14. automatic Prototype lesson capture;
15. automatic Validation lesson capture;
16. prevention-quality fields;
17. similar preventive lesson retrieval;
18. explicit root-cause / preventive-action carry-forward;
19. product preventive report;
20. Validation portfolio planner;
21. shared Validation booking calendar.

A targeted fixture deliberately injected a Prototype quality deviation: **fixture locating-pin wear** with an explicit root cause and prevention action. The next-similar-work retrieval correctly surfaced that prevention lesson rather than only showing a generic historical note.

## Rendered Chromium interaction QA

The production HTML/CSS/JS payload was executed in headless Chromium using the same injected-document technique used for previous LabOS releases (direct local navigation is restricted in the test environment).

**35 / 35 passed**, including:
- clean application boot;
- visible REV 1.0.164;
- no Portfolio navigation item;
- no browser runtime errors;
- Prototype process-flow retained;
- Prototype does not render Validation designer;
- preventive-learning panel replaces old generic lessons panel;
- Validation opens flow-first designer;
- Test Leg columns and all card controls present;
- Add Test starts from test intent, not requirement;
- released Standard Test matching shown before development;
- reuse and adapt/develop choices shown after duplicate check;
- split branch rendering;
- automatic merge/rejoin rendering;
- recursive-branch controls;
- add-after-merge control;
- independent Test Leg model;
- requirements coverage screen after flow;
- shared Validation planning action;
- product preventive-learning report and CSV export;
- V164 model hooks / learned estimator;
- no runtime errors after interactions.

## Static / packaging gates
- `node --check` passes on every shipped JavaScript runtime file.
- All local `index.html` references resolve.
- No missing CSS URL assets.
- Visible revision, runtime revision and runtime filenames are 1.0.164.
- No 1.0.163 runtime references remain in `index.html`.
- Service worker identifies the 1.0.164 deployment reset.
- Schema remains 38.

## Migration / compatibility
- No IndexedDB reset is required.
- Existing Validation legs/activities are migrated into the flow-first structure while retaining native activity IDs and synchronising back to existing controlled records.
- Existing Prototype data model is not converted to the Validation designer.
- Existing prior learning remains available; V164 enriches it rather than deleting it.
- Existing shared Planning/Execution/Results/reporting structures are preserved.

## Release conclusion
REV 1.0.164 is qualified for the static-browser POC package against the requested scope. The key behavioural change is deliberate: **Validation construction now begins with the physical test flow, while requirements verify coverage afterwards.** Prototype remains on its mature process-flow workflow.
