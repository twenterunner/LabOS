# ProtoLab OS — Quick Start — REV 1.0.6

## 1. Pick a role

Use **Demo role** in the fixed header. On a phone the **☰ menu remains visible** at the far right.

Useful roles:

- **Engineering Requester** — create and submit prototype demand.
- **Prototype Lab Coordinator / Planner** — material feasibility, AUTO-PLAN and timing commitment.
- **Process Engineer** — confirm the build route, standard/new-process decision and requested test method.
- **Lab Manager** — maintain lab planning standards/skills and review capacity.
- **Prototype Technician** — execute the digital traveller.
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
7. Serialise & execute digital traveller
8. Characterise, evaluate & disposition exceptions
9. Release approval
10. Deliver, retain records & feed learning

The important change in REV 1.0.6 is that **planning is step 4, not step 2**. The app first establishes what material and process/test work is really required.

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

Only when this assessment is planning-complete does AUTO-PLAN become meaningful.

## 5. Run AUTO-PLAN

Switch to **Prototype Lab Coordinator / Planner** and open **Lab feasibility, resource plan & committed timing**.

AUTO-PLAN now uses:

- confirmed process/test definitions;
- exact material availability/arrival;
- standard process and test setup/cycle times;
- equipment capability and calibration;
- staff competency and availability;
- resource conflicts and locked bookings;
- same-product historical actual durations;
- explicit development effort where a method is not yet released.

Each booking shows its **estimate basis**, equipment and qualified person. Review the requested-vs-forecast date and then explicitly **Commit forecast**.

## 6. Inspect what the planner is learning from

The schedule view includes a **Learning basis** card: prior same-product builds, first-pass yield, scrap, rework, recurring issues and recent lessons. A booking may say, for example, `Same-product history median n=4 + standard` rather than hiding where the hours came from.

The Lab Manager can edit standard process/test times and the competency matrix from **Lab standards, tests & skills**.

## 7. Build and close the learning loop

The technician starts and completes each traveller step separately. The actual wall-clock duration is retained. After delivery, closing the request adds a history record containing actual process durations, yield, scrap, rework, issues and lessons. Future same-product planning uses that accumulated evidence.

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

Existing v1.0.4 local data is migrated to schema 4; a reset is not normally required.


## 8. Configure the lab operating model

As **Lab Manager** or **Administrator**, open **Lab Standards & Resources**.

- Use **+ New process** for the guided process definition → planning standard → work instruction → review/release flow.
- Maintain standard process/test setup and cycle times, equipment capability, required competency, fixed charges and consumables.
- Define new competencies in the **Skill Catalogue**. A person becomes planning-qualified only after a certificate number, issuer, issue/expiry dates and evidence are recorded.
- Maintain labour rates, equipment rates and material standard costs in **Finance & Costing**.

## 9. Maintain equipment readiness

Open **Equipment & Calibration**. Record calibration and preventive maintenance with certificate/work-order evidence and a next-due date. AUTO-PLAN and traveller execution reject equipment that is no longer ready for the relevant date.

## 10. Use management KPIs and continuous improvement

As **Lab Manager**, open **Management KPIs**. Filter by product and historical period, then review delivery/yield/rework/scrap, cost variance/COPQ, process-step actuals, current bottlenecks and probability-weighted future equipment/skill demand. The **Action Centre** can be grouped by severity, build, person or function and keeps continuous-improvement proposals separate from mandatory build actions.
