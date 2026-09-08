# ProtoLab OS — Quick Start — REV 1.0.25

## What changed in REV 1.0.25

- Three completed demo projects are included in **Prototype Requests → Archived**, with retained route, measurement, quality and final-report history.
- The **Build Report** is a controlled document and deliberately excludes cost. It remains DRAFT until the configured Engineering Project Lead or Quality Engineer approves it; only then is it FINAL.
- The **Test Report** now calculates measurement/specification summaries, mean, sample standard deviation, Cpk (where statistically applicable), first-pass yield, build yield, yield loss, rework, scrap, hold and raw sample/serial traceability.
- **AUTO-PLAN / Optimize Portfolio** now works as a proposal: the current live plan is not changed until the user reviews the before/after dates and resource assignments and explicitly accepts. Reject leaves the live schedule untouched.
- A **Daily Operations Check** runs once per day on application start, using current capacity, qualifications, calibration/maintenance, process-time performance and recurring issues to surface actionable improvement opportunities.

## What changed in REV 1.0.24

- Open **Lab Standards & Resources → Skill Catalogue** and use **Edit competency** to update the controlled competency definition.
- Competency IDs are protected; names, scope, owner, certificate rule, validity, renewal hours and evidence requirements are editable.
- Under **Lab Staff**, use **Manage competencies** to issue/renew or revoke a person's qualification certificate.
- AUTO-PLAN only treats the person as qualified while an in-date certificate is Valid.


## What changed in REV 1.0.23

- Add **Planning situations** for vacations, staff absence, equipment outage/shutdown, whole-lab closure or another capacity block. They are real AUTO-PLAN constraints and are visible on the planning timeline.
- The first lab commitment becomes the immutable **Original commitment**. Every later accepted date movement is a reason-coded replan.
- Each build tracks original commitment, current/final commitment, replan count, net days moved, total schedule churn and actual delivery.
- When AUTO-PLAN predicts a different date, the commitment is not silently overwritten: the build shows **Replan decision required** until the planner accepts a new commitment and records the reason.
- Management KPIs include original-commitment hit rate, final-commitment hit rate, replan rate, average movement and replan root-cause Pareto.

## What changed in REV 1.0.22

Use **Prototype Requests** as the main searchable portfolio and archive. Closed builds automatically move to **Archived** but retain report and route-traveller access. Workflow colors/icons are consistent: green ✓ done, yellow ● ongoing/open, red ✕ blocker/late. Potential projects include cost. BOM/build consumables are optional and can be enabled from the request cost area. Characterisation and Build Reports were repaired and optimized.

## What changed in REV 1.0.20

- Planning swimlanes show every day explicitly.
- Resolved blockers disappear once the underlying condition is genuinely satisfied.
- Management KPIs share one selected timing basis: weekly, monthly, quarterly, single week or single month.
- Add potential projects from Planning or Management KPIs, assign probability/timing, and inspect each project's individual capacity impact.
- E0/E1/V/P detail is shown only where the control level is selected/changed.

## 1. Pick a role

Use **Demo role** in the fixed header. On a phone the **☰ menu remains visible** at the far right.

Useful roles:

- **Engineering Requester** — create and submit prototype demand.
- **Prototype Lab Coordinator / Planner** — material feasibility, AUTO-PLAN and timing commitment.
- **Process Engineer** — confirm the build route, standard/new-process decision and requested test method.
- **Lab Manager** — maintain lab planning standards/skills and review capacity.
- **Prototype Technician** — execute the guided build execution.
- **Quality Engineer** — Control Plan and deviations.
- **Product Safety Representative** — perform an applicable safety sign-off.
- **Approver / Reviewer** — independent controlled approval.

## 2. Understand the practical order

Each request uses one tappable checklist. Follow it top to bottom:

1. Request definition & submission
2. Material source & feasibility
3. Process route & test-method assessment
4. Lab feasibility, resource plan & committed timing
5. Control Plan, risk controls & special approvals
6. Build readiness
7. Build samples & capture process evidence
8. Characterise, evaluate & disposition exceptions
9. Release approval
10. Deliver, retain records & feed learning

