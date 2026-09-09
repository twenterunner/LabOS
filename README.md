REV 1.0.32 — Quality Workbench + best-in-class Build Report + Resource Assurance engine

This revision carries forward the REV 1.0.30 comprehensive controlled Build Report and adds a proposal-first calibration, preventive-maintenance and training engine.

### Build Report / archived exemplar
- Controlled dossier cover and executive disposition.
- Process-flow visualization and actual execution.
- Full Control Plan and PFMEA/process-risk sections.
- New risk → Control Plan → evidence traceability matrix.
- Critical / safety characteristic distributions with specification limits, target, Cpk and anomaly/flyer markers.
- Historical first-pass nonconformance retained separately from final release data.
- Genealogy, raw data, sample evidence/photos, deviations/rework/yield, calibration evidence and formal report approval.
- Archived pressure DV batch remains the comprehensive FINAL · APPROVED example.

### Resource Assurance
- Replaces optimizer-only readiness booking with explicit user control.
- Calibration, Maintenance and Training views with overdue/upcoming/scheduled status.
- Group by individual, activity, equipment type, equipment capability, competency or person.
- Multi-select items and Review & schedule selected.
- LabOS suggests the lowest-impact free slot using committed bookings plus probability-weighted future demand.
- User may accept the suggestion or override date/time and add scheduling rationale.
- Conflicting overrides require explicit acceptance and flag affected build plans for review; no silent replanning.
- AUTO-PLAN no longer auto-books calibration, maintenance or training. It flags readiness actions and treats accepted reservations as controlled constraints.
- Existing legacy AUTO-generated readiness slots are released during schema 16 → 17 migration.
- Separate calibration, maintenance and training readiness reports are available.

REV 1.0.30 — Best-in-class controlled Build Report
---------------------------------------------------
- Rebuilt the Prototype Build Report as a controlled automotive build dossier with executive disposition, document metadata and independent final approval.
- Full process-flow execution, Control Plan and PFMEA/process-risk tables are embedded in the report instead of only summarized.
- Classified PS/SC/KC and request-defined critical characteristics receive automatic distribution plots, specification/target overlays, final-result Cpk, coverage, yield and anomaly/flyer highlighting.
- Capability uses the latest release result per physical sample while historical first-pass failures remain visible as retained exceptions.
- Report includes genealogy, batch/sample data, photographic evidence, deviations, rework, yield loss, calibration/equipment evidence, approvals and a complete raw-measurement appendix.
- The archived **Archived pressure DV batch** is a comprehensive report example with 8 samples, 4 critical/safety characteristics, 100% final build yield, one controlled first-pass rework, statistical flyers, PFMEA linkage and 24 sample evidence images.
- Build Report remains deliberately cost-free. Schema 16 upgrades existing demo browsers with the comprehensive archived report example without adding demo content to non-demo datasets.


REV 1.0.29 — Controlled request flow-down & batch capture
-----------------------------------------------------------
- Request-defined build maturity, configuration, BOM/material source, characterisation and special characteristics now flow into the build route/evidence plan.
- Requests can define required batch data, fixed sample-data columns and controlled photo-evidence slots.
- Sample fields flowed down from the request cannot be renamed independently per sample.
- Added Batch Data Worksheet with common batch values, sample-by-sample table, CSV template and CSV import.
- Added Photo Matrix for consistent required photo evidence across all samples.
- Added Batch Characterisation result grid plus full sample x test CSV template/import workflow.
- Route Traveller and controlled reports show the flow-down; Build Report also includes common batch evidence.
- Applied the approved LabOS Concept 3 identity to the application header, PWA icons/favicons and report headers.
- Schema 15 migrates existing datasets in place and preserves the existing archive/history.

## REV 1.0.29 — persisted-browser archive repair

Schema 14 re-runs archived-demo installation for already-upgraded browser data. Existing active work is preserved; three completed demo builds are added/normalized under Prototype Requests → Archived. A visible fallback button is shown when a recognized demo still has zero archived builds.

# ProtoLab OS — Prototype Build Management POC

## REV 1.0.27 — sample-ID repair & guaranteed archived demo examples

