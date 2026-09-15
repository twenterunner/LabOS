# LabOS REV 1.0.124 — QA / fault-injection report

**Test date:** 15 September 2026  
**Source:** REV 1.0.123 working branch, with defects reproduced from REV 1.0.122/1.0.123 and repaired in REV 1.0.124  
**Browser data schema:** 35

## Executive result

REV 1.0.124 passed the final startup, invariant, role/navigation, domain-service, multi-lab routing, stale-state, bounded-horizon and external-cost regression campaign. No new planning-integrity violations or browser page errors were observed.

The seeded demo build **P26-1023** remains intentionally unplannable at Detroit for its high-speed-vibration test because Detroit has no registered matching capability. This is retained as a controlled demo blocker: the planner returns `ZERO_EQUIPMENT_CAPABILITY` and guided network/capacity recovery rather than inventing a resource.

## Final regression metrics

- Chromium startup: **PASS**, boot phase `ready`, zero page errors.
- State invariants at startup: **0 violations**.
- Planning-integrity audit at startup: **0 findings**.
- Seeded requests evaluated by readiness/cost/workflow/coverage services: **24/24**.
- Role/navigation render regression: **12 roles, 135 view renders, 0 failures**.
- Isolated AUTO PLAN regression: **21/22 passed**; the only failure is the intentional P26-1023 Detroit capability gap described above.
- Active canonical booking/routing sweep: **81 task comparisons** — 45 process, 24 formal test, 12 closeout — with **0 task-context exceptions**.
- JavaScript syntax: **PASS** for all runtime JS assets.

## Defects reproduced and fixed

### 1. Stale per-task sister-lab state
**Reproduced:** removing a canonical task could leave its `taskSiteOverridesV1170` entry active. A stale manual per-task constraint could also remain, and an accepted transfer could continue to count as active history.

**Fix:** `reconcilePlanningBookings` now reconciles the complete per-task planning bundle. Obsolete bookings, site overrides and manual constraints are removed together. Matching accepted task-transfer records are retained but marked **Superseded** in both request history and network-transfer history.

**Fault injection:** PASS — removed task override list empty, constraint list empty, both transfer representations `Superseded`.

### 2. Routed operation disappeared from lab-local Planning views
**Reproduced:** a single task transferred from Twente to Stuttgart remained correct in enterprise state, but the home-lab scoped state filtered out the remote resource booking, while the receiving-lab scoped state filtered out the foreign-owned request. The task could therefore disappear from both operational planning contexts.

**Fix:** Planning has a dedicated `includeNetworkTasks` display scope. Home-lab Planning sees the complete build including its remote booking; the receiving lab sees the incoming task and source request. The default planning-engine site scope remains unchanged and isolated.

**Verification:** PASS — default Stuttgart engine scope contains no foreign request; home network view contains the routed task; Stuttgart network view contains the incoming request/task and marks it `networkSupportOnlyV124`.

### 3. Inactive sister-lab override still scheduled work
**Reproduced:** a task override to Stuttgart followed by `LAB-DE.active=false` still allowed AUTO PLAN to create the task at LAB-DE.

**Fix:** the canonical structural planner check now rejects missing, inactive or external facilities as task execution sites with `TASK_SITE_UNAVAILABLE`. Guided recovery offers another active sister lab or return of only that operation to the build lab.

**Fault injection:** PASS — planner fails safely with `TASK_SITE_UNAVAILABLE`; no booking is accepted at the inactive site.

### 4. Expired/future quote incorrectly drove current external economics
**Reproduced:** a test-specific external quote with expired validity still took precedence over the generic external-facility benchmark.

**Fix:** the quote model now distinguishes `current`, `expired` and `notYetValid`. Only a current quote is used for active economics. Expired/future records remain attached as stale traceability and the calculation falls back to the generic benchmark.

**Verification:** PASS — current quote source `test-specific`; expired and future quote source `generic-facility` with stale-quote reason retained.

### 5. Old proof could remain attached after commercial terms changed
**Reproduced by code-path review:** changing supplier/price/basis/fees/lead/reference/validity without uploading replacement evidence left the old `fileData` on the newly edited terms.

**Fix:** commercial terms have a controlled signature. A meaningful previous record is archived before material commercial change. Existing proof is detached from the current terms unless a replacement file is supplied. Replacing/removing proof also archives the previous evidence revision. Historical evidence remains accessible in `externalSourcingHistory`.

**Verification:** deterministic history helper test PASS — superseded record retains prior commercial reference and proof. UI/runtime syntax and file-read path remain valid. Direct origin/reload IndexedDB testing is not claimed because this execution environment blocks browser navigation to localhost/custom origins.

### 6. Generic setup fee added even when all work was specifically quoted
**Reproduced:** whole-build external benchmark could add the external facility setup fee even when `fallbackHours === 0`.

**Fix:** generic setup/hourly cost is now zero when there are no fallback hours.

**Verification:** PASS — fully quoted test case returns `fallbackHours=0`, `genericCost=0` and only the controlled quoted-test cost.

## Additional fault injection

- **No equipment registry:** governed `ZERO_EQUIPMENT_CAPABILITY`; guided diagnosis PASS.
- **No staff registry:** governed `ZERO_REQUIRED_SKILL`; guided diagnosis PASS.
- **Two-year full-lab closure:** planner returns bounded `CAPACITY_UNRESOLVABLE` with guided diagnosis; no multi-year schedule is accepted.
- **P26-1019 historical regression:** AUTO PLAN PASS, 11 canonical changes, complete task coverage, 0 invariants, 0 planning-integrity findings.
- **JSON serialization round trip:** PASS; ~1.76 MB demo state re-normalized with 24 requests, 10 Standard Tests and 0 invariant violations.

## Environment limitation

The Chromium QA harness inlines the static runtime because this environment blocks direct browser navigation to localhost and custom local origins (`ERR_BLOCKED_BY_ADMINISTRATOR`). This prevents a genuine browser-origin reload test of IndexedDB persistence. Startup, DOM rendering, domain services, planning/routing logic, fault injection, JSON persistence representation, attachment data model and JavaScript execution were still exercised; no real-origin persistence reload result is claimed.
