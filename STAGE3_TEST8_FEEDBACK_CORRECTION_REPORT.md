# LabOS Stage 3 — Test-8 Manual Feedback Correction Report

Source under review: `STAGE3-GITHUB-TEST-8` plus the user's exported persisted browser state.

## Reproduced before production edits

The new Test-8 feedback regression suite failed **0/10 PASS, 10/10 FAIL** before correction, covering:
- unresolved historical Validation booking identity;
- manual in-lane search stopping at the visible timeline;
- AUTO PLAN full-abort/performance behavior;
- stale sister-lab acceptance exposing raw revalidation errors.

## Architectural corrections

### Stage 1 — historical Validation booking identity
Legacy `DEV-TESTREQ...` / `TESTREQ...` booking references are reconciled deterministically using stable requirement identity, task kind, standard/basis-test evidence, dependency/genealogy and sequence metadata. Ambiguous cases remain unresolved with structured integrity issues. No display-name-only matching is used.

### Stage 2 — bounded manual continuation
Validation in-lane replanning retains the protected PlanningEngine and Green/Yellow/Red semantics. If the visible range has no selectable Green/Yellow option, the same solver continues through a bounded horizon and exposes the next feasible controlled option.

### Stage 2 — partial AUTO proposals and performance
Blocked programmes remain unchanged and visible while independently feasible programmes may form a controlled partial proposal. Commit applies only successful programme IDs through the existing planning transaction boundary.

Independent deterministic AUTO candidate analyses are parallelized through worker orchestration, but each worker calls the same `PlanningPortfolioService`/PlanningEngine authority.

Real-state performance evidence on the corrected source:
- synchronous seven-candidate analysis: **17.73 s**;
- three-worker parallel analysis: **7.20 s**;
- speedup: **2.46×**;
- semantic equivalence: **PASS**.

### Stage 3 — governed stale-request revalidation
`NETWORK_REVALIDATION_REQUIRED` remains a hard safety boundary. The receiver now gets a read-only revalidation preview, may explicitly refresh the proposal transactionally, and must then make a new explicit Accept/Reject decision. Fresh acceptance still performs final live revalidation.

## New protection
- Test-8 feedback static/integration guards: **11/11 PASS**.
- Test-8 feedback dynamic planning/transaction scenarios: **6/6 PASS**.
- Real-state AUTO performance/equivalence: **2/2 PASS**.