- Repairs duplicate permanent Lab Sample IDs created by older archive/demo merges while retaining sample evidence, process history, material lots and linked measurement/deviation references.
- Validates permanent Lab Sample IDs separately from optional formal serial numbers.
- Recognises an existing POC demo by stable dataset fingerprints even if its historical `dataVersion` marker was lost.
- Guarantees the three completed demo projects are present under **Prototype Requests → Archived** without requiring Reset Demo Data.
- Archived demo migration now merges by natural traceability keys (request ID, Lab Sample ID, approval/report identity) rather than volatile internal row IDs.
- Dashboard includes a direct **Archived builds (n)** shortcut.

## REV 1.0.26 — sample-specific data, photos & controlled report evidence

- Each physical sample can now retain a free-text description, arbitrary structured data fields and multiple photo records under **Sample Register → Data / photos**.
- Photos can be taken directly from a phone camera or selected from the device. Images are resized to a maximum 1600 px and compressed before IndexedDB storage to keep the static POC responsive.
- Every description, data field and photo remains anchored to the permanent Lab Sample ID / formal serial traceability chain.
- Each description/data/photo item has an **Include in Build Report** control, allowing internal evidence to be retained without forcing it into the released document.
- The Prototype Build Report now contains a dedicated **Sample-specific evidence** section with per-sample description, structured data and selected photos/captions.
- Sample History also displays the retained description, data and photo evidence.
- If sample evidence changes after a Build Report is FINAL, the report approval is invalidated, the report revision advances and controlled re-approval is required. A superseded document record is retained in document history.

## REV 1.0.25 — controlled reports, archived examples & proposal-first planning

- Added three completed/archived demonstration projects with retained traceability and approved final build reports.
- Build Report no longer contains cost and cannot become FINAL until the relevant controlled approver signs it.
- Added a substantially upgraded Test & Characterisation Report with raw measurement data, specifications, automatic mean/stdev/Cpk, measurement FPY, build yield, yield loss, rework, scrap and hold indicators.
- AUTO-PLAN and portfolio optimization now preview all proposed date/resource changes and require explicit Accept or Reject before the live schedule is modified.
- Added an automatic once-per-day Operations Improvement Review and a visual dashboard summary with direct links into the Action Centre.

## REV 1.0.24 — editable competencies
- Competency master records can now be edited directly from **Lab Standards & Resources → Skill Catalogue**.
- The competency ID remains immutable so process standards, bookings, certificates and audit history keep their references.
- Editable fields include competency name, owner, scope/description, required certificate type, certificate validity, renewal-training duration and training/evidence requirement.
- Staff rows now use **Manage competencies** to issue/renew or revoke qualification certificates. AUTO-PLAN remains certificate-gated.
- Renewing a competency supersedes the prior valid certificate for that person/skill while retaining it as historical evidence.
- Certificate expiry defaults from the competency's configured validity; changes to the master do not rewrite certificates already issued.

## REV 1.0.23 — planning situations & delivery commitment control
- Planning now accepts explicit capacity situations such as vacations, staff absence, equipment outage/shutdown and lab closure.
- Situations are hard constraints for AUTO-PLAN and appear as red ✕ bars on the shared planning timeline.
- Each build preserves an immutable original commitment, current/final commitment, replan count, net movement, schedule churn and actual delivery date.
- Every accepted commitment movement requires a reason category and explanation, optionally linked to the planning situation that caused it.
- Management KPIs now show original-commitment hit rate, final-commitment hit rate, replan rate, average commitment movement and reason-category Pareto.

## REV 1.0.22 — visual workflow, archive/search, reliable reports and optional consumable costing

- Workflow status is visually unambiguous: **green ✓ = done**, **yellow ● = open/ongoing**, **red ✕ = blocker or late**. The same semantics are used in the guided workflow and route/process flow.
- Planning swimlanes now show the calendar/date scale **once in a single header row** rather than repeating dates in every lane.
- Potential pipeline projects now carry an estimated project cost alongside probability and capacity impact.
- Completed/closed prototype projects are automatically archived and remain easy to find under **Prototype Requests → Archived**.
- Prototype Requests now supports search/filter by product, project, date, owner and submitter, with direct **Build report** and **Route traveller** actions.
- Dashboard was redesigned as a visual, action-first control room with exception tiles, capacity bars, build-flow cards and future-project value.
- Characterisation and Build Report failures caused by the missing `characterisationChart()` implementation are fixed. Large result/report views are also rendered more compactly.
- Product BOM now supports **Component** or **Consumable** lines with unit cost and waste %. Consumables can be enabled per build and supplemented with one-off build consumables; the feature remains optional.
- Cost roll-up separates materials, process/test charges and consumables, and includes BOM/build consumables only when enabled.
- Browser legacy-cache cleanup runs once per app revision instead of on every launch.

