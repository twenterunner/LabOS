# LabOS — Laboratory Operations System POC · REV 1.0.95

LabOS is a static GitHub-Pages proof-of-concept for controlled automotive prototype-build operations. It connects requests, products/BOMs, customers, released process routes, Control Plans, sample execution, resource readiness, quality/release evidence, reporting, audit readiness and closed-loop planning/improvement.

## REV 1.0.95 — canonical build task graph

REV 1.0.95 fixes a proven semantic planning defect: test-requirement IDs were positional, so changing selected tests could reuse the old ID for a different test. The sticky workflow rendered bookings while the controlled process/test definition rendered current requirements, and AUTO-PLAN could preserve a stale locked booking under the reused ID. The exact REV 1.0.94 failure is reproduced in `ROOT_CAUSE_REPRO_v1.0.95.json`.

There is now one canonical controlled planning graph (`planningTasksForRequest`) consumed by the sticky workflow, manual planner and AUTO-PLAN. Test identities are stable and semantic; bookings carry a task-definition fingerprint; stale future bookings are reconciled; route/test edits invalidate affected planning; an explicit final closeout is part of the task graph; and AUTO-PLAN cannot be accepted unless task coverage is exact. Existing saved states are migrated on load while completed/historical evidence is retained. Verification: **124/124 passed, 0 failed**, with the dedicated Chromium suite reporting **0 page errors**. See `CHANGELOG_v1.0.95.md`, `ROOT_CAUSE_PROOF_v1.0.95.md` and `VERIFICATION_v1.0.95.md`.


## REV 1.0.94 — tiered Master Planner and project authority

REV 1.0.94 turns the Master Planner into a decision cockpit: grouped ISO month/CW/day headings, actionable commitment-health filters, Total days late, no Detailed bookings section, Green/Yellow/Red AUTO-PLAN, target-first Escalation Mode, and provider-neutral Project Team roles/approval rights. It also normalises legacy 70/45/60 future-project probabilities to 0.70/0.45/0.60, preventing 100× inflation of probability-weighted capacity. AUTO-PLAN evaluates alternatives without mutating the live plan and never turns a horizon failure into a remote years-away proposal. See `CHANGELOG_v1.0.94.md`, `ROOT_CAUSE_PROOF_v1.0.94.md` and `VERIFICATION_v1.0.94.md`.

## REV 1.0.93 — explicit Control Plan governance and bounded AUTO-PLAN

REV 1.0.93 removes the misleading enabled Continue action when an edited Control Plan is still waiting for approval. The sticky SIGN-OFF and NEXT ACTION areas now name the actual pending signer / Quality Engineering gate, and the Control Plan page shows a three-stage approval path before Resource plan & committed timing. Any Control Plan content edit invalidates the current approval of that revision, preserves prior signatures as superseded audit history, creates fresh pending sign-offs and requires final Quality Engineering approval before the revised Control Plan becomes reusable portfolio content.

AUTO-PLAN now has a date-based planning horizon instead of the legacy 5,000/8,000 iteration bounds that could silently walk through nights and weekends for years. A deterministic reproduction on the untouched REV 1.0.92 planner produced a **13 Jun 2029** forecast for a request due **18 Sep 2026** (999 days late). The same scenario in REV 1.0.93 stops at the controlled horizon with `CAPACITY_UNRESOLVABLE`, leaves live bookings unchanged and writes no false forecast. Slot search also jumps across known blocking intervals rather than scanning each hour. Targeted verification: **22/22 passed**. See `ROOT_CAUSE_PROOF_v1.0.93.md` and `VERIFICATION_v1.0.93.md`.

## REV 1.0.83 — controlled requesting teams, guaranteed sticky standards navigation and safer AUTO-PLAN

REV 1.0.83 fixes the Lab Standards & Resources navigation at its actual runtime root cause. The dedicated standards navigator was being inserted correctly and then removed by a later generic section-navigator pass. The final render path now installs one authoritative sticky navigator after all older render hooks have finished. It remains pinned while scrolling and covers Resource assurance, Equipment & scope, Methods & standards, People & competencies, Requesting teams, 5S workplace and Governance.

**Requesting teams are now controlled master data.** The Engineering team field in New prototype request no longer comes from a stale hard-coded sensor-business list. `Lab Standards & Resources → Requesting teams` is the source of truth. Administrators can add, rename, activate and deactivate teams without destroying historical request references. Existing demo states migrate the old ADAS / Powertrain / Thermal / Chassis / Electrification labels to the power-tool-oriented demo model, while non-demo custom team names are preserved. Engineering requesters default to their own active team; Lab/Admin users creating a request on somebody else's behalf must deliberately select a team. Creation/submission is rejected when the team is blank, inactive or outside the controlled master.

**AUTO-PLAN is hardened as an optimizer rather than only an earliest-slot scheduler.** Each plan attempt is transactional: if capability resolution or the final integrity gate fails, the complete pre-plan state is restored so no half-replan remains. Resource choice considers all qualified candidates and ranks near-equivalent slots by readiness interventions, requested-person preference, calibration/maintenance/qualification margin, near-term load and deterministic tie-breaks. A preferred person is therefore a soft preference, not a hidden hard constraint.

