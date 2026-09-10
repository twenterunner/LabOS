# LabOS — Laboratory Operations System POC · REV 1.0.59

LabOS is a static GitHub-Pages proof-of-concept for controlled automotive prototype-build operations. It connects requests, products/BOMs, customers, released process routes, Control Plans, sample execution, resource readiness, quality/release evidence, reporting, audit readiness and closed-loop planning/improvement.




## REV 1.0.59 — governed Gage R&R decisions, 5S KPIs and closed-loop audit resolution

REV 1.0.59 makes measurement-system decisions explicit and keeps the authorised user in control. Gage R&R now shows a separate LabOS **APPROVE / REJECT recommendation** using conservative AIAG-style automotive defaults: a balanced crossed study, typically 10 parts, 2–3 operators and 2–3 repeated trials; <10% GR&R is acceptable, 10–30% requires application-specific judgement, >30% is unacceptable, and ndc should be at least 5. These are workflow defaults rather than a claim that IATF 16949 itself imposes universal numeric limits; applicable customer-specific requirements and intended-use risk take precedence. The reviewer must still make and justify the final decision, and controlled overrides remain visible in the audit trail.

The Management KPI cockpit now includes **5S workplace condition and trend** from actual recorded 5S checks, including the current average, zones at standard, open 5S actions, pillar condition and trend by zone. Audit-readiness calibration blockers now open an exact resolution path from scheduling through certificate evidence and independent approval; scheduling alone is explicitly shown as insufficient. Audit evidence-pack mobile/print formatting has been reworked, and release sign-off packages now bind actions to stable approval-record IDs so a visible signer package cannot disappear between render and tap.

## REV 1.0.58 — fewer approval clicks, clearer ownership

Approvals are now grouped into controlled decision packages. A signer sees one action for related items at that decision point; if two or three independent people must sign, LabOS shows all of them explicitly with `signed / pending` progress and covered scope. Generic Build Readiness approval noise is suppressed because readiness itself remains the governing evidence gate. Every main workspace also exposes the next action and owner; the guided build cockpit shows the current owner, consolidated sign-off progress and next-step owner.


## REV 1.0.57 — governed measurement assurance, safer exceptions and faster navigation

REV 1.0.57 adds MSA / Gage R&R, governed EHS and commissioning evidence for processes and equipment, formal calibration-procedure and calibration-certificate approval, controlled process-step skip approval, administrator exceptions that remain auditable, product-grouped Control Plans, retrospective/manual Lessons Learned capture, generated sample identity without duplicate entry, guided blocker-resolution paths and sticky section-jump navigation across long workspaces. Action semantics are standardized: blockers/resolution are red, next-step actions are yellow, and administrator exceptions are visually distinct.

## REV 1.0.55 — LabOS platform architecture, scoped capability studies and readiness revision fix

This revision deliberately evolves the POC from a prototype-only menu toward the eventual LabOS operating model while keeping **Prototype** as the only fully implemented workstream:

- **One Requests front door** now introduces Prototype, future Validation and future Failure Analysis work types. The two future modules are clearly marked as framework placeholders; they do not create fake operational records.
- **Workstreams are first-class:** Prototype is operational; Validation reserves the future DV/PV / reliability / test-development flow; Failure Analysis reserves the failure → root cause → corrective action → verification loop.
- **Shared operations remain shared.** Planning, products/BOM, standards/resources, resource assurance, sample/serial history, quality, reports and management are not duplicated under each workstream.
- **Capability & SPC workspace removed in REV 1.0.57.** Quality now focuses on Control Plans, MSA/Gage R&R, quality cases, trends and history.
- **The former Capability & SPC UI is retired.** Measurement assurance is now handled through controlled MSA/Gage R&R records linked directly to the process/test/equipment where the measurement is used.
- **Build Readiness process-release defect fixed.** A build remains valid when its route points to a historically released process revision even if the library has since moved to a newer draft/under-review revision. If an exact routed revision really is missing or unreleased, LabOS names that specific step/revision instead of showing only the generic “Processes released” blocker.

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
- Quality → MSA / Gage R&R retains controlled measurement-system evidence and explicitly links each study to its process and/or Standard Test plus gage/equipment.
- Lab Setup Wizard and controlled CSV migration support customers, products, people, competencies, equipment, calibration/maintenance/training evidence and certificate links.
- Calibration, maintenance and training durations are schedulable and participate in planning.
- 5S workplace control, configurable test families, measurement-system assurance and the personal Action Centre remain available.

## GitHub Pages

Upload the ZIP contents to the repository root. `index.html` must remain at root. No npm, backend, login or API key is required for this POC.

## Production boundary

This prototype supports controlled automotive-quality workflows but is not itself a production QMS/LIMS. Production deployment still requires authenticated identity/SSO, server-side authorization, shared transactional persistence, concurrency controls, validated electronic signatures where applicable, immutable audit/retention storage, backup/disaster recovery, cybersecurity hardening and governed enterprise integrations.
