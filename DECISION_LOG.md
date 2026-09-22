# LabOS Architectural Decision Log

**Append-only.** Do not delete or silently rewrite prior decisions. If a decision changes, append a new entry that supersedes it and explains why.

## 2026-09 — Stage 1 RC2 — separate canonical state/session/persistence architecture

**Problem:** Rev 1.0.185 mixed business state, UI/session context, ownership inference, read-time normalization and persistence side effects.  
**Decision:** establish canonical `SessionContext`, `ProgrammeRegistry`, date/ownership semantics, `AuditService`, `PersistenceService`, `StateTransactionService`, explicit repair and pure selectors.  
**Rationale:** make reads pure, make commits validated/rollback-capable, and create replaceable boundaries for future API/database/SSO deployment.  
**Rejected/avoided:** ordinary save assigning ownership/replanning; production `App.state` swaps; direct application-layer repository save bypasses.  
**Resulting invariant:** governed state mutations cross the canonical state/persistence/transaction boundary.  
**Evidence:** `STAGE1_ACCEPTANCE_REPORT_v1.0.185_RC2.md`, Stage-1 QA suites.

## 2026-09 — Stage 2 RC1 — one canonical Planning architecture

**Problem:** accumulated planning wrappers and duplicate manual/Validation semantics created multiple effective planning paths.  
**Decision:** use `Programme adapters → PlanningProblem/TaskGraph → PlanningEngine → one PlannerService kernel → PlanningProposal → PlanningDelta → PlanCommitService → StateTransactionService`. Prototype and Validation compile to the same task-graph contract.  
**Rationale:** deterministic planning, one resource-feasibility authority, graph dependencies, atomic delta commits and backend portability.  
**Rejected/avoided:** separate Validation planner, competing manual scheduler, direct whole-state replacement as planning commit.  
**Resulting invariant:** AUTO/manual/portfolio/scenario/recovery planning must delegate to the same canonical kernel.  
**Evidence:** `STAGE2_ACCEPTANCE_REPORT_v1.0.185_RC1.md`, Stage-2 QA suites.

## 2026-09 — Stage 2 RC1 — retain historical bodies only as compatibility/history

**Problem:** physically deleting all accumulated Rev-185 implementation bodies during Stage 2 would add release risk.  
**Decision:** allow historical bodies to remain physically present where effective runtime entry points are overridden/delegated to the canonical Stage-2 architecture.  
**Rationale:** reduce destabilization while eliminating competing effective authority.  
**Rejected/avoided:** treating physically present historical code as a second supported planner.  
**Resulting invariant:** physical presence is not authority; effective entry points must delegate canonically.  
**Evidence:** Stage-2 acceptance report, section on legacy/duplicate planning consolidation.

## 2026-09 — Stage 3 — governed sister-lab requests and SiteAssignments

**Problem:** direct cross-lab moves can bypass receiving-lab capacity, authorization and auditable acceptance.  
**Decision:** use formal TransferScope, Network proposal/authorization/transfer services, reservations and SiteAssignment semantics; apply planning/site changes only through governed acceptance.  
**Rationale:** preserve ownership, current-capacity validation, receiver authority and auditability while reusing the protected Stage-2 PlanningEngine.  
**Rejected/avoided:** direct UI reassignment and a separate sister-lab scheduler.  
**Resulting invariant:** partial task/activity routing remains task-level; pre-acceptance proposal/comparison does not become LIVE execution.  
**Evidence:** `STAGE3_RELEASE_HARDENING_REPORT.md`, `STAGE3_MANUAL_FEEDBACK_CORRECTION_REPORT.md`, Stage-3 QA suites.

## 2026-09 — TEST-12 — shared enterprise/cross-domain manual planning

**Problem:** manual planning could surface a candidate that ignored capacity already consumed by another domain, and touch pan could compete with action controls.  
**Decision:** keep Prototype and Validation manual planning on the common PlanningEngine/enterprise capacity ledger and exclude actual controls from Planning pan capture.  
**Rationale:** a Green/Yellow candidate must be feasible against the same canonical enterprise plan that final commit validates.  
**Rejected/avoided:** separate manual planners or a UI-only booking mutation path.  
**Resulting invariant:** manual candidates and commits use the canonical Stage-2 architecture and one persistence transaction.  
**Evidence:** `STAGE3_TEST12_CORRECTION_EVIDENCE_REPORT.md` and frozen TEST-12 regression record.

## 2026-09-20 — post-TEST12 working tree — Planning command/state separation and stable manual-option DOM identity

