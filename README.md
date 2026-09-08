# ProtoLab OS — Automotive Prototype Build Management POC

ProtoLab OS is a browser-only proof-of-concept for controlled automotive prototype-build operations. It supports engineering requests, material/process feasibility, realistic resource planning, controlled process/test definitions, PFMEA-linked risk, Control Plans, readiness, digital traveller execution, serial genealogy, characterisation, deviations/rework, approvals, release, delivery, cost, reporting, audit history and learning from previous builds.

## Revision 1.0.5 — practical feasibility-first planning

The visible application header always shows the running revision: **REV 1.0.5**.

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

AUTO-PLAN is intentionally unavailable until the material and process/test inputs needed for a credible schedule are defined.

### Material source

The engineering request has only two source routes:

- **Engineering supplied** — Engineering records the responsible supplier/owner and expected arrival at the lab. This date is a planning constraint. Build Readiness still requires physical receipt of the exact BOM lot and issue to the build.
- **Lab supplied** — the lab must reserve exact matching inventory by part number, revision and quantity before the request is planning-eligible. Reserved material supports scheduling; physical issue is still required before build start.

Material cannot be made ready by assigning an arbitrary lot.

### Planning basis

Resource bookings are created only from a **confirmed process route and defined requested tests**. Each booking is based on controlled master data:

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

### Learning from previous builds

The planner does not treat standard times as permanently perfect. Seed data contains historical completed builds for every demo product. For the same product family, duration estimates blend the controlled lab standard with the median actual duration from previous builds. The booking UI exposes the estimate basis so the planner can see whether a duration came from a standard alone or from historical evidence.

When a delivered request is closed, the learning record retains actual process durations together with first-pass yield, scrap, rework, recurring issues and lessons learned. These records become the basis for future same-product estimates and management insight rather than disappearing into a closed project.

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

IndexedDB is the primary persistence mechanism. Use **Configuration & data** as Administrator to export JSON, import JSON or reset the demo. Current schema version is **3** and migration logic upgrades earlier local POC data without requiring a reset.

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
