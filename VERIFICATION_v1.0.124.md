# LabOS REV 1.0.124 — verification

## Release checks
- Runtime revision references: REV 1.0.124
- Browser schema: 35
- JavaScript syntax: PASS for core, demo data, repository, services and application runtime
- Startup/invariants: PASS
- Planning-integrity baseline: PASS
- All-role navigation regression: PASS
- Canonical task sister-lab comparison sweep: PASS; no task-context exceptions
- Historical P26-1019 regression: PASS with complete planning-task coverage and zero integrity findings
- Missing-equipment fault injection: PASS; governed `ZERO_EQUIPMENT_CAPABILITY` with guided diagnosis
- Missing-staff fault injection: PASS; governed `ZERO_REQUIRED_SKILL` with guided diagnosis
- Two-year lab-closure fault injection: PASS; bounded `CAPACITY_UNRESOLVABLE`, no multi-year schedule accepted, guided diagnosis returned
- Inactive sister-lab task override: PASS; governed `TASK_SITE_UNAVAILABLE`, no booking accepted at inactive site
- Stale task-definition reconciliation: PASS; obsolete site override + manual constraint pruned, duplicated transfer representations superseded while history retained
- Home/receiving-lab network task visibility: PASS in display scope; default planning-engine scope remains isolated
- Quote validity: PASS; current quote uses test-specific benchmark; expired/future quote falls back to generic benchmark and retains stale-record traceability
- Fully quoted external work: PASS; zero generic fallback hours produces zero generic setup charge
- JSON serialization round-trip: PASS; normalized state returns zero invariants

## Expected controlled blocker
Demo build `P26-1023` intentionally contains a Detroit high-speed-vibration capability gap. AUTO PLAN correctly returns `ZERO_EQUIPMENT_CAPABILITY` rather than inventing equipment or a schedule. Sister-lab/network recovery remains the intended guided resolution path.

## Environment note
The execution harness uses inlined static assets because this evaluation environment blocks direct browser navigation to localhost/custom origins. Domain behavior, render/navigation, planning, routing and fault-injection paths are executed in Chromium; a real-origin IndexedDB reload test cannot be performed in this environment and is therefore not claimed.