**Status:** **PROVISIONAL / NOT YET ACCEPTED**.  
**Problem observable in source diff:** canonical Planning board context and action attributes can conflict with descendant commands; progressive re-rendering can replace manual-option nodes.  
**Working decision:** use `data-canonical-plan-perspective` for board context while actual view commands retain `data-canonical-plan-view`; reconcile discovered manual-option DOM nodes by stable option key across progress refreshes.  
**Rationale observable in source:** keep action ownership distinct from view state and preserve a live action node through progressive refresh.  
**Rejected/avoided:** no evidence supports creating another planning/commit path.  
**Resulting invariant:** **not yet protected** until the candidate regression/manual acceptance sequence completes.  
**Candidate coverage present:** `qa/stage3-test13-command-ownership-tests.js`, `qa/stage3-test13-browser-command-ownership.py`.  
**Acceptance:** **UNVERIFIED / REQUIRES RECONSTRUCTION**.

## 2026-09-20 — post-TEST12 working tree — stale network proposal revalidation

**Status:** **PROVISIONAL / NOT YET ACCEPTED**.  
**Problem observable in source diff:** pending requests with elapsed proposal validity need a controlled path to recompute current feasibility rather than simply treating the stored proposal as current.  
**Working decision:** source now contains `NETWORK_REVALIDATION_REQUIRED`, read-only revalidation preview, governed refresh to a new proposal/validity window, and reject/cancel support when proposal validity has elapsed; final accept still performs current feasibility/reservation checks.  
**Rationale observable in source:** retain the formal request/scope while requiring fresh capacity assumptions before acceptance.  
**Rejected/avoided:** source does not implement silent stale acceptance or direct SiteAssignment on preview.  
**Resulting invariant:** **not yet protected** until candidate regression/manual acceptance completes.  
**Candidate coverage present:** `qa/stage3-test13-expiry-revalidation-tests.js`, changed `qa/stage3-network-tests.js`.  
**Acceptance:** **UNVERIFIED / REQUIRES RECONSTRUCTION**.

## 2026-09-20 — repository continuity becomes the engineering source of truth

**Problem:** long-running controlled work cannot safely depend on chat history, which may be truncated or unavailable in a new conversation.  
**Decision:** maintain canonical repository-root continuity files: `CURRENT_HANDOFF.md`, `CONTROLLED_REBUILD.md`, `LABOS_INVARIANTS.md`, `LABOS_ARCHITECTURE.md`, `REGRESSION_MATRIX.md`, `DECISION_LOG.md`, `NEW_CHAT_CONTINUITY_PROMPT.md`.  
**Rationale:** a new chat must be able to reconstruct exact stage/build/baseline/regression state from inspectable repository evidence before changing source.  
**Rejected/avoided:** using conversational memory as an engineering source of truth or assigning build identity based on a previous chat claim.  
**Resulting invariant:** update `CURRENT_HANDOFF.md` at meaningful checkpoints, keep this log append-only, keep the regression matrix synchronized, and reconstruct state before source changes in every fresh conversation.  
**Regression/continuity coverage:** procedural; verified by rereading the seven files and reconstructing the project state without chat context.

## 2026-09-20 — TEST-13 — Planning command ownership becomes protected

**Problem:** Green/Yellow manual replanning could be intercepted by Planning view-command ownership and progressive search could replace a live touch target.  
**Decision:** keep board state on `data-canonical-plan-perspective`, reserve `data-canonical-plan-view` for genuine view commands, and reconcile discovered manual alternatives by stable option key across progress refreshes.  
**Rationale:** preserve touch/click command ownership without creating another planner or commit path.  
**Rejected/avoided:** UI-only booking mutation, duplicate planner, disabling progressive search.  
**Resulting invariant:** manual Green/Yellow commands remain distinct from board/view state and continue through the canonical PlanningEngine/PlanCommitService/StateTransactionService path.  
**Regression coverage:** TEST-12 manual path 7/7, TEST-13 command ownership 4/4, Chromium/touch 5/5.


## 2026-09-20 — TEST-13 — Escalation is active-site scoped

**Problem:** Escalation Mode could expose the same global programme list after switching active laboratories.  
**Decision:** derive Escalation population from `PlanningEngine.rows({siteId, domain:'all', filter:'all'})` for the active lab and carry those IDs through chooser, analysis, review and commit scope.  
**Rationale:** site scope must be part of the canonical planning transaction, not presentation-only filtering.  
**Rejected/avoided:** global Escalation list with cosmetic UI filtering.  
**Resulting invariant:** Escalation always operates on the active laboratory's canonical Prototype/Validation programme population.  
**Regression coverage:** `qa/stage3-test13-escalation-site-scope-tests.js` 5/5 PASS.


## 2026-09-20 — TEST-13 — governed Refresh renews expiresAt