## REV 1.0.20 — planning clarity, synchronized KPIs and live blocker state

This revision builds on REV 1.0.18 and adds:

- day-by-day swimlane planning with weekday/date headers;
- automatic suppression/removal of Action Centre blockers once their real completion condition is satisfied;
- one KPI timing selector used consistently across performance, capacity and pipeline charts;
- weekly, monthly, quarterly, single-week and single-month KPI views with explicit axes/scales;
- editable probability-weighted future-project pipeline with per-project capacity impact;
- E0/E1/V/P detail reduced to foldouts only where the control level is selected or changed.

The app remains a static GitHub Pages POC using IndexedDB behind repository/service abstractions.

## Prior REV 1.0.18 baseline


REV 1.0.20 makes the build-execution model explicit:

**requested quantity → sample register → process execution per sample/batch → in-process Control Plan results → end characterisation → sample genealogy.**

Each physical prototype has three distinct identifiers:

- **Lab Sample ID** — permanent internal trace key, generated by the system and never edited.
- **Sample number** — human-facing working label (for example 01, A, Fixture-3), editable without breaking history.
- **Formal serial number** — separate controlled serial, required for V/P and optional for E0/E1.

Equipment is never permanently assigned to a sample. It is recorded against each process execution. Only equipment with the capability required by the selected process can be used. Control Plan measurements are captured during the linked route step; end-characterisation results are captured later against the same sample register.

**Forecast delivery** means AUTO-PLAN's earliest predicted handover date after material timing, route/test work, resource constraints, calibration/maintenance/training readiness and final lab handling. It remains provisional until Lab Triage commits the plan.

## Revision 1.0.12 — purpose-based prototype control and editable build routes

The visible application header always shows the running revision: **REV 1.0.12**.

The guided request flow is deliberately ordered so that a forecast is not invented before the lab knows what must actually be built:

1. **Request definition & submission**
2. **Material source & feasibility**
3. **Process route & test-method assessment**
4. **Lab feasibility, resource plan & committed timing**
5. **Control Plan, risk controls & special approvals**
6. **Build readiness**
7. **Identify units where required & execute the guided build**
8. **Characterise, evaluate & disposition exceptions**
9. **Release approval**
10. **Deliver, retain records & feed learning**

AUTO-PLAN can now run at any point after submission as a **best-feasible preview**. Material and process/test definition are still required before the forecast can be formally committed, but incomplete inputs no longer create a dead end. The planner uses explicit provisional assumptions and identifies what must still be resolved.

### Product master

REV 1.0.12 adds **Products & BOM** as a first-class menu area. Engineering Project Lead / Administrator can create and edit product family, part number, product revision, hardware/software revision, product-safety default, exact controlled BOM and default released-process route. New requests inherit the current product master; existing controlled requests are not silently rewritten.

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

REV 1.0.12 removes routine planner dead ends. For each task the optimizer searches all capable equipment, all people associated with the required skill, current and scheduled calibration/maintenance/training readiness, existing bookings and later working-time slots. It returns the earliest best-feasible schedule it can construct, even when that forecast misses the requested date.

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

IndexedDB is the primary persistence mechanism. Use **Configuration & data** as Administrator to export JSON, import JSON or reset the demo. Current schema version is **13** and migration logic upgrades earlier local POC data without requiring a reset.

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


## Purpose-based workflow (REV 1.0.12)

Each request selects an assurance profile: E0 Rapid Engineering, E1 Controlled Engineering, V Validation / Customer, or P Production Intent. The guided checklist only shows controls required by that purpose. Routes can start blank, from the product standard, or as a copy of a previous build; the copied route is always editable inside the request. Control Plans have a direct editor; editing an approved plan creates a new Draft revision. Guided Build Execution / Unit Identification explains exactly why the execution record exists: it captures what was actually done, by whom, with which equipment/process revision, evidence and actual duration. Rapid Engineering can use a build-level record without individual unit IDs.


