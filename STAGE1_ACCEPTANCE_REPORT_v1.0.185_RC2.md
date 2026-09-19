# LabOS Rev 1.0.185 — Stage 1 Data & State Integrity — RC2 Acceptance Report

## Release basis

- Protected source baseline: LabOS Rev 1.0.185.
- Protected baseline SHA-256: `ca256107a58ed18e9303c9e0fdbe20e14fead5a4d68a04d75a7804b83629a8ab`.
- Rev 1.0.185 remains unchanged and recoverable.
- This package is a Stage 1 release candidate; it does not overwrite or redefine the protected baseline.
- Stage 2 Planning Engine work has not begun.

## A. Architecture before

Rev 1.0.185 had repository, migration, planning, multi-lab, programme and audit concepts, but business state, UI/session state, identity, derived values and persistence were not hard-separated. Ordinary save could assign site ownership, reconcile programme state and trigger linked Validation replanning. Read/render paths could normalize or mutate state. Forecast/date and laboratory ownership had multiple fallback authorities. Multi-lab rendering could temporarily substitute global `App.state`. Historical migrations could depend on later mutable `ensure...` implementations.

## B. Architecture after

Stage 1 adds `labos-state-1.0.185-stage1.js` with canonical services:

- `SessionContext` — user/role/lab session context separated from programme ownership.
- `ProgrammeRegistry` — one Prototype/Validation programme identity API without forcing a storage merge.
- `DateSemantics` — canonical requested date, commitment ledger, derived forecast and actual-date access.
- `LabOwnership` — explicit home site, execution site and activity-site semantics.
- `AuditService` — structured actor/role/lab/entity/reason/reference/correlation events with legacy aliases.
- `PersistenceService` — repository adapter with explicit load/import/reset canonicalization and persistence-only normal saves.
- `StateTransactionService` — validated commit/rollback boundary.
- `DataRepairService` — explicit, idempotent compatibility repair at canonical boundaries.
- `StateSelectors` — pure/detached programme and site-scoped projections.

Read purity is preserved without blanket whole-state cloning. Network metrics are calculated directly; lab scoping performs one detached projection; invariant validation isolates mutation-prone slices; Validation workflow reads isolate only the selected programme and related Validation records.

## C. Code removed/consolidated

- Removed business normalization, ownership inference, programme reconciliation, linked replan and action pruning from ordinary `persist()`.
- Removed direct application-layer `App.repo.save()` bypasses.
- Removed production multi-lab `App.state = scope/enterprise/live` swaps.
- PlanningEngine construction and internal-lab queries no longer normalize live state.
- Current-schema migration is idempotent and uses frozen migration-time references.
- Canonical load/import/reset repairs now persist immediately.
- Booking ownership precedence is: explicit `booking.siteId` → assigned equipment/staff site → programme execution/home site.
- Read-time multi-lab normalization is no longer required for normal canonical state.

Legacy UI handlers still use the `App.state` compatibility surface for some mutations, but all normal persistence crosses the validated Stage-1 persistence/transaction boundary. Migrating every legacy UI command to explicit command objects is intentionally deferred to the relevant engine stages rather than destabilizing Rev 185 in Stage 1.

## D. Production files changed

- `index.html` — loads the Stage-1 state architecture module.
- `labos-state-1.0.185-stage1.js` — new canonical state/session/audit/persistence/transaction/selectors architecture.
- `labos-repository-1.0.185.js` — frozen migration runtime and deterministic/idempotent migration behavior.
- `labos-planning-1.0.185.js` — removes read-time multi-lab normalization from PlanningEngine construction/selectors.
- `labos-app-1.0.185.js` — domain/UI/session separation, persistence-only save boundary, pure scoped rendering and transaction adoption.

Unchanged production files: core, demo-data, services, CSS, service worker and runtime version metadata.

## E. Executed release gate

- Stage-1 architecture/read-purity: **10 PASS / 0 FAIL**.
- Expanded Stage-1 integrity: **17 PASS / 0 FAIL**.
- Canonical load/import/reset boundary: **3 PASS / 0 FAIL**. The preserved pre-fix RC1 produces **0 PASS / 3 FAIL** on these same tests, proving the issue was reproduced before the fix.
- Protected Rev-185 functional regression: **16 PASS / 0 FAIL**.
- Application smoke comparison: **12 PASS / 0 FAIL**.
- Built-in Rev-185 hook comparison: **70/70 accepted, 0 genuine regressions**:
  - 67 byte-equivalent;
  - 2 timestamp-only differences (`generatedAt`);
  - 1 intentional internal state/audit-shape difference (`V163.validationPlan`) with identical business result (`ok=true`, `planned=5`, `blocked=0`, identical five programme rows/forecasts/sites).
- V163 isolated performance, 3 runs each: baseline average **1.638 s**, Stage-1 candidate average **1.603 s**.
- Browser/real IndexedDB: **NOT EXECUTABLE**, not counted as PASS. Chromium launches, but local HTTP navigation is blocked by `ERR_BLOCKED_BY_ADMINISTRATOR`; the allowed opaque origin previously denied IndexedDB with `SecurityError`.

Total automated accepted checks/comparisons: **128**, material failures: **0**. Browser/IndexedDB is excluded from that count.

## F. Remaining known risks

1. Real-browser IndexedDB execution is unverified in this environment and should be run on a normal browser before enterprise/pilot deployment.
2. Rev 185 still contains substantial legacy wrapper/override chains in Workflow, Readiness, Reporting and UI code. They are intentionally deferred to Stages 4, 5, 7 and 10 rather than removed during Stage 1.
3. The PoC still persists one browser-state document and has no multi-user concurrency/backend transaction model. Stage 1 creates the adapter/service boundaries needed for that later migration; it does not prematurely implement the backend.
4. The legacy `state.identity` and `settings.activeLabId` fields remain compatibility projections for old Rev-185 callers. New Stage-1 services treat session identity/lab separately.
5. Some legacy UI handlers still mutate through the compatibility `App.state` surface before the validated persistence gate. This is protected by commit validation/rollback but should migrate to explicit engine commands as each relevant engine is rebuilt.

## G. Regression status

No material Stage-1 regression remains in the executed release gate. Prototype planning, Validation planning, manual planning, sister-lab comparison, multi-lab resource isolation, import/export, commitments, ownership, audit, rendering and existing Rev-185 regression hooks remain protected. Stage 2 has not begun.

## H. Enterprise-readiness impact

Stage 1 establishes the key separation required to replace IndexedDB later without rewriting business rules: UI/session context → application/domain services → repository interface → IndexedDB adapter today / API-database adapter later. Stable programme identity, explicit ownership relationships, derived date semantics, structured audit context and deterministic boundary repair are now available for future SSO, server authorization, centralized audit, relational persistence and multi-user concurrency.

## I. Roadmap

1. **Data & State Integrity — COMPLETE (RC2)**
2. Planning Engine — not started
3. Network / Sister-Lab Capability — not started
4. Readiness Engine — not started
5. Workflow Engine — not started
6. Execution & Evidence Engine — not started
7. Reporting Engine — not started
8. Lessons Learned Engine — not started
9. KPI Engine — not started
10. Tab / UI / UX Review — not started

Stage 2 must begin with an audit only; implementation must wait for explicit authorization after that audit.
