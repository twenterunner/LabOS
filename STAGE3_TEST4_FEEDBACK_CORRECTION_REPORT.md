# LabOS Stage 3 — TEST 4 Feedback Correction Report

Date: 2026-09-19

Source under review: **STAGE3-GITHUB-TEST-4**  
Corrected checkpoint: **STAGE3-GITHUB-TEST-5**

## Browser findings corrected

1. Prototype single-operation sister-lab comparison was still using the historical V1170 compatibility comparator as the effective UI feasibility authority.
2. Validation booking taps bypassed the common planned-item interaction and opened a different manual-slot window.
3. Validation partial network routing was not exposed through the same planned-item interaction as Prototype.
4. Regression evidence needed to prove the same behavior after realistic prior planning/network mutations and reload-compatible persisted state.

## Architectural correction

- Effective task/activity network comparison now uses canonical `TransferScope.task` semantics and `NetworkProposalService`, which delegates feasibility to the protected Stage-2 PlanningEngine.
- Governed application remains through `NetworkTransferService`; no direct SiteAssignment or second scheduler was introduced.
- Prototype tasks and Validation activities now enter one common planned-item interaction. Only the canonical domain and stable task/activity ID differ underneath.
- Both domains expose Move/replan in swimlane plus governed single-test/activity sister-lab routing where independently routable.
- Validation manual feasibility uses the same protected Stage-2 planning kernel and stable activity ID constraints.
- Existing Validation leg/subflow routing through `TransferScope.subflow` remains intact.
- The historical V1170 comparator remains only as compatibility/read-only code where legacy audit coverage requires it; it is no longer the effective UI feasibility authority.

## Regression evidence

The new regression suite was first exercised against TEST 4 and deliberately exposed the defects (**0/6 PASS, 6/6 FAIL** at the initial red checkpoint). After correction it was expanded to include persisted-state and cross-domain behavior and now passes **9/9**.

The 9 cases cover:
- effective single-task UI comparison uses NetworkProposalService, not V1170;
- one common booking-click interaction for Prototype and Validation;
- ProgrammeRegistry/stable task-activity resolution;
- browser-facing feasible sister-lab results for both domains;
- Validation manual feasibility through Stage-2;
- persisted/reloaded state after prior network mutation;
- same controlled actions in Prototype and Validation planned-item modals;
- feasible canonical task alternatives across four Stuttgart Prototype fixtures;
- progressive Validation in-lane replanning using the protected Stage-2 engine.

## Protected recertification after correction

- Stage-3 network/domain: 77/77 PASS
- Stage-3 application: 14/14 PASS
- Stage-3 transactions: 18/18 PASS
- Stage-3 caller audit: 15/15 PASS
- Stage-3 release hardening: 10/10 PASS
- prior Stage-3 manual feedback: 5/5 PASS
- Test-4 feedback/persisted-state integration: 9/9 PASS
- Stage-2 browser-feedback: 5/5 PASS
- protected Stage 2 canonical gate: 70/70 PASS
- protected Stage 1 gate: 46/46 PASS

No Stage-4 functionality was introduced.
