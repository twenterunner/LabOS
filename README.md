# LabOS — Prototype Build Management POC · REV 1.0.52
## REV 1.0.52 — concise evidence reporting and laboratory performance cockpit

REV 1.0.52 redesigns the two densest evidence/management surfaces around progressive disclosure. The Prototype Build Report now uses compact tables for build definition, route execution, material/sample genealogy and sample-specific evidence. The Control Plan section combines definition, sampling and actual measured results in one place: SC, CC and every other governed Control Plan characteristic has an aggregate evidence row plus a sample-by-characteristic measurement matrix. Current Control Plan values are not repeated in the measurement appendix; statistical plots, reaction-plan detail, photos, process-step data, revision history and other secondary evidence are foldouts on screen and automatically expanded in the printed/PDF report.

The Management KPI workspace is renamed **Lab Performance** and is organised around four operating questions: Delivery & Flow, Quality, Readiness & Compliance, and Capacity & Cost. A management-attention panel shows only actionable exceptions and links to the owning functional workspace. Supporting trends, root-cause analytics, process performance, capacity detail, pipeline scenarios and KPI definitions are foldouts rather than permanently expanded cards.


LabOS is a static GitHub-Pages proof-of-concept for controlled automotive prototype-build operations. It connects requests, products/BOMs, customers, released process routes, Control Plans, sample execution, resource readiness, quality/release evidence, reporting, audit readiness and closed-loop planning/improvement.

## Operating contract in REV 1.0.52

**No dead ends. No fake completion. No accepted recommendation that leaves the user to work out the next step.**

An actionable recommendation is shown only when LabOS has already found a complete feasible implementation. Accepting it revalidates and applies the controlled changes. Capacity situations are also transactional: the constraint and complete portfolio replan are accepted together or neither is saved. Structural blockers route into guided competency/equipment/staff resolution and automatically retry the pending solution after the blocker is resolved.

## Key REV 1.0.52 changes

- Large build quantities no longer create permanently expanded sample lists. Sample registers and execution-group selection collapse into searchable foldouts; all pending samples remain selected by default and can be changed when needed.
- **Sample & Serial History** has full-text search and collapsible groups with clean sample/Lab ID/formal-serial/build metadata.
- **Process Capability** replaces the old generic Results/Characterisation browser for engineering-quality roles. It uses governed **Control Plan measurements only** to answer whether a controlled characteristic remains stable/capable across builds. It prioritises specification failures, low Cpk, non-normality and traceability gaps, with build-level source drill-down. It is not a second data-entry route.
- **Lab Setup Wizard** guides a new lab through scope, customers/internal use, products/BOM, people/competencies, equipment/readiness durations, calibration-maintenance-training evidence, released processes/methods and go-live integrity checks. A lab with no historical readiness evidence can explicitly choose a clean start, after which LabOS schedules required readiness work before first governed use.
- **LIMS migration** supports controlled CSV import of equipment, calibration certificates, maintenance records, staff, competencies, training certificates, products and customers. Imports are applied to a clone, validated, and committed only if the resulting state is valid. Evidence/certificate URLs are retained as clickable references.
- Calibration, maintenance and training duration are part of the scheduling transaction. If a selected readiness slot affects planned work, LabOS automatically replans the affected builds and commits only when no controlled collision remains.
- Improvement Scan exposes only prevalidated, end-to-end executable staffing/equipment load-balancing proposals. Acceptance changes the actual bookings/assignments and verifies the result atomically.
- The v1.0.48 governed build-execution model remains: confirmed route + released process revision + approved Control Plan → real execution group → recipe/setup → sampling-rule-driven process/CP evidence → completion.

## GitHub Pages

Upload the ZIP contents to the repository root. `index.html` must remain at root. No npm, backend, login or API key is required for this POC.

## Production boundary

This prototype supports controlled automotive-quality workflows but is not itself a production QMS/LIMS. Production deployment still requires authenticated identity/SSO, server-side authorization, shared transactional persistence, concurrency controls, validated electronic signatures where applicable, immutable audit/retention storage, backup/disaster recovery, cybersecurity hardening and governed enterprise integrations.

## REV 1.0.52 usability model

REV 1.0.52 also fixes the 5S zone-action binding so **Run 5S check**, **Edit zone** and guided 5S resolution act on the selected zone/action instead of silently receiving an empty identifier. The 5S click path is covered by a behavioral handler test. Process Capability is restricted to governed Control Plan evidence and is visible only to roles that benefit from cross-build process monitoring. The earlier v1.0.50 sticky route navigation, category-level audit scope, configurable test families and personal Action Centre remain intact.