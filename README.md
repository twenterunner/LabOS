# LabOS REV 1.0.159

**Current prototype release: REV 1.0.159**  
**Browser schema: 37**  
**Baseline strategy:** rebuilt from the clean REV 1.0.151 Prototype application so Validation uses the same application runtime, navigation, workflow shell and Programme Logic visual language rather than a parallel mini-app.

## Run the static PoC

1. Extract the ZIP.
2. Open `index.html` in a modern Chromium-based browser, or serve the folder from a simple static web server.
3. Confirm the header shows **REV 1.0.159**.
4. The PoC uses browser-local persistence. Use the existing export/import controls before clearing browser site data.

## Runtime files

- `index.html` — application entry point.
- `labos-core-1.0.159.js` — common domain/model utilities and KPI definitions.
- `labos-demo-data-1.0.159.js` — populated Prototype demo state.
- `labos-repository-1.0.159.js` — local persistence/repository layer.
- `labos-services-1.0.159.js` — shared planning, readiness and domain services.
- `labos-app-1.0.159.js` — the **single canonical application runtime**, including Prototype and Validation UI/workflows.
- `labos-styles-1.0.159.css` — shared styling for both workstreams.
- `service-worker.js` — deployment-reset worker; no long-lived offline runtime cache.

There is deliberately **no separate Validation application/runtime** in this release.

## REV 1.0.159 — Prototype UX is the master pattern

REV 1.0.159 changes the implementation strategy. Validation is rebuilt inside the proven REV 1.0.151 Prototype shell instead of being developed beside it and cosmetically harmonised later.

The operating rule is:

> If a Validation interaction can reasonably behave like the corresponding Prototype interaction, it uses the same LabOS component and interaction pattern.

Shared patterns include portfolio navigation, fixed programme cockpit, workflow steps, Programme Logic canvas, leg/lane styling, node cards, action placement, planning semantics, audit, reports, lessons, Archive Manager and mobile treatment.

## Validation workflow

The controlled Validation flow starts with requirements:

1. **Requirements** — define or import the customer specification and review source clauses.
2. **Programme Logic** — generate/review the snapped test-leg/sequence graph.
3. **Resource Plan** — use the same constrained LabOS planning resources and calendars as Prototype.
4. **Readiness** — equipment, competence, method, calibration/MSA and DUT readiness.
5. **Execution** — execute controlled tests and capture evidence/results.
6. **Verification** — roll results back to customer requirements/RTM.
7. **Report & Close** — controlled report, approval, archive and lessons learned.

Opening a Validation programme starts at **Requirements**.

## Customer specification → Validation programme

Validation may be defined manually or imported from customer-controlled content. The structured template supports customer programme intent, not only a flat requirement list. Fields include requirement/clause identity, requirement text, acceptance criteria, test leg, sequence, predecessor, DUT quantity/context and verification intent.

The primary guided flow is:

**Customer requirements → mapping review → Generate Validation Programme → snapped Programme Logic → shared planner.**

For each requirement the engineer reviews an explicit verification decision:

- **Reuse** a released Standard Test;
- **Adapt** an existing test/method;
- **Combine** multiple controlled tests;
- **Develop new** where no adequate method exists;
- **Other verification** with controlled justification.

Mapping remains an engineering decision. LabOS may propose a reusable method, but a proposal does not itself approve requirement coverage.

### Worked customer-PDF example

The in-app worked example stages four customer clauses into two independent legs:

- **Environmental durability**: thermal exposure → functional verification;
- **Mechanical durability**: vibration → functional verification.

After requirement review and mapping, LabOS generates separate execution occurrences for each customer leg even when the same released Standard Test is reused. This preserves the correct DUT genealogy and sequence while reusing the controlled method definition.

## Programme Logic

Prototype and Validation use the same Programme Logic renderer and visual grammar.

- visible legs/lanes;
- blocks snapped to a controlled leg rather than freely floating between legs;
- dependency/sequence connectors;
- shared node-card treatment;
- zoom and auto-layout;
- mobile-friendly interaction;
- controlled structural changes with audit history.

For Prototype, route/process/test definitions are adapted into the same canvas. For Validation, customer requirements and mapping decisions generate the test programme graph. Domain-specific controls remain around the common canvas rather than creating a second canvas implementation.

## Archive Manager

Archive Manager is a platform capability for both Prototype and Validation. Active Prototype builds and Validation programmes can be archived with reason/audit evidence and restored where permitted by the existing archive controls.

## Shared master data

Lab Standards & Resources remains the common source for equipment, methods/tests, people/competencies and 5S workplace controls. Prototype and Validation consume the same controlled resources and therefore compete for the same planning capacity.

## Development learning

Method/process development evidence is intended to remain shared across workstreams: estimated/latest/actual effort and lessons can inform future Prototype or Validation work. Released Validation methods can become reusable Standard Tests through controlled governance rather than being trapped inside one programme.

## Scope boundary

REV 1.0.159 remains a static-browser proof of concept. Production deployment still requires governed backend persistence, multi-user authentication/authorization enforcement, concurrency/transactions, controlled evidence storage and server-side audit guarantees.