**Problem:** stale-proposal Refresh could calculate fresh feasibility but leave the governed request's old expired `expiresAt`, causing immediate revalidation again on subsequent Accept.  
**Decision:** successful governed Refresh preserves request identity/scope and stores the refreshed proposal assumptions including the new `expiresAt`, fingerprints and reservation windows in one canonical transaction.  
**Rationale:** proposal validity must actually be renewed while preserving explicit receiver governance and final live revalidation.  
**Rejected/avoided:** terminal `NETWORK_REQUEST_EXPIRED`, silent stale acceptance, duplicate request creation, direct SiteAssignment during preview/Refresh.  
**Resulting invariant:** Refresh renews proposal validity but does not create LIVE execution; fresh Accept/Reject remains required.  
**Regression coverage:** TEST-13 expiry/revalidation 8/8 plus Network 77/77 PASS.


## 2026-09-20 — post-TEST13 manual acceptance — Validation manual replan governance and sequence completeness

**Status:** PROVISIONAL until the full post-correction regression matrix and browser acceptance package freeze complete.  
**Problem:** preserved-state TEST-13 browser acceptance showed two Stage-2 regressions: a Green Validation in-lane option committed immediately without a rationale/formal acceptance step, and the planning commit boundary could accept a partial Validation candidate that would replace the programme's full active booking set and therefore delete the rest of its test sequence.  
**Reproduction:** source inspection showed the Validation Green branch called `stage2CommitPlanningScenario(...)` directly; a persisted-state-derived partial Validation candidate containing one active booking was accepted by `PlanCommitService.applyCandidate`, reducing a 13-activity Validation programme to one active booking.  
**Working decision:** all Validation Green/Yellow in-lane selections must use the same rationale-gated canonical manual acceptance boundary before persistence; Validation planning candidates must be programme-complete at both solver output and `PlanningDelta`/`PlanCommitService` acceptance boundaries.  
**Rationale:** single-test replanning may change downstream timing where dependencies/capacity require it, but may never silently delete activities from the Validation programme. Governance must be symmetric for Green and Yellow decisions.  
**Rejected/avoided:** direct Green auto-commit, UI-only confirmation wrappers, partial-booking patching after commit, second Validation planner, whole-state replacement.  
**Candidate coverage:** `qa/stage3-test14-validation-manual-governance-tests.js`; `qa/stage3-test14-validation-browser.py`; strengthened `qa/stage3-test12-manual-browser-path-tests.js`.  


## 2026-09-20 — post-TEST13 correction — superseded Test-11 immediate-commit assertions strengthened

**Status:** accepted QA-governance update; no production behavior changed by this decision.  
**Problem:** two historical Test-11 assertions encoded the earlier Validation-Green immediate-commit implementation: one required `stage2CommitPlanningScenario(...)` inside the in-lane option block and one expected `stage2InLaneApply(...)` itself to return committed success. Preserved-state TEST-13 acceptance explicitly rejected that behavior and the stronger post-TEST13 architecture requires rationale/formal acceptance before persistence.  
**Decision:** strengthen those Test-11 assertions to protect the accepted architecture: option selection must open the governed rationale boundary with zero persistence; explicit non-empty rationale acceptance must then commit through `stage2CommitPlanningScenario(...)` / PlanCommitService / StateTransactionService exactly once; the committed Validation plan must retain exactly one active booking for every canonical Validation activity.  
**Rationale:** retaining the historical immediate-commit expectation would require reintroducing the browser defect the user rejected. The updated assertions preserve the original Test-11 intent—shared Stage-2 command ownership and task-level sister-lab continuity—while adding the stronger governance and sequence-completeness requirements.  
**Rejected/avoided:** weakening the tests, restoring immediate Green commit, UI-only confirmation, or a second Validation planner.  
**Regression coverage:** `qa/stage3-test11-manual-feedback-tests.js`, `qa/stage3-test11-inlane-commit-test.js`, strengthened `qa/stage3-test12-manual-browser-path-tests.js`, `qa/stage3-test14-validation-manual-governance-tests.js`, `qa/stage3-test14-validation-browser.py`.


## 2026-09-20 — post-TEST13 correction — Test-11 Yellow governance assertions aligned to the common rationale boundary

**Status:** accepted QA-governance update; no production behavior changed by this decision.  
**Problem:** historical Test-11 Yellow assertions expected the old Yellow-specific modal (`data-v1190-confirm-yellow`) and a direct `v1190ConfirmInLaneYellowV5 → stage2CommitPlanningScenario` implementation. The accepted post-TEST13 architecture deliberately routes both Green and Yellow through the common reason-coded modal and `stage2ConfirmCanonicalInLaneV14` boundary.  
**Decision:** strengthen the Test-11 Yellow suite to require zero persistence before formal acceptance, the shared reason-coded modal/command, canonical Stage-2 commit after rationale acceptance, and complete Validation sequence preservation.  
**Rationale:** the old static implementation expectation would reject the stronger common-governance architecture and incentivize reintroducing duplicate confirmation logic.  
**Rejected/avoided:** a separate Yellow commit boundary, Yellow-specific persistence path, or weakening the behavioral requirement.  
**Regression coverage:** `qa/stage3-test11-yellow-red-tests.js`, `qa/stage3-test14-validation-manual-governance-tests.js`, `qa/stage3-test14-validation-browser.py`.


