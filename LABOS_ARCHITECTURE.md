# LabOS Architecture

This document describes the accepted canonical architecture through the TEST-13 automated gate. TEST-13 remains subject to preserved-state manual browser acceptance before Stage 3 can close.

## 1. Runtime composition

The static PoC is composed from these production modules:

- `labos-core-1.0.185.js` — core domain utilities, migration-era domain helpers and base scheduling/resource primitives.
- `labos-demo-data-1.0.185.js` — deterministic demo/seed state.
- `labos-repository-1.0.185.js` — browser repository / IndexedDB adapter and import/export storage behavior.
- `labos-state-1.0.185-stage1.js` — Stage-1 canonical session, programme registry, date/ownership, audit, persistence, transaction, repair and selector services.
- `labos-services-1.0.185.js` — shared service/resource-kernel integration and compatibility hooks.
- `labos-planning-1.0.185.js` — original resource/planning primitives retained beneath the controlled Stage-2 architecture.
- `labos-planning-stage2-1.0.185.js` — canonical graph-aware Planning contracts, PlanningContext, PlanningProblem/TaskGraph compilation, PlanningEngine, portfolio service, blockers, PlanningDelta and PlanCommitService.
- `labos-network-stage3-1.0.185.js` — Stage-3 TransferScope/SiteAssignment/network authorization/proposal/transfer/reservation architecture and external execution support.
- `labos-app-1.0.185.js` — browser UI/application orchestration, canonical service delegation and compatibility handlers.
- `labos-planning-worker-1.0.185.js` — controlled Planning worker entry using the same build handshake.
- `labos-styles-1.0.185.css` — presentation.
- `index.html`, `service-worker.js`, `manifest.webmanifest`, `labos-version.json` — deployment/runtime identity shell.

## 2. Layering and authority

Canonical authority flows approximately as:

`Browser UI / session context`
→ `application commands in labos-app`
→ `domain/state/planning/network services`
→ `StateTransactionService for governed mutations`
→ `PersistenceService`
→ `IndexedDBStorageRepository today / API-database adapter later`
→ `AuditService` for structured audit evidence.

Read-only selectors/projections must remain detached from canonical mutation authority.

## 3. Stage-1 state architecture

Accepted Stage-1 canonical services include:

- `SessionContext` — user/role/lab session context separated from programme ownership.
- `ProgrammeRegistry` — Prototype/Validation identity API without forcing a storage merge.
- `DateSemantics` — canonical requested/commitment/forecast/actual date access.
- `LabOwnership` — explicit programme/activity ownership semantics.
- `AuditService` — structured enterprise-ready audit context.
- `PersistenceService` — repository adapter and explicit load/import/reset canonicalization.
- `StateTransactionService` — validated commit/rollback boundary.
- `DataRepairService` — explicit idempotent compatibility repair.
- `StateSelectors` — detached programme and site-scoped read projections.

The PoC still stores one browser-state document and is not a multi-user transactional backend. The accepted architecture intentionally creates replaceable boundaries for later server/API/database/SSO deployment.

## 4. Stage-2 Planning architecture

Accepted Stage-2 architecture:

`Programme adapters`
→ `PlanningProblem / TaskGraph`
→ `PlanningEngine`
→ `one PlannerService resource kernel`
→ `PlanningProposal`
→ `PlanningDelta`
→ `PlanCommitService`
→ `StateTransactionService`
→ `repository / audit`.

Prototype and Validation compile to the same task-graph contract:

- Prototype parallel groups become explicit branches/merges.
- Validation uses stable activity IDs and predecessor relationships.
- manual planning, feasible slots, AUTO/replanning, portfolio/scenario and recovery/escalation use the same scheduling kernel.
- `PlanningContext` supplies deterministic `asOf`, calendar and horizon policy.

### Compatibility/delegation layer

Historical Rev-185 implementations such as accumulated V1094/V1096/V1099/V1107/V132 planning bodies may remain physically present where removal creates unnecessary release risk. Accepted Stage-2 effective entry points delegate into the canonical architecture. Historical bodies are compatibility/history, not live competing schedulers.

## 5. Stage-3 Network / Sister-Lab architecture

Canonical Stage-3 concepts visible in source/reports include:

- `TransferScope` / scope resolution — whole programme, subflow/leg or task/activity scope.
- `SiteAssignmentResolver` — LIVE task/programme site-assignment authority.
- `NetworkAuthorizationService` — sender/receiver/governed-action authorization.
- `NetworkProposalService` — feasibility proposal using the protected Stage-2 PlanningEngine rather than a separate lab-specific scheduler.
- `NetworkTransferService` — formal request lifecycle, accept/reject/cancel/hold/reservation behavior.
- `NetworkDelta` — governed SiteAssignment/network application semantics.
- reservation lifecycle — receiving-lab capacity holds/reservations/commit/release.
- external execution support — kept under Stage-3 governed transaction boundaries.