The important change in REV 1.0.12 is that **planning is step 4, not step 2**. The app first establishes what material and process/test work is really required.

## 3. Create a request and choose material source

Only two source routes are offered:

### Engineering supplied

Engineering supplies the exact BOM material. Enter the supply owner and expected lab-arrival date. The expected date constrains the forecast. Later, the lab must receive the actual exact lot before Build Readiness can pass.

### Lab supplied

The lab must reserve exact matching stock — **part number + revision + sufficient quantity**. Available but unreserved stock does not make the request planning-ready. The reserved lot must later be issued to the build.

## 4. Assess process and test methods before planning

As **Process Engineer**, open **Process route & test-method assessment**.

- Confirm or change the proposed route.
- Every standard operation must point to a released process revision with setup/cycle time, equipment capability and required competency.
- A new/modified process gets a controlled process-development workflow and an explicit development-hours estimate.
- Requested characterisation is matched against the **Standard Test Library**.
- An unmatched requested test requires a controlled development estimate, provisional execution time, equipment capability and skill before planning.

AUTO-PLAN may be run before this assessment is complete to obtain a **provisional best-feasible preview**. The app clearly identifies assumptions. Formal timing commitment still waits for material and process/test feasibility to be defined.

## 5. Run AUTO-PLAN

Switch to **Prototype Lab Coordinator / Planner** and open **Lab feasibility, resource plan & committed timing**.

AUTO-PLAN now searches for the earliest best-feasible schedule using:

- confirmed process/test definitions;
- exact material availability/arrival;
- standard process and test setup/cycle times;
- equipment capability and calibration;
- staff competency and availability;
- resource conflicts and locked bookings;
- same-product historical actual durations;
- explicit development effort where a method is not yet released.

Each booking shows its **estimate basis**, equipment and qualified person. Review the requested-vs-forecast date and then explicitly **Commit forecast**.


### Visual planning

Open **Visual Resource Planning** and switch between **Overall**, **Per build**, **Per equipment** and **Per person** swimlanes. Choose a 4, 8 or 13 week horizon and toggle **Show potential projects** to add probability-weighted scenario bars without turning them into committed bookings. Use **OPTIMIZE PORTFOLIO** to re-plan active work in priority / due-date order. Routine conflicts move or substitute resources; only a genuine absence of the required lab equipment capability or required skill becomes a structural blocker.

## 6. Inspect what the planner is learning from

The schedule view includes a **Learning basis** card: prior same-product builds, first-pass yield, scrap, rework, recurring issues and recent lessons. A booking may say, for example, `Same-product history median n=4 + standard` rather than hiding where the hours came from.

The Lab Manager can edit standard process/test times and the competency matrix from **Lab standards, tests & skills**.

## 7. Build and close the learning loop

The technician starts and completes each build step separately. The actual wall-clock duration is retained. After delivery, closing the request adds a history record containing actual process durations, yield, scrap, rework, issues and lessons. Future same-product planning uses that accumulated evidence.

## 8. Useful seeded scenarios

- `P26-0042` — straightforward released-process build
- `P26-0043` — new/modified process work
- `P26-0045` — material blocker
- `P26-0046` — resource conflict
- `P26-0047` — technician substitution
- `P26-0048` — calibration conflict
- `P26-0049` — missing special-characteristic control
- `P26-0050` — characterisation failure / quality hold
- `P26-0052` — rework / reinspection
- `P26-0053` — product-safety sign-off
- `P26-0055` — delivered traceability example

## 9. Backup or reset

As **Administrator → Configuration & data**:

- Export JSON
- Import JSON
- Reset Demo Data

Existing earlier local data is migrated to schema 6; a reset is not normally required.


## 8. Configure the lab operating model

As **Lab Manager** or **Administrator**, open **Lab Standards & Resources**.

- Use **+ New process** for the guided process definition → planning standard → work instruction → review/release flow.
- Maintain standard process/test setup and cycle times, equipment capability, required competency, fixed charges and consumables.
- Define new competencies in the **Skill Catalogue**. A person becomes planning-qualified only after a certificate number, issuer, issue/expiry dates and evidence are recorded.
- Maintain labour rates, equipment rates and material standard costs in **Finance & Costing**.

