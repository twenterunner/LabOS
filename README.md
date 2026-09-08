# ProtoLab OS — Automotive Prototype Build Management POC

ProtoLab OS is a completely new browser-only proof-of-concept for controlled automotive prototype build operations. It supports guided engineering requests, lab triage, process selection/development, process-risk linkage, first-class Control Plans, readiness gates, digital traveller execution, serial genealogy, characterisation, deviations/rework, approvals, release, delivery, cost, reporting and audit history.


## v1.0.4 control-flow and planning update

Request workspaces now use **10 top-level guided controls** instead of the earlier 18-item list. Detailed compliance/readiness checks remain inside those controls so the top-level operating flow stays understandable on a phone. The header always shows the application revision.

v1.0.4 also makes material readiness requirement-driven (exact part number/revision/quantity), makes AUTO-PLAN create visible step-level equipment/person bookings plus a forecast and schedule margin, treats a Control Plan target **or** objective limits as a valid specification basis, and auto-creates applicable Product Safety and customer approval records.

## Important compliance statement

This POC is designed to **support IATF 16949-aligned controls and audit-ready workflows**. Software alone does not make an organisation IATF 16949 certified. Customer-specific requirements, product-safety controls, retention rules, approval matrices and controlled organisational procedures must be configured and governed by the deploying organisation.

The application uses original workflows and fields inspired by common automotive quality-management concepts. It does not reproduce proprietary standards or manuals.

## Run on GitHub Pages

1. Upload all ZIP contents to the **root** of a GitHub repository. `index.html` must remain at the root.
2. In GitHub: **Settings → Pages**.
3. Choose **Deploy from a branch**, select the branch and `/ (root)`.
4. Open the published Pages URL.

No npm, build step, backend, API key or external database is required.

## Local use

The intended deployment is GitHub Pages. For a realistic local browser test, serve the folder with any simple static web server. Opening `index.html` directly may work in some browsers, but service-worker behaviour requires HTTP(S).

## Architecture

The POC intentionally separates major concerns:

`UI → domain/service layer → repository interface → IndexedDB adapter`

Identity follows:

`Identity provider → current user → roles/permissions`

Key abstractions implemented in code:

- `StorageRepository`
- `IndexedDBStorageRepository`
- `DemoIdentityProvider`
- `BrowserDocumentStore`
- `LocalPlannerService` / `PlannerService`
- domain services for requests, processes, Control Plans, readiness, serials, quality and reports

The UI does not directly scatter IndexedDB calls throughout the application.

## Demo coverage

Seed data includes:

- 15 prototype requests
- 6 engineering teams
- 12 demo users / roles
- 8 product families
- 25+ standard process definitions
- 3 active process-development examples
- 8 Control Plans
- PFMEA-linked risk examples
- customer/OEM demo profiles
- material lots and genealogy
- equipment and calibration status
- competency examples
- 40+ serialized prototype units
- characterisation data
- deviations, rework and release holds
- delivered traceability example
- planning/resource bookings

## POC data

IndexedDB is the primary persistence mechanism. Use **Configuration & data** as Administrator to:

- Export JSON
- Import JSON
- Reset Demo Data

The export includes a schema version and the application contains a migration hook for later schema revisions.

## Main files

- `index.html` — GitHub Pages entry point
- `styles.css` — responsive industrial UI
- `core.js` — common domain constants, permissions and invariant checks
- `demo-data.js` — deterministic seed scenarios
- `repository.js` — storage, migration, document-store and identity abstractions
- `services.js` — domain/service layer and business guard rails
- `app.js` — UI rendering and guided interactions
- `service-worker.js` — legacy cache-cleanup worker for reliable POC updates
- `QUICK_START.md` — demo walkthrough
- `USER_MANUAL.html` — standalone task-based guide
- `VERIFICATION.md` — verification evidence and limitations
- `docs/FUTURE_ENTERPRISE_ARCHITECTURE.md` — enterprise migration path

## Deliberate POC limits

This is a static proof-of-concept, so it does **not** provide server-enforced security, real corporate authentication, server-side signatures, multi-user concurrency, authoritative ERP/PLM/MES integration, enterprise document storage, central backup or validated e-signature infrastructure. The architecture is prepared so those concerns can replace browser adapters later without redesigning the main user experience.