Whole-programme acceptance may change programme execution site according to scope. Partial task/activity transfer leaves programme ownership intact and uses task-level SiteAssignments.

Comparison/proposal/pre-acceptance operations do not directly become LIVE execution assignments. Final acceptance performs current planning/capacity/reservation validation and commits atomically through the Stage-1 transaction boundary.

## 6. Application/UI boundary

`labos-app-1.0.185.js` is allowed to:

- render state and collect user intent;
- call canonical Planning/Network/State services;
- show governed confirmation/reason flows;
- manage UI-only state such as selected view/filter/modal/touch interaction.

It must not become a parallel planning/network/persistence engine.

Some historical compatibility UI handlers remain in Rev-185. Accepted stages progressively redirect effective paths to canonical services rather than attempting a risky one-shot removal of all historical code.

## 7. Audit boundary

Business-changing governed actions append structured audit events through the canonical audit layer. Audit context is expected to preserve actor, role, lab, entity, reason and correlation/reference information where relevant.

Audit history is business evidence, not a derived UI cache.

## 8. Future API/database/SSO/server migration

Accepted Stage-1/Stage-2 reports explicitly preserve this migration path:

`UI/session context → application/domain services → repository interface → IndexedDB adapter today / API-database adapter later`.

Planning contracts/deltas and transaction boundaries are intended to be portable to a future server-side Planning service. `SessionContext`/identity separation provides a path to SSO/server authorization without equating logged-in lab context with programme ownership.

A production shared deployment still needs governed backend storage, server transactions/concurrency, authorization/SSO and evidence-file storage; the current PoC does not claim those features are already implemented.

## 9. Current post-TEST12 working-tree delta

Compared with frozen TEST-12, only these production files differ:

- `labos-app-1.0.185.js`
- `labos-network-stage3-1.0.185.js`

The app diff appears to address Planning action/view command ownership and stable manual-option DOM identity. The network diff appears to add stale-proposal revalidation/refresh semantics.

These changes are **candidate work only** until the current regression/manual acceptance sequence is completed. See `CURRENT_HANDOFF.md` and `DECISION_LOG.md`.


## 8. TEST-13 accepted interaction and Stage-3 extensions

### Planning command ownership and touch stability

Planning board context/state uses `data-canonical-plan-perspective`; only actual view-switch controls use `data-canonical-plan-view`. Manual Green/Yellow controls therefore remain application commands rather than being captured as a board/view command. Progressive search reconciles discovered alternatives by stable option key so a live touch/click target is not destroyed during a progress refresh.

This changes interaction ownership only. The canonical commit authority remains the shared Stage-2 PlanningEngine/PlanningDelta/PlanCommitService/StateTransactionService route.

### Active-site Escalation architecture

Escalation starts from the currently active laboratory's canonical programme population:

`PlanningEngine.rows({siteId, domain:'all', filter:'all'})`

The resulting programme IDs are carried through chooser, target-first analysis, review and commit scope. Prototype and Validation share this population mechanism. Escalation is therefore a site-scoped view/transaction over the canonical Planning architecture, not a global list filtered only in presentation.

### Governed stale-proposal Refresh

An elapsed network proposal `expiresAt` invalidates the proposal assumptions, not the formal request. `NetworkTransferService` exposes a read-only exact-scope revalidation preview. The receiver may Refresh or Reject. Governed Refresh preserves request identity/scope and stores the fresh proposal, fingerprints, reservation windows and refreshed `expiresAt` in one canonical transaction. Preview/Refresh does not create a LIVE SiteAssignment. Fresh Accept still performs final current-state capacity/reservation validation before atomic acceptance.


## 10. TEST-14 Validation manual-governance and sequence-completeness architecture

TEST-14 retains the single shared Stage-2 PlanningEngine/commit architecture and strengthens the Validation manual-replan boundary.

### Validation manual governance

Green and Yellow Validation in-lane alternatives are solver-produced canonical scenarios. Selecting an alternative does not persist. Both enter the common reason-coded modal and require a non-empty rationale before `stage2ConfirmCanonicalInLaneV14` may call `stage2CommitPlanningScenario`. Final acceptance remains `PlanningDelta / PlanCommitService → StateTransactionService → one persistence operation`.

### Validation sequence completeness

`P.validationPlanningCoverageV14` derives expected canonical Validation activity IDs from the Validation planning task graph and compares them to active candidate bookings. `P.assertPlanningCandidateCompletenessV14` rejects missing, duplicate or orphan Validation bookings with `PLANNING_CANDIDATE_INCOMPLETE`. Completeness is enforced after Validation solver output and again in `PlanningDelta.fromCandidate` before LIVE replacement.

A manual constraint may re-solve downstream work, but a candidate is not committable unless the entire canonical Validation sequence remains represented exactly once.
