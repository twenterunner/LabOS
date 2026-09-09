# LabOS — Prototype Build Management POC · REV 1.0.47

LabOS is a static GitHub-Pages proof-of-concept for controlled automotive prototype-build operations. It connects request intake, customers, product/BOM definition, process-route planning, sample execution, Control Plan evidence, equipment/staff readiness, quality disposition, reporting, audit readiness and closed-loop improvement.

## What changed in REV 1.0.47

- Audit scope is mandatory before an audit evidence pack can be generated; controlled records-retention and internal-audit references can be maintained alongside it.
- Every automated Major/Minor audit finding has a guided **Resolve → evidence → recheck** path, with the affected records identified.
- Audit evidence pack now indexes scope, capability/uncertainty, calibration, maintenance, competence/training, methods, Control Plans, sample traceability, quality/CAPA, approved build dossiers, change/audit trail and readiness schedule.
- Customer master data is again visible under **Configuration & data → Customers & requirements**.
- The duplicate risk-analysis module has been removed. External controlled risk analysis remains the source of truth; applicable special characteristics and controls flow into the LabOS Control Plan.
- Calibration and maintenance durations are configurable per equipment item; training duration is configurable per competency.
- Calibration, maintenance and training can each be scheduled directly, even when the user is not starting from an automatically generated due item. Accepted slots reserve resource capacity and conflicts flag affected builds for replan.
- Printable combined and activity-specific readiness schedules are available.
- Calibration, maintenance and training reports include certificate/evidence links when a document or controlled URL is stored.
- Prototype Requests can be sorted by submission date, required date, product, customer or priority, and filtered by customer.
- High-information screens use progressive disclosure/foldouts so primary actions stay visible.

## Run on GitHub Pages

Upload the ZIP contents to the repository root. `index.html` must remain at root. No npm, backend, login or API key is required for this POC.

## Important POC boundary

This prototype supports IATF/ISO-style controlled workflows but is not itself a certified QMS/LIMS. Production use still needs authenticated identity/SSO, server-side authorization, durable shared storage, concurrency controls, validated e-signatures where required, immutable audit logging/retention, backups, cybersecurity hardening and enterprise integrations.

## Main files

`index.html`, `styles.css`, `core.js`, `demo-data.js`, `repository.js`, `services.js`, `app.js`, `service-worker.js`, `USER_MANUAL.html`, `QUICK_START.md`, and verification scripts/results.
