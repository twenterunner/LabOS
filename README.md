# ProtoLab OS — Automotive Prototype Build Management POC

ProtoLab OS is a browser-only proof-of-concept for controlled automotive prototype-build operations. It supports engineering requests, material/process feasibility, realistic resource planning, controlled process/test definitions, PFMEA-linked risk, Control Plans, readiness, digital traveller execution, serial genealogy, characterisation, deviations/rework, approvals, release, delivery, cost, reporting, audit history and learning from previous builds.

## Revision 1.0.10 — controlled Product Master and capacity-normalized KPIs

The visible application header always shows the running revision: **REV 1.0.10**.

The guided request flow is deliberately ordered so that a forecast is not invented before the lab knows what must actually be built:

1. **Request definition & submission**
2. **Material source & feasibility**
3. **Process route & test-method assessment**
4. **Lab feasibility, resource plan & committed timing**
5. **Control Plan, risk controls & special approvals**
6. **Build readiness**
7. **Serialise & execute digital traveller**
8. **Characterise, evaluate & disposition exceptions**
9. **Release approval**
10. **Deliver, retain records & feed learning**

AUTO-PLAN can now run at any point after submission as a **best-feasible preview**. Material and process/test definition are still required before the forecast can be formally committed, but incomplete inputs no longer create a dead end. The planner uses explicit provisional assumptions and identifies what must still be resolved.

### Product master

REV 1.0.10 adds **Products & BOM** as a first-class menu area. Engineering Project Lead / Administrator can create and edit product family, part number, product revision, hardware/software revision, product-safety default, exact controlled BOM and default released-process route. New requests inherit the current product master; existing controlled requests are not silently rewritten.

### Capacity-normalized KPIs

Management workload KPIs are shown as **demand / current available capacity / utilization %**. Current equipment capacity counts only calibration/maintenance-valid equipment. Current staffing capacity counts only available people with a valid training certificate for the required skill. Scheduled calibration, maintenance and training consume capacity. Weekly, quarterly and process-step views all retain this capacity denominator. Quality and finance outcome KPIs show the current equipment/skill loading context rather than being presented in isolation.

### Material source

The engineering request has only two source routes:

- **Engineering supplied** — Engineering records the responsible supplier/owner and expected arrival at the lab. This date is a planning constraint. Build Readiness still requires physical receipt of the exact BOM lot and issue to the build.
- **Lab supplied** — the lab must reserve exact matching inventory by part number, revision and quantity before the request is planning-eligible. Reserved material supports scheduling; physical issue is still required before build start.

Material cannot be made ready by assigning an arbitrary lot.

### Planning basis

For a committed schedule, resource bookings are based on a **confirmed process route and defined requested tests**. Before that point AUTO-PLAN can create a clearly labelled provisional preview. Each defined booking uses controlled master data:

- standard process setup time, cycle time and unit/batch basis;
- standard test setup/cycle time;
- required equipment capability;
- valid equipment calibration;
- required lab competency;
- available qualified people;
- explicit Process Engineer development allowances for new/modified processes or tests;
- exact material timing/readiness;
- existing locked bookings and resource conflicts.

The **Lab Manager / Administrator** can maintain the process/test planning standards and staff competency matrix in **Lab standards, tests & skills**.


### Resilient AUTO-PLAN and swimlane views

REV 1.0.10 removes routine planner dead ends. For each task the optimizer searches all capable equipment, all people associated with the required skill, current and scheduled calibration/maintenance/training readiness, existing bookings and later working-time slots. It returns the earliest best-feasible schedule it can construct, even when that forecast misses the requested date.

AUTO-PLAN only raises a structural lab-capability blocker when **no equipment anywhere in the lab has the required capability** or **no person anywhere in the lab is associated with a required skill**. Expired calibration, overdue maintenance, expired qualification, temporary staff unavailability, busy equipment, unreleased process definitions and normal booking conflicts are treated as recoverable planning constraints rather than JavaScript errors. Where appropriate the planner inserts readiness work or uses controlled provisional assumptions.

Planning is primarily visual. **Visual Resource Planning** provides swimlanes for:

- the overall build portfolio;
- one selected build;
- each equipment resource;
- each person / qualification resource;
- optional probability-weighted potential-project overlays.

The detailed booking table remains available behind progressive disclosure for audit/detail use, but it is no longer the main planning experience.

### Learning from previous builds

The planner does not treat standard times as permanently perfect. Seed data contains historical completed builds for every demo product. For the same product family, duration estimates blend the controlled lab standard with the median actual duration from previous builds. The booking UI exposes the estimate basis so the planner can see whether a duration came from a standard alone or from historical evidence.

When a delivered request is closed, the learning record retains actual process durations together with first-pass yield, scrap, rework, recurring issues and lessons learned. These records become the basis for future same-product estimates and management insight rather than disappearing into a closed project.


