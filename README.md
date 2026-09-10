# LabOS — Prototype Build Management POC · REV 1.0.54

LabOS is a static GitHub-Pages proof-of-concept for controlled automotive prototype-build operations. It connects requests, products/BOMs, customers, released process routes, Control Plans, sample execution, resource readiness, quality/release evidence, reporting, audit readiness and closed-loop planning/improvement.

## REV 1.0.54 — hard workflow gates, learning closeout and plain-language reporting

This revision completes the hard guided-workflow contract introduced in the previous releases:

- **Lab Setup milestones are explicit.** Existing data does not create green ticks. A setup step becomes green only after its minimum required information is present and the step is deliberately saved/completed; later setup steps remain locked until earlier steps are complete.
- **Build workflow hopping is blocked.** Later lifecycle/workspace steps cannot be opened while an earlier required step remains incomplete.
- **Lessons & Learning is a real closeout stage.** LabOS derives candidate lessons from quality/yield exceptions, schedule churn, material constraints, process-time overruns, failed controlled measurements and released method development. Duplicate evidence is consolidated. Each proposal must be accepted or rejected with rationale before controlled closeout; accepted learning is included in the Build Report.
- **Build Report terminology is explicit.** Sample route progress is shown as “11 of 12 operations” rather than a cryptic ratio, and legacy material that does not satisfy a current BOM requirement is labelled “Not linked to current BOM”. Compact report tables are viewport-safe on mobile; complex analytical matrices scroll only within their own container.
- **Commitment decisions are actionable.** If the latest forecast differs from the date currently promised, Planning shows a direct **Commitment decisions → Review** queue with current date, proposed forecast, movement and reason.
- **Audit history no longer dumps raw objects/JSON.** Structured snapshots are summarized into readable change/rationale entries.
- **Setup cannot dead-end on imported equipment durations.** Missing calibration/maintenance durations can be completed directly in the Equipment setup step before continuing.

The previous live-readiness, deterministic staff substitution, material-output limiting, Android visual-viewport containment, concise Build Report, Lab Performance cockpit, 5S, controlled process execution and LIMS-import features remain retained.

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
