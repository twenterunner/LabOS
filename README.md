# LabOS — Prototype Build Management POC · REV 1.0.48

LabOS is a static GitHub-Pages proof-of-concept for controlled automotive prototype-build operations. It connects request intake, customers, product/BOM definition, governed process routes, sample execution, Control Plan evidence, equipment/staff readiness, quality disposition, reporting, audit readiness and closed-loop improvement.

## What changed in REV 1.0.48

REV 1.0.48 rebuilds the **Use or adapt engineering route & methods** and **Build samples & capture process evidence** workflows around one governing model:

**confirmed route + released process revision + approved Control Plan → execution group → required setup/recipe → required sample evidence → completion**

- Each route operation shows its released method, governed process controls and applicable Control Plan characteristics in one concise list.
- Released-process revisions are resolved from the revision captured on the build route; a later library revision does not silently redefine an older route step.
- Process standards can define controlled execution fields: recipe/program, machine/setup values, sample measurements and observations.
- Build-specific fields extend the released process definition rather than replacing it.
- Control Plan characteristics are linked to the actual process/route step. Only an **Approved** Control Plan drives formal execution measurements.
- Sampling rules are executable: `100% / each unit`, fixed sample counts, percentages, first+last and 1-per-N plans create the required sample subset for the active execution group.
- A 100% CP characteristic blocks route-step completion until every applicable sample has a current execution-run measurement.
- If a released process sample field duplicates a CP characteristic, the CP measurement is authoritative and appears only once.
- Recipe/setup data can be prepared before execution; sample results become editable only after the actual execution group is started.
- Every step has the same sample matrix plus CSV template/upload flow.
- Starting an operation records the actual execution group, operator, time and equipment. It no longer acts like a decorative timer or fabricates evidence.
- `[object Object]` work-instruction rendering is removed; the actual released instruction steps are shown.
- Method-development actions now capture real planning, trial, parameters, external-risk reference, measurement/capability, CP impact, work instruction and approval evidence. Release materialises those records into a real released process definition.
- Generic demo “Primary setpoint / Tolerance” placeholders have been replaced with process-appropriate examples and migrate automatically for the demo dataset.

REV 1.0.47 audit/resource improvements remain included: guided Major/Minor findings, customer configuration, maintenance/calibration/training scheduling and evidence links, printable readiness schedules, sorting/filtering and progressive disclosure.

## Run on GitHub Pages

Upload the ZIP contents to the repository root. `index.html` must remain at root. No npm, backend, login or API key is required for this POC.

## Important POC boundary

This prototype supports IATF/ISO-style controlled workflows but is not itself a certified QMS/LIMS. Production use still needs authenticated identity/SSO, server-side authorization, durable shared storage, concurrency controls, validated e-signatures where required, immutable audit logging/retention, backups, cybersecurity hardening and enterprise integrations.

## Main files

`index.html`, `styles.css`, `core.js`, `demo-data.js`, `repository.js`, `services.js`, `app.js`, `service-worker.js`, `USER_MANUAL.html`, `QUICK_START.md`, and verification scripts/results.
