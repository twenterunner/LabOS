# LabOS Architecture

This document describes the canonical architecture through the **Stage-4 browser-acceptance candidate**. Stages 1–3 are protected. Stage 4 is implemented but remains **OPEN / NOT PROTECTED** until manual acceptance.

## Runtime composition

- `labos-core-1.0.185.js` — core domain/resource primitives.
- `labos-demo-data-1.0.185.js` — deterministic demo state.
- `labos-repository-1.0.185.js` — IndexedDB/browser repository adapter.
- `labos-state-1.0.185-stage1.js` — SessionContext, ProgrammeRegistry, ownership/date semantics, AuditService, PersistenceService, StateTransactionService, repair/selectors.
- `labos-services-1.0.185.js` — shared resource/domain services.
- `labos-planning-1.0.185.js` + `labos-planning-stage2-1.0.185.js` — one canonical Planning architecture.
- `labos-network-stage3-1.0.185.js` — governed Network/Sister-Lab/external execution architecture.
- `labos-readiness-stage4-1.0.185.js` — one canonical deterministic Readiness architecture.
- `labos-app-1.0.185.js` — UI/orchestration; must delegate governed business changes to canonical services.
- `labos-planning-worker-1.0.185.js` — parallel execution of the same Stage-2 planning service.
- deployment shell: `index.html`, `labos-version.json`, `service-worker.js`, `manifest.webmanifest`.

## Protected State boundary

Canonical mutable business state is separate from session/UI/view projections. Reads/rendering use detached projections. Governed changes use `StateTransactionService`; persistence failure rolls back atomically. Load/import/reset are explicit compatibility-repair boundaries.

## Protected Planning boundary

`Programme adapters → PlanningProblem/TaskGraph → PlanningEngine → PlannerService kernel → candidate → PlanningDelta → PlanCommitService → StateTransactionService → repository/audit`.

Prototype and Validation share this architecture and enterprise capacity. Manual Green/Yellow acceptance is rationale-gated and exactly-once persisted. Validation candidate completeness is checked before LIVE replacement.

## Protected Network boundary

`TransferScope → SiteAssignmentResolver → NetworkAuthorizationService / NetworkProposalService / NetworkTransferService → NetworkDelta → StateTransactionService`.

Partial task transfer remains task-level. Proposal/revalidation is not LIVE ownership. Final accept revalidates capacity/reservations atomically. External execution remains governed Stage-3 state.

## Stage-4 Readiness architecture — browser candidate

Canonical flow:

`Prototype/Validation programme adapter + explicit ReadinessContext(asOf, programme, task, site)`
→ `ReadinessEngine`
→ `ReadinessAssessment`
→ presentation/UI.

`ReadinessAssessment` exposes:

- `READY`, `BLOCKED`, `WARNING`, `NOT_APPLICABLE`;
- stable structured check/blocker codes;
- dimension, entity, site and planned-use evidence;
- blockers/warnings/notApplicable arrays;
- compatibility `ready` boolean.

The engine is deterministic and read-only for a fixed canonical state/context. It covers, where applicable, material/DUT/sample, process/method, Control Plan/approval, EHS/commissioning, equipment capability/status/calibration/maintenance, staff availability/qualification/training, assigned task execution site, and governed external execution.

Task-level remote work resolves site through protected `SiteAssignmentResolver` without changing programme ownership.

Readiness-changing resource actions use:

`Readiness UI → ReadinessCommandService → PlanningEngine canonical candidate → PlanningDelta / PlanCommitService → StateTransactionService → one persistence transaction → audit`.

The legacy `P.ReadinessService` remains a compatibility facade, not a second authority.

## Application/read boundary

The final application `render()` executes accumulated legacy render functions against a detached deep-cloned view projection. Render-time compatibility helpers therefore cannot mutate canonical domain state. UI commands that intentionally change business state must use their owning canonical service/transaction boundary.

## Enterprise portability

All core responsibilities remain behind stable services/adapters/IDs/deltas. IndexedDB can later be replaced by API/database persistence and session identity by SSO/server authorization without rewriting Planning/Network/Readiness rules.

## Stage status

Stages 1–3: protected. Stage 4: browser acceptance candidate only. Stage 5 not started. Stage-10 sticky Planning header/controls remain deferred.
