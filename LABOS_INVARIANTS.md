# LabOS Architectural Invariants

Protected through Stage 3; Stage-4 Readiness invariants below are candidate invariants pending manual acceptance.

## A. State / persistence / audit — protected

1. One canonical business-state authority; session/UI/view projections are not business state.
2. Read/render operations do not mutate canonical business state.
3. Ordinary persistence is not a normalization/replanning engine.
4. `StateTransactionService` is the validated atomic governed mutation boundary.
5. Persistence failure rolls back; no half-applied LIVE state.
6. Audit uses structured canonical actor/role/lab/entity/reason/reference context.
7. Import/load/reset are explicit idempotent compatibility-repair boundaries.

## B. Planning — protected

8. One canonical Planning architecture for Prototype and Validation.
9. One shared enterprise resource/capacity ledger.
10. Manual/auto/portfolio/scenario/recovery/escalation delegate to the canonical kernel.
11. Canonical commit: candidate → `PlanningDelta` → `PlanCommitService` → `StateTransactionService` → repository/audit.
12. UI cannot directly mutate bookings as a planning commit path.
13. Green/Yellow manual replans require non-empty rationale/formal acceptance; selection alone persists nothing.
14. One governed planning commit equals exactly one persistence transaction.
15. Validation committable candidates contain exactly one active booking per canonical activity; missing/duplicate/orphan coverage is rejected.
16. Replanning one Validation activity may move downstream work but cannot delete the remaining sequence.

## C. Network / Sister-Lab — protected

17. One governed Network/Sister-Lab architecture; no separate sister-lab scheduler.
18. No SiteAssignment before governed acceptance.
19. Task-level SiteAssignments stay task-level and do not silently rewrite programme ownership.
20. Receiving capacity/reservations are revalidated before acceptance.
21. Network acceptance is atomic with planning/state validation.
22. Expired proposal assumptions require governed revalidation; Refresh preserves request identity/scope but does not create LIVE SiteAssignment.
23. Active-site Escalation uses the active site's canonical PlanningEngine population.
24. Planning view/perspective/action and touch/pan ownership remain separated.

## D. Stage-4 Readiness — candidate invariants

25. There is one canonical `ReadinessEngine`, shared by Prototype and Validation.
26. Readiness evaluation is deterministic for canonical state plus explicit `ReadinessContext.asOf`.
27. Readiness evaluation is read-only and side-effect free.
28. Readiness status semantics are explicit: `READY`, `BLOCKED`, `WARNING`, `NOT_APPLICABLE`.
29. Every material readiness blocker/warning is explainable with stable code, dimension, entity and relevant site/planned-use context.
30. Equipment readiness is evaluated at planned use for capability, governance/status, calibration and maintenance.
31. Staff readiness is evaluated at planned use for availability, qualification/skill and training/certificate validity.
32. Applicable material/DUT/sample/process/method/Control Plan/EHS prerequisites use one structured assessment contract.
33. Remote task readiness resolves the protected task-level `SiteAssignmentResolver` execution site without changing programme ownership.
34. External-execution readiness derives from governed Stage-3 external request/order state.
35. Readiness resource reassignment is a governed Planning change and uses `PlanningEngine → PlanningDelta/PlanCommitService → StateTransactionService`; direct UI booking mutation/persistence is forbidden.
36. The legacy `P.ReadinessService` may exist only as a compatibility facade delegating to the canonical engine.

## E. Evidence / continuity / portability

37. Historical packages/reports/checksums are immutable.
38. A new controlled identity is earned only by a completed gate.
39. Interrupted/timed-out tests are not PASS.
40. Tests protect behavior/architecture; behavioral requirements are not weakened to obtain PASS.
41. Repository continuity files are engineering authority.
42. Stable IDs/services/deltas/audit preserve future API/database/SSO/server portability.
43. Stage 4 remains unprotected until manual testing of the exact frozen TEST package and explicit user acceptance.
