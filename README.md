# LabOS — Prototype Build Management POC · REV 1.0.50

LabOS is a static GitHub-Pages proof-of-concept for controlled automotive prototype-build operations. It connects requests, products/BOMs, customers, released process routes, Control Plans, sample execution, resource readiness, quality/release evidence, reporting, audit readiness and closed-loop planning/improvement.

## Operating contract in REV 1.0.50

**No dead ends. No fake completion. No accepted recommendation that leaves the user to work out the next step.**

An actionable recommendation is shown only when LabOS has already found a complete feasible implementation. Accepting it revalidates and applies the controlled changes. Capacity situations are also transactional: the constraint and complete portfolio replan are accepted together or neither is saved. Structural blockers route into guided competency/equipment/staff resolution and automatically retry the pending solution after the blocker is resolved.

## Key REV 1.0.50 changes

- Large build quantities no longer create permanently expanded sample lists. Sample registers and execution-group selection collapse into searchable foldouts; all pending samples remain selected by default and can be changed when needed.
- **Sample & Serial History** has full-text search and collapsible groups with clean sample/Lab ID/formal-serial/build metadata.
- The former **Characterisation** navigation item is now **Results & Capability**: a review/analytics workspace only. Governed measurement entry remains at the actual route step or end-test workflow, avoiding duplicate data-entry paths.
- **Lab Setup Wizard** guides a new lab through scope, customers/internal use, products/BOM, people/competencies, equipment/readiness durations, calibration-maintenance-training evidence, released processes/methods and go-live integrity checks. A lab with no historical readiness evidence can explicitly choose a clean start, after which LabOS schedules required readiness work before first governed use.
- **LIMS migration** supports controlled CSV import of equipment, calibration certificates, maintenance records, staff, competencies, training certificates, products and customers. Imports are applied to a clone, validated, and committed only if the resulting state is valid. Evidence/certificate URLs are retained as clickable references.
- Calibration, maintenance and training duration are part of the scheduling transaction. If a selected readiness slot affects planned work, LabOS automatically replans the affected builds and commits only when no controlled collision remains.
- Improvement Scan exposes only prevalidated, end-to-end executable staffing/equipment load-balancing proposals. Acceptance changes the actual bookings/assignments and verifies the result atomically.
- The v1.0.48 governed build-execution model remains: confirmed route + released process revision + approved Control Plan → real execution group → recipe/setup → sampling-rule-driven process/CP evidence → completion.

## GitHub Pages

Upload the ZIP contents to the repository root. `index.html` must remain at root. No npm, backend, login or API key is required for this POC.

## Production boundary

This prototype supports controlled automotive-quality workflows but is not itself a production QMS/LIMS. Production deployment still requires authenticated identity/SSO, server-side authorization, shared transactional persistence, concurrency controls, validated electronic signatures where applicable, immutable audit/retention storage, backup/disaster recovery, cybersecurity hardening and governed enterprise integrations.

## REV 1.0.50 usability model

REV 1.0.50 removes duplicated execution controls and integrates route-step navigation into the sticky build cockpit. Laboratory audit scope is maintained by equipment capability/category instead of repeating the same scope statement per asset. Standard-test families are controlled master data. Optional 5S workplace checks create evidence-backed owner actions. The Action Centre is an individual work queue rather than a shared list; this visibility rule does not weaken global build/readiness blockers.