### REV 1.0.12 workflow scaling

Prototype governance is now purpose-based rather than one-size-fits-all. E0 Rapid Engineering removes formal customer/production controls unless safety or the selected purpose requires them; E1 Controlled Engineering retains repeatability/traceability; Validation and Production Intent progressively add released methods, risk/Control Plan controls, independent approval, genealogy and formal release. Product Safety always forces at least Validation.

Build routes can be created from a blank canvas, copied from the product standard, or copied from a previous build. Reuse never silently edits the source: the request receives its own editable route copy. Approved Control Plans remain immutable; selecting Edit creates a new Draft revision linked to the superseded approved revision. Guided Build Execution replaces the ambiguous traveller terminology and records what was actually done, by whom, using which process revision/equipment, with evidence and actual duration.


## Revision 1.0.12 — editable process definitions, calibration certificates and lab staff

- **Lab Standards & Resources → Edit process** now edits the complete created process definition, including scope, planning standard, required equipment capability, certified skill, cost basis, work instruction and evidence. Editing a Released process creates a new Under-review revision instead of silently changing the released revision.
- **Equipment & Calibration → + Add certificate** records calibration certificate number, issuer, calibration date, next due date, traceability/reference standard, result and evidence/file reference. A passing certificate updates equipment readiness.
- **Lab Standards & Resources → + Add staff / Edit person** maintains lab planning resources, roles, teams and availability. Skills remain certificate-gated and must be issued through the existing training-certificate workflow.
- Request-specific build routes remain editable step-by-step with Edit / move / remove / insert controls.


## REV 1.0.20 — guided blocker resolution

- **Action Centre → Resolve** now opens a blocker-specific guided workflow instead of jumping directly into a workspace section.
- Every guided blocker shows **what is wrong, why it matters, owner/role, due date, impact, resolution path, current step, evidence required and the condition that clears the blocker**.
- The seeded **Laser weld geometry outside released process envelope** example opens the linked process-development workflow and highlights the actual next incomplete gate. In the demo this is **Risk review**, after Need / Plan / Trial / Parameters are already complete.
- Process-development resolution walks through **Need → Plan → Trial → Parameters → Risk → Measurement → Capability → Control Plan → Work instruction → Approval → Release**.
- Each development step requires an evidence/reference note plus confirmation of the stated completion criterion; the evidence is audit-recorded.
- The resolver offers direct links to relevant controlled records such as process risks, characterisation, Control Plan and work instruction context.
- Releasing the developed process clears the originating Action Centre blocker.
- Guided resolver models are also provided for material, Control Plan, quality decision, product-safety/approval, calibration and engineering-clarification actions.
- The same guided resolver is used from the request workspace **Next action** card, so Action Centre and workspace behaviour are consistent.
- REV 1.0.15 request editing and explicit E0/E1/V/P included/conditional/not-required controls are retained.


## REV 1.0.20
- Dashboard redesigned as an operational control room for last/current week execution, resource use, blockers, decisions and 14-day delivery watch.
- Management KPI page reduced to six core KPIs plus trends, bottlenecks, capacity outlook and pipeline.
- Request workspace summary is no longer sticky, preventing detail text from rendering underneath the top tiles.

## REV 1.0.20 — Operational horizon dashboard

The lab dashboard is now the near-term operating control room. It defaults to last/current/next week and can switch to previous/current/next month. Product and project filters change build demand while calibration, maintenance and training remain visible because they consume shared resources. People and equipment workload are shown against available capacity for every displayed period. Ongoing builds, upcoming/overdue deliverables with owners, and unresolved operational decisions are presented alongside the same horizon. Management KPIs remain the complementary trend, process-health and future-outlook layer.

## REV 1.0.32 — Quality Workbench

The Quality / Deviations status page is replaced by an actionable Quality Workbench. Quality can create controlled cases, manage release holds, capture containment/root cause/objective evidence, disposition parts, assign and close corrective/rework/retest actions with owner and due date, verify effectiveness and close. Separate views manage the Control Plan approval queue, PFMEA risk priorities, root-cause trends/continuous-improvement proposals and closed case history. The legacy workspace and Action Centre quality shortcuts now open the same complete controlled quality-case workflow.