## 2026-09-20 — TEST-14 — Validation manual governance and programme-complete candidate invariant accepted

**Status:** accepted for TEST-14 browser-acceptance candidate after full automated matrix green.  
**Problem:** TEST-13 preserved-state manual acceptance showed that Validation Green could commit without rationale/formal acceptance and that a partial Validation candidate could replace the programme booking set, removing the remainder of the test sequence.  
**Decision:** require the same rationale-gated formal acceptance for Validation Green and Yellow, and enforce programme-complete Validation candidate coverage both after solver generation and at `PlanningDelta.fromCandidate` before LIVE replacement.  
**Rationale:** governance must be symmetric and manual replanning must never silently delete canonical Validation activities.  
**Rejected/avoided:** immediate Green persistence, UI-only confirmation, post-commit patching of missing tests, a second Validation planner, or weakening protected tests.  
**Resulting invariants:** zero persistence before rationale acceptance; exactly one persistence on accepted move; exactly one active booking per canonical Validation activity; `PLANNING_CANDIDATE_INCOMPLETE` on missing/duplicate/orphan coverage.  
**Regression coverage:** strengthened Test-11 and Test-12 suites, `qa/stage3-test14-validation-manual-governance-tests.js` 5/5 PASS and `qa/stage3-test14-validation-browser.py` 3/3 PASS; full controlled matrix 380/380 PASS.

## 2026-09-20 — Stage 3 RC1 — protected baseline established

**Status:** ACCEPTED / PROTECTED.  
**Decision:** the exact accepted TEST-14 archive was promoted byte-for-byte to `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE3_RC1_WEB.zip`, SHA-256 `bb90f0dd8b3951278a7a171301f7e901cd25677ce2dce4bb4187c45882541d24`, without changing its tested internal identity `STAGE3-GITHUB-TEST-14` / `REV 1.0.185 · S3 TEST-14`.  
**Result:** Stage 1, Stage 2 and Stage 3 became protected; Stage 4 became the next eligible stage.

## 2026-09-21 — Stage 4 entry — canonical deterministic Readiness authority

**Status:** implementation decision; Stage 4 still OPEN.  
**Problem:** legacy Readiness was Prototype-specific, boolean-centric and performed mutation/normalization during nominal evaluation; Readiness equipment/staff resolution could bypass the protected Planning commit boundary. Validation lacked the same pre-execution readiness authority.  
**Reproduction:** RED gate on untouched RC1 produced 12/12 intended architecture/purity failures and 3/3 governed-boundary failures, including direct Readiness booking/persistence bypass.  
**Decision:** introduce one deterministic cross-domain `ReadinessEngine` plus `ReadinessContext`, structured `ReadinessAssessment` and governed `ReadinessCommandService`; legacy `P.ReadinessService` becomes a compatibility facade. Reuse protected State/Planning/Network services rather than duplicating them.  
**Rejected/avoided:** separate Prototype/Validation engines, a second scheduler, Readiness-owned SiteAssignment logic, direct UI booking mutation, hidden normalization in readiness reads, Stage-5 workflow redesign.  
**Result:** focused Stage-4 architecture/purity 12/12 PASS, governed resource boundary 3/3 PASS, persisted-state 4/4 PASS and Chromium/mobile 9/9 PASS.

## 2026-09-21 — Stage 4 TEST-1 — browser-acceptance candidate earned

**Status:** **OPEN / BROWSER ACCEPTANCE CANDIDATE ONLY — NOT RC / NOT PROTECTED.**  
**Acceptance trigger for TEST identity:** protected matrix restored to 380/380 PASS; Stage-4 additional automated/real-state/Chromium gates green; all production JavaScript and runtime references valid.  
**Decision:** assign `STAGE4-GITHUB-TEST-1` / `REV 1.0.185 · S4 TEST-1` and freeze a Stage-4 browser-acceptance package. Identity-only build-key changes were made after the behavioral matrix was green and followed by dedicated post-identity deployment/reference/browser checks.  
**QA-fixture governance:** Test-11 horizon and TEST-13 Chromium fixture were changed only after the exact same fixture failures reproduced on protected RC1; behavioral assertions were retained. A legacy QA `show()` helper that mutates live state before the protected render boundary is not used to judge production render purity.  
**Resulting candidate invariant:** Stage 4 remains unprotected until the exact frozen package passes `STAGE4_MANUAL_BROWSER_CHECKLIST.md` and the user explicitly accepts it. Stage 5 remains not started.  
**Deferred:** Stage-10 sticky Planning timeline/date/lane/`−`/`+`/`FIT` requirement remains deferred.
