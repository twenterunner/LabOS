# LabOS Architectural Invariants

These invariants are derived from accepted Stage-1/Stage-2 architecture, Stage-3 controlled evidence and canonical source boundaries. They are stronger than incidental implementation details.

## A. State, persistence and audit

1. **One canonical business-state authority.** Session/UI context may project or scope state, but read/render code must not silently become a second business-state authority.
2. **Ordinary persistence is not a business-normalization engine.** Ownership inference, replanning and domain reconciliation do not belong in ordinary save operations.
3. **`StateTransactionService` is the validated atomic mutation boundary** for governed multi-step state changes that require commit/rollback semantics.
4. **Persistence failure must roll back atomically.** No half-applied business mutation may remain LIVE after a rejected/failed commit.
5. **Audit events use the canonical audit boundary** and retain actor/role/lab/entity/reason/reference/correlation context where applicable.
6. **Import/load/reset are explicit canonicalization boundaries.** Compatibility repair is explicit and idempotent, not hidden in ordinary reads.

## B. Planning

7. **One canonical Planning architecture.** Prototype and Validation compile into the common Stage-2 planning contracts and use one resource-feasibility kernel.
8. **Prototype and Validation share planning semantics and enterprise capacity.** A resource already consumed by one domain cannot be silently invisible to the other domain's feasibility calculation.
9. **Manual planning, feasible-slot search, replanning, portfolio/scenario planning and recovery/escalation must delegate to the canonical Planning architecture rather than competing schedulers.**
10. **Canonical commit route:** `PlanningProposal/candidate → PlanningDelta → PlanCommitService → StateTransactionService → repository/audit`.
11. **UI actions must not bypass planning/state authority.** A Green/Yellow/other control may select or confirm a canonical candidate; it must not directly mutate canonical bookings as an alternative commit path.
12. **One governed commit means one canonical persistence transaction.** Duplicate save paths for the same accepted action are not allowed.
13. **Forecasts derive from the active canonical plan**, not stale cache fields.
14. **Historical planning bodies may remain physically present only as compatibility/history.** Effective runtime entry points must delegate to the canonical Stage-2 architecture; historical bodies are not competing authorities.

## C. Network / Sister-Lab

15. **One governed Network/Sister-Lab architecture.** Comparison/proposal, authorization, transfer lifecycle, SiteAssignment and transaction responsibilities remain separate canonical services rather than ad-hoc UI state changes.
16. **No SiteAssignment before governed acceptance.** Comparison, proposal and read-only revalidation must not silently change LIVE execution ownership.
17. **Task-level SiteAssignments remain task-level.** A remote task/activity assignment must not silently rewrite the programme's `homeSiteId` or programme execution ownership unless the governed transfer scope is whole-programme and acceptance semantics explicitly require it.
18. **Receiving-lab capacity and competing reservations must be revalidated before acceptance.** The current request's own reservation may be ignored where the canonical collision check explicitly supports that identity; competing active reservations may not be ignored.
19. **Network acceptance must remain atomic with planning/state validation.** Planning deltas and SiteAssignment/network deltas are simulated/validated before canonical commit.
20. **Reject/cancel/accept authorization must respect sender/receiver governance.** UI convenience is not an authorization bypass.

## D. Repository evidence and regression protection

21. **Historical evidence is immutable.** Old Test-N reports/checksums remain descriptions of that historical build.
22. **A new build identity is earned by a completed gate.** Chat language or an in-progress working tree does not create a controlled build.
23. **Interrupted/timed-out test invocations are not PASS.** Required assertions must finish in a completed invocation/range.
24. **Tests protect behavior/architecture, not obsolete implementation shape.** An implementation-detail assertion may be updated only when the replacement protects the stronger accepted architecture.
25. **Behavioral requirements are never weakened merely to obtain PASS.**
26. **Repository continuity files are the engineering context authority.** A new chat must reconstruct current state from repository evidence before changing source.

## E. Enterprise portability

27. **Business rules remain behind replaceable adapters/services.** The browser-local IndexedDB PoC may later be replaced by API/database persistence without rewriting domain/planning/network rules.
28. **Session/identity boundaries remain separable from programme ownership.** This preserves a path to SSO/server authorization without conflating logged-in lab context with business ownership.
29. **Stable IDs, explicit deltas and structured audit are preserved** to support future relational storage, centralized audit and multi-user concurrency.

## F. TEST-13 accepted interaction/network invariants

30. **Planning board state cannot impersonate a command.** Board context uses non-command perspective state; only genuine view controls own the Planning view-command attribute.
31. **Progressive manual search preserves active command identity.** Once a Green/Yellow alternative is published, progress refresh must not destroy/recreate the active keyed control in a way that can steal a touch/click gesture.
32. **Active-site Escalation is canonical-site scoped.** Escalation population and analysis/review scope derive from the active site's `PlanningEngine.rows({siteId,...})` programme population; a site switch must not reuse a global programme list.
33. **Governed network Refresh renews proposal validity.** A successful stale-proposal Refresh preserves formal request identity/scope and writes the refreshed proposal assumptions including the new `expiresAt` in one canonical transaction.
34. **Stale-proposal preview/Refresh is not LIVE execution.** It may not create a SiteAssignment or silently accept a transfer. A fresh explicit receiver decision and final live revalidation are required.


## G. TEST-14 Validation replanning invariants

1. Validation Green and Yellow manual alternatives are rationale-gated; selecting a date alone performs zero persistence.
2. Empty rationale cannot formally accept a Validation manual replan.
3. Accepted Validation manual replans use the existing PlanningEngine → PlanningDelta/PlanCommitService → StateTransactionService route and persist exactly once.
4. A committable Validation planning candidate contains exactly one active booking for every canonical Validation activity.
5. Missing, duplicate or orphan Validation activity bookings fail with `PLANNING_CANDIDATE_INCOMPLETE` before LIVE replacement.
6. Replanning one Validation test may move dependent downstream tests but may not make the rest of the Validation sequence disappear.