At portfolio level, competing plan strategies are now compared with explicit multi-objective damage metrics: requested-date attainment, newly late existing commitments, aggregate commitment delay, number of other builds moved, total external delay, booking churn, avoidable readiness interventions and hard-integrity failures. The review modal includes **Why this plan won** and a comparison of the considered strategies. A candidate with a resource-readiness, qualification, overlap, planning-event or capability integrity failure cannot win.


## REV 1.0.82 — active swimlane calendar + executable material resolution

Unplanned build swimlanes also show a 14-day calendar skeleton when expanded.

REV 1.0.82 corrects two UI-path defects. The month/CW/weekend code in REV 1.0.80 had been applied to older swimlane renderer definitions that were later overridden by the active REV 1.0.68/1.0.70 renderers. The active portfolio/resource and build-workspace swimlanes now render month, ISO calendar week, weekday and date, with disabled weekends shaded through the full lane height.

The current-workflow material blocker also no longer links back to the already-open Materials tab. It opens a root-cause material resolver. For lab-supplied material the resolver distinguishes reservable stock from true shortage, can reserve exact stock, records a controlled incoming supply plan only for the uncovered quantity, and can convert that plan into physical received stock before issue.

## REV 1.0.81 — planning-integrity root-cause correction

REV 1.0.81 removes a legacy demo-data scheduling shortcut that bypassed the production planner. In REV 1.0.79/80, the power-tool demo portfolio selected the first matching equipment and person and spaced tasks by day without validating future calibration, maintenance, qualification, shared-resource collisions or planning events. The visible equipment-readiness messages were therefore correct diagnoses of an invalid seeded schedule, not false alarms from the readiness checker.

The demo portfolio is now seeded through the same `PlannerService` used by AUTO-PLAN. A dedicated planning-integrity audit checks equipment readiness, staff qualification, equipment overlaps, staff overlaps, hard planning-event overlaps and capability mismatches. Existing REV 1.0.80 demo states are repaired once on migration using an atomic optimizer replan; user-created planning events such as whole-lab closures remain hard constraints and commitments are preserved. Final-state builds no longer retain obsolete future seed bookings.

The planner also now preserves completed/actual booking history during replans, skips completed route/test work, and reuses an already scheduled future calibration/maintenance activity instead of creating duplicate readiness work. The equipment resolver groups failed bookings by root equipment resource and displays the actual calibration/maintenance reason rather than presenting every downstream booking as an unrelated fault.

## REV 1.0.80 — conflict-visible manual planning and closure-safe replanning

REV 1.0.80 replaces guess-and-reject manual scheduling with the same prevalidated three-tier choice model used by planning moves: **Green** for least-disruptive current-capacity options, **Yellow** for controlled training/qualification recovery, and **Red** for quantified cross-build impact requiring explicit review. The manual plan is staged in a draft and is applied atomically only when the planner saves it. Current conflicts are visible before selection.

The main swimlane date axis now shows **month, calendar week (CW), weekday and day number**. When weekend planning is disabled, Saturdays and Sundays are shaded through the full swimlane tracks rather than only in the header. Lab-wide closures and other hard capacity situations now invalidate overlapping future planning locks, forcing affected open-build work through replanning; a residual-overlap safety check prevents accepting a planning-event proposal that still leaves work inside a lab closure. Existing saved REV 1.0.79 states are also reconciled on first load if they already contain future work inside an active whole-lab closure; commitments remain preserved for explicit review.

## REV 1.0.79 — planner/readiness consistency and power-tool demo portfolio

REV 1.0.79 unifies AUTO-PLAN and Build Readiness resource semantics, makes same-day calibration/maintenance/training prerequisites time-accurate, preserves scroll position after 5S corrective actions, uses a unified sticky navigator in Lab Standards & Resources, remaps E0/E1/V/P to internal Pre-A/A/B/C prototype-control intent, and intentionally replaces the prior demo build data with a 24-request power-tool portfolio.


## REV 1.0.61 — guided requester action, constrained drag replanning and consolidated Resource Assurance

This is the **static web / GitHub Pages** build. It deliberately uses browser IndexedDB and contains no Python/SQLite server. REV 1.0.61 makes missing requester inputs explicit, adds administrator abort/archive/retention deletion, constrained drag-and-drop replanning, collapsed sample registers, sticky/local search navigation, consolidated Calibration/Maintenance/Training/EHS assurance with 30/60/90-day reporting and configurable due warnings, clearer vacation impact previews, default decision rationales, and visual good/bad 5S examples.

## REV 1.0.60 — guided blocker resolution

Engineering clarification blockers can now be completed directly from the Action Centre Resolve modal. The modal shows the blocker cause, required evidence, current owner, next owner and the exact field to complete. Interface-specific requests use a dedicated programming/calibration interface definition rather than treating any non-empty configuration string as sufficient. After the definition is saved, Lab Planning can run the guided feasibility reassessment; LabOS then routes to the next real blocker or planning step.


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