## 9. Maintain equipment readiness

Open **Equipment & Calibration**. Record calibration and preventive maintenance with certificate/work-order evidence and a next-due date. AUTO-PLAN and guided build execution reject equipment that is no longer ready for the relevant date.

## 10. Use management KPIs and continuous improvement

As **Lab Manager**, open **Management KPIs**. Filter by product and historical period, then review delivery/yield/rework/scrap, cost variance/COPQ, process-step actuals, current bottlenecks and probability-weighted future equipment/skill demand. The **Action Centre** can be grouped by severity, build, person or function and keeps continuous-improvement proposals separate from mandatory build actions.

## Product master — REV 1.0.12

Use **Menu → Products & BOM**. Engineering Project Lead or Administrator can create/edit the product definition, exact BOM and default process-route proposal. New requests inherit this controlled master data.

## Capacity KPIs

Management workload KPIs show demand, currently available capacity and utilization %. Invalid equipment and unavailable/uncertified people do not count as available capacity.


### Choose the right build purpose
Use **E0 Rapid Engineering** for quick engineering experiments, **E1 Controlled Engineering** for repeatable engineering prototypes, **V Validation / Customer** for formal DV/PV/customer evidence, and **P Production Intent** for production-representative parts. The application hides unnecessary controls at the lower levels.

In a request, open **Process route & test-method assessment → Choose / replace route** to start blank, use the product standard, or copy a previous build.


## REV 1.0.12 — purpose-based build control

Choose the lowest assurance level that still provides the evidence required for the build:

- **E0 Rapid Engineering** — quick experiments, troubleshooting and learning. No formal Control Plan/PFMEA/release sign-off by default; unit IDs are optional; test-only work may have no build route.
- **E1 Controlled Engineering** — repeatable engineering prototypes with useful traceability, but without customer/production release formalities.
- **V Validation / Customer** — DV/PV or customer-facing samples using released methods, controlled risk/Control Plan evidence and formal release.
- **P Production Intent** — strongest prototype governance for production-representative/PPAP-supporting work.

For the build route choose **Start from scratch**, **Use product standard route**, or **Copy a previous build**. The selected route is copied into the request and can then be edited, reordered, extended or shortened without changing the source record.


## REV 1.0.12 quick changes

- Edit a created standard build process under **Lab Standards & Resources → Edit process**.
- Add an equipment calibration certificate under **Equipment & Calibration → + Add certificate** or open **Certificates** and choose **+ Add certificate**.
- Add/edit people under **Lab Standards & Resources → Lab Staff**. Then issue controlled skill certificates separately; editing a staff record never grants competence.
- Edit a request-specific build route from the request workflow using each route card's **Edit / ↑ / ↓ / Remove** controls.


## 8. Sample identity and execution in REV 1.0.20

When a build reaches execution, create the sample register to exactly match the requested quantity. You no longer choose an arbitrary number of IDs.

For each physical sample:

- **Lab Sample ID** is generated automatically and remains the permanent database link.
- **Sample number** is the label operators see and may be changed.
- **Formal serial number** is separate; V/P requires it, E0/E1 does not.

For a unit-based route operation, execute the operation against one sample at a time. For a batch operation, one execution can cover all pending samples. Equipment is selected for the operation and must match the process capability; it is not permanently linked to the sample.

If the Control Plan defines a measurement at that route step, record it during execution against the sample. Once all samples complete the route, move to **End characterisation**, where the selected tests appear as a sample × test matrix.

**Forecast delivery** is the predicted handover date from AUTO-PLAN, not the engineering requested date. It includes the best-feasible resource schedule plus final lab handling and remains provisional until the Lab Planner commits it.

## Sample evidence and photos (REV 1.0.26)
Open a build → **Samples** → **Data / photos** on the relevant sample. Add a description, structured data fields, and/or a photo from the phone camera/gallery. Use **Include in Build Report** per item. The permanent Lab Sample ID remains the traceability key.
