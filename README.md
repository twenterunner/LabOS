# LabOS — Prototype Build Management POC · REV 1.0.53

LabOS is a static GitHub-Pages proof-of-concept for controlled automotive prototype-build operations. It connects requests, products/BOMs, customers, released process routes, Control Plans, sample execution, resource readiness, quality/release evidence, reporting, audit readiness and closed-loop planning/improvement.

## REV 1.0.53 — live readiness, material-output control and mobile workflow hardening

This revision addresses four operational defects found during Android use:

- a readiness item that has actually been resolved is re-evaluated immediately and the workspace is rerendered, so the item changes to **green / Ready** without requiring a manual refresh;
- staff planning now honors an explicitly selected replacement person and excludes unavailable people whenever a valid available alternative exists;
- engineering-material receipt defaults to the exact remaining BOM need, accepts buffer/excess stock, and records a lower receipt as a governed **material output limiter** that caps new sample creation until more material is issued;
- modal sizing is tied to the browser's real `visualViewport` as well as responsive CSS, and the process-data matrix uses shorter, separated headings and sample identifiers to avoid Android overflow/clutter.

The REV 1.0.52 concise Build Report and **Lab Performance** cockpit remain intact: actual SC/CC/PS/other Control Plan values appear in the report once, supporting detail uses foldouts, and management KPIs are exception-first across Delivery & Flow, Quality, Readiness & Compliance, and Capacity & Cost.

## Operating contract

**No dead ends. No fake completion. No recommendation that leaves the user to work out the next step.**

An actionable recommendation is shown only when LabOS can carry the proposal through a controlled implementation or a guided evidence-backed workflow. Planning changes are revalidated before commitment. Blockers remain visible until their underlying evidence actually changes.

## Retained UX / governance features

- Large builds use searchable/collapsible sample registers and execution-group selection rather than hundreds of permanently expanded cards.
- Build execution follows the confirmed route + released process revision + approved Control Plan, with recipe/setup capture and sampling-rule-driven per-sample evidence in one matrix.
- Sample & Serial History supports search and grouped drill-down.
- Process Capability uses governed Control Plan evidence only for cross-build drift/capability analysis.
- Lab Setup Wizard and controlled CSV migration support customers, products, people, competencies, equipment, calibration/maintenance/training evidence and certificate links.
- Calibration, maintenance and training durations are schedulable and participate in planning.
- 5S workplace control, configurable test families, category-based capability scope and personal Action Centre remain available.

## GitHub Pages

Upload the ZIP contents to the repository root. `index.html` must remain at root. No npm, backend, login or API key is required for this POC.

## Production boundary

This prototype supports controlled automotive-quality workflows but is not itself a production QMS/LIMS. Production deployment still requires authenticated identity/SSO, server-side authorization, shared transactional persistence, concurrency controls, validated electronic signatures where applicable, immutable audit/retention storage, backup/disaster recovery, cybersecurity hardening and governed enterprise integrations.