### Lab standards, qualifications and work instructions

**Lab Standards & Resources** is the controlled master-data area for the Lab Manager / Administrator. It contains released process standards, standard tests, the skill catalogue, person-specific training certificates and finance/cost inputs. A skill is not planning-valid merely because a person is selected: AUTO-PLAN requires a non-expired certificate with objective evidence. Every released process has a released work instruction, and the guided **+ New process** flow creates the process definition, planning assumptions and work instruction before controlled release.

### Finance and cost learning

Cost estimates are calculated from the actual plan: labour role rates, equipment hourly rates, exact BOM material costs, fixed process/test charges, consumables, development/external services and contingency. Closed builds retain estimated cost, actual cost, cost per prototype and cost of poor quality so management KPIs can compare plan versus actual by product and time period.

### Equipment maintenance, calibration and training readiness

The **Equipment & Calibration** area records calibration certificates (number, issuer/lab, traceability/reference standard, evidence, result and next-due date), preventive-maintenance evidence and person-specific training-certificate expiry. A combined readiness engine shows everything due across 13, 26 or 52 weeks and proposes exact conflict-free service/training slots before expiry. Accepted slots become non-build resource bookings, so AUTO-PLAN works around them.

### Management KPIs and improvement engine

Management can filter KPIs by product and historical time window, inspect process-step performance, current equipment/skill bottlenecks, financial variance, yield/rework/scrap and probability-weighted future project demand. Forward resource need is shown **week by week** over 13, 26 or 52 weeks and summarized by quarter. Values are expected resource-hours/week: committed work counts at 100%, while potential-project work is multiplied by project probability. Potential projects do not create committed bookings. The Action Centre separately surfaces mandatory work and evidence-based improvement proposals such as cross-training, staff load balancing, preventive maintenance/calibration, capacity review and recurring-quality-issue review.

## Important compliance statement

This POC is designed to **support IATF 16949-aligned controls and audit-ready workflows**. Software alone does not make an organisation IATF 16949 certified. Customer-specific requirements, product-safety controls, retention rules, approval matrices and controlled organisational procedures must be configured and governed by the deploying organisation.

The application uses original workflows and fields inspired by common automotive quality-management concepts. It does not reproduce proprietary standards or manuals.

## Run on GitHub Pages

1. Upload all ZIP contents to the **root** of a GitHub repository. `index.html` must remain at the root.
2. In GitHub: **Settings → Pages**.
3. Choose **Deploy from a branch**, select the branch and `/ (root)`.
4. Open the published Pages URL.

No npm, build step, backend, API key or external database is required.

## Architecture

The POC separates major concerns:

`UI → domain/service layer → repository interface → IndexedDB adapter`

Identity follows:

`Identity provider → current user → roles/permissions`

Key abstractions include `StorageRepository`, `IndexedDBStorageRepository`, `DemoIdentityProvider`, `BrowserDocumentStore`, `PlannerService` / `LocalPlannerService` and domain services for requests, learning, process/control, readiness, serials, quality and reporting.

## Demo coverage

Seed data includes approximately:

- 15 prototype requests and 6 engineering teams;
- 12 demo users/roles;
- 8 product families;
- 25+ standard process definitions;
- 8 released standard test definitions;
- lab competency/qualification master data;
- 3 process-development examples;
- 8 Control Plans and PFMEA-linked risks;
- material lots, exact BOM requirements and genealogy;
- equipment/calibration state;
- 40+ serialized units;
- characterisation, deviations, rework and release holds;
- customer configuration examples;
- 32 historical completed product builds used by the learning-based planner.

## POC data

IndexedDB is the primary persistence mechanism. Use **Configuration & data** as Administrator to export JSON, import JSON or reset the demo. Current schema version is **5** and migration logic upgrades earlier local POC data without requiring a reset.

## Main files

- `index.html` — GitHub Pages entry point
- `styles.css` — responsive industrial UI
- `core.js` — common domain rules, permissions and planning model helpers
- `demo-data.js` — deterministic seed scenarios, standard tests/skills and historical builds
- `repository.js` — persistence, migration, identity and document-store abstractions
- `services.js` — domain services, planner, learning model and guard rails
- `app.js` — guided UI and interactions
- `service-worker.js` — legacy cache-cleanup worker so old POC caches do not mask new revisions
- `QUICK_START.md` — demo walkthrough
- `USER_MANUAL.html` — standalone task-based guide
- `VERIFICATION.md` — verification evidence and limitations
- `docs/FUTURE_ENTERPRISE_ARCHITECTURE.md` — enterprise migration path

## Deliberate POC limits

This static POC does **not** provide server-enforced security, corporate authentication, server-side signatures, multi-user concurrency, authoritative ERP/PLM/MES/HR/calibration integration, enterprise document storage, central backup or validated e-signature infrastructure. Those concerns belong in the later authenticated enterprise implementation.
