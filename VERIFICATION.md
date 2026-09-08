# ProtoLab OS — Verification Report

**Application version:** 1.0.7-poc  
**Schema version:** 5  
**Verification date:** 2026-09-08  
**Target:** static GitHub Pages proof-of-concept

## Summary

REV 1.0.7 was checked with deterministic domain/service tests, an IndexedDB repository harness, a lightweight DOM interaction harness, static/mobile deployment checks, JavaScript syntax checks and local HTTP serving.

Automated results:

- **46 / 46** core domain, workflow, planning, guard-rail and data-integrity checks passed.
- **6 / 6** persistence / JSON import-export / reset / migration checks passed.
- **23 / 23** deterministic UI startup and interaction checks passed.
- **21 / 21** REV 1.0.6 enterprise-operation regression checks passed.
- **21 / 21** REV 1.0.7 forward-capacity/readiness/mobile checks passed.
- **31 / 31** static/deployment/mobile-source checks passed.
- **9 / 9** principal deployable files returned HTTP 200 from a local static server.
- JavaScript syntax checks passed.

This is **148 deterministic checks passed, 0 failed**, plus the separate HTTP serving checks.

## Browser automation limitation

The available container Chromium binary has previously hung even on trivial local HTML. This report therefore does **not** claim successful real Chrome/Android automation. Android/Chrome deployment testing remains the real-browser acceptance check; deterministic DOM and source/runtime tests are used before delivery.

## REV 1.0.7 focus

| Requirement | Result | Implemented behaviour |
|---|---|---|
| Revision visible | PASS | Header and cache-busted assets identify `REV 1.0.7` |
| Mobile page containment | PASS | Page-level horizontal overflow is suppressed; cards/grids are constrained to viewport; wide tables scroll inside their own container |
| Floating-number formatting | PASS | KPI/bar values are rounded and shown with units rather than raw JavaScript decimals |
| Weekly forward demand | PASS | Equipment capability and certified-skill demand is calculated for each week |
| Future-project probability | PASS | Committed work counts 100%; potential-project load is multiplied by project probability |
| Capacity interpretation | PASS | Charts explicitly use expected **resource-hours/week**, not machine/person counts |
| Quarterly view | PASS | Weekly demand is aggregated into quarter summaries with total and peak-week load |
| 13/26/52 week horizons | PASS | Management can switch between roughly one quarter, six months and one year |
| Calibration certificates | PASS | Calibration records retain certificate number, issuer/lab, traceability/reference standard, evidence, date, next due, result and person |
| Calibration history | PASS | Per-equipment certificate history is viewable |
| Maintenance due overview | PASS | Maintenance and calibration due items appear in the combined readiness plan |
| Training due overview | PASS | Person-specific skill certificates approaching expiry appear in the same plan |
| Optimized readiness slots | PASS | Optimizer searches actual working-time slots before due date and excludes exact-resource conflicts |
| Build-impact minimization | PASS | Free slots are scored using exact committed resource load plus probability-weighted future demand |
| Planner integration | PASS | Accepted calibration, maintenance and training slots become real resource constraints used by AUTO-PLAN |
| Future calibration readiness | PASS | A scheduled calibration/maintenance can support future planning only after its scheduled completion and through projected validity |
| Future qualification readiness | PASS | Scheduled renewal training can support future planning only after the training slot and through projected certificate validity |
| Schedule collision recheck | PASS | Scheduling refuses a recommended slot if another controlled booking has since created a conflict |
| Execution guard | PASS | Digital traveller only offers equipment whose calibration **and** maintenance are currently valid |
| Certificate-gated skills | PASS | Planner uses valid person-specific training certificates, not unchecked skill flags |

## Meaning of forward-demand values

The management forecast uses **expected resource-hours per week**:

- committed build/resource bookings = 100% of their planned hours;
- potential-project work = estimated process hours × project probability;
- equipment capacity = capable equipment count × configured productive equipment hours/week;
- skill capacity = currently certified staff count × configured productive staff hours/week.

The charts therefore show *when* a capability or skill becomes constrained, rather than only a single accumulated total. Quarterly tables summarize the same weekly model.

## Optimized calibration / maintenance / training planning

For each item due inside the selected horizon the readiness engine:

1. identifies the actual equipment or person/skill whose readiness expires;
2. searches weekdays in the pre-due planning window;
3. rejects slots overlapping an existing build or accepted readiness booking for that exact resource;
4. scores remaining slots against that resource's committed weekly load plus its share of probability-weighted pipeline demand;
5. slightly favors later valid slots when build impact is otherwise similar, avoiding unnecessarily early renewal;
6. exposes a conflict/escalation if no free slot exists before the due date;
7. converts an accepted proposal into a controlled non-build booking;
8. makes AUTO-PLAN work around that booking.

This keeps calibration, preventive maintenance and qualification renewal in the same capacity model as prototype builds.

## Core workflow regression retained

The earlier application controls remain covered, including:

- 15 seeded prototype requests, 25+ process definitions and 40+ unique serialized units;
- exact BOM material readiness and genealogy;
- Engineering-supplied versus Lab-supplied material paths;
- material and process/test feasibility before AUTO-PLAN;
- standard-process/test setup and cycle-time planning;
- same-product historical duration learning;
- qualified staff and capable equipment selection;
- resource-conflict recovery;
- controlled process development and released work instructions;
- PFMEA / Control Plan linkages and independent approval;
- Product Safety approval records;
- serial generation, traveller execution and actual-duration capture;
- objective measurement pass/fail and quality holds;
- deviation/rework/release controls;
- finance rates, estimate/actual/COPQ learning;
- Action Centre and improvement proposals;
- audit and report evidence.

## Persistence / migration

The repository harness verifies IndexedDB initialization, save/reload, JSON export/import, reset and migration of earlier local data to **schema 5**. New schema-5 structures include calibration-certificate history, resource-care bookings and forward-capacity settings. Existing user-created records are preserved rather than requiring a demo reset.

## Static / mobile deployment

Checks verify relative assets, no npm/build/runtime external dependency, cache-busted REV 1.0.7 files, responsive breakpoints, 44 px touch-target baseline, preserved mobile hamburger navigation, page-width containment and internal scrolling for intentionally wide tables.

The local static-server check covers:

`index.html`, `styles.css`, `core.js`, `demo-data.js`, `repository.js`, `services.js`, `app.js`, `manifest.webmanifest`, `USER_MANUAL.html`.

## Acceptance interpretation

**Lab Manager:** can see weekly and quarterly future capability/skill demand and plan calibration, maintenance and training around build demand.  
**Metrology:** has controlled calibration certificates, maintenance history and an optimized due plan.  
**Planner:** accepted non-build readiness work is visible and consumes real capacity, preventing AUTO-PLAN from silently double-booking it.  
**Technician:** cannot execute with equipment whose current calibration or preventive maintenance is invalid.  
**Management:** forward need is presented as explainable hours/week with committed versus probability-weighted pipeline demand and capacity, rather than unexplained raw numbers.
