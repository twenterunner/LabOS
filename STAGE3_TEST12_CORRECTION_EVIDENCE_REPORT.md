# Stage 3 TEST-12 Correction Evidence Report

## Controlled scope

Product revision: **REV 1.0.185**  
Controlled build: **STAGE3-GITHUB-TEST-12**  
Stage: **3 of 10 — Network / Sister-Lab Capability remains OPEN**

TEST-12 exists because the frozen TEST-11 browser gate showed that committing Green or Yellow manual-replan alternatives did not work for either Prototype or Validation while the other Stage-3 browser checks appeared normal.

## Classification

The defect is a **Stage-2 Planning Engine regression discovered during the Stage-3 acceptance gate**. Stage 3 therefore remains open. No Stage-3 RC/checkpoint is created and Stage 4 is not started.

## Reproduced generic causes

1. The effective Prototype in-lane path could still use the historical V1096 manual-draft solver while Validation used the canonical Stage-2 PlanningEngine.
2. A single-programme Stage-2 solve could lose cross-domain bookings through historical site-scoping, allowing a Prototype candidate to appear feasible even when Validation already consumed the same resource capacity.
3. The Planning horizontal-pan pointer handler did not classify buttons/action controls as interactive, so pointer capture could own a manual-replan tap before the command control did.

Persisted-state reproduction confirmed the cross-domain problem on `P26-1009 / Test · Operating current`: the historical path could surface `2026-09-30 / DE-U03` although Validation `V26-0209 / Load endurance` already occupied `DE-U03`. The TEST-12 canonical solve no longer offers that conflicting alternative.

## Generic Stage-2 correction

The effective manual path is now:

`manual request -> shared Stage-2 PlanningEngine -> enterprise/cross-domain capacity-aware candidate -> existing governance/confirmation -> canonical planning candidate/PlanningDelta -> PlanCommitService -> Stage-1 StateTransactionService -> exactly one persistence transaction -> canonical live state -> redraw`

Prototype and Validation share the PlanningEngine and enterprise capacity ledger. Prototype retains reason-coded manual-replan governance/protection semantics. Validation retains controlled Yellow confirmation. Accepted task-level sister-lab SiteAssignments remain task-level and programme `homeSiteId` / `executionSiteId` ownership is not replaced by a remote task site.

Blank Planning timeline space remains pannable. Buttons, ARIA button controls, labels, inputs, selects, links, text areas and content-editable controls are excluded from pan pointer capture.

No second planner, Validation-specific scheduler, UI-only workaround, direct booking mutation, alternate persistence route, or sister-lab-specific scheduling engine was introduced.

## Protected regression evidence

Fresh protected results before final TEST-12 freeze:

- Stage 1 architecture/read-purity: **10/10 PASS**
- Stage 1 integrity: **17/17 PASS**
- Stage 1 canonical boundaries: **3/3 PASS**
- Stage 1 functional regression: **16/16 PASS**
- Stage 2 graph/single-programme: **27/27 PASS**
- Stage 2 portfolio/scenario: **24/24 PASS**
- Stage 2 hardening: **19/19 PASS**
- Stage-2 browser feedback: **5/5 PASS**
- Stage-2 real-state AUTO/performance/equivalence: **2/2 PASS**
- Stage-3 Network: **77/77 PASS**
- Stage-3 Application: **14/14 PASS**
- Stage-3 Transactions/reservation/lifecycle/external execution: **18/18 PASS**
- Stage-3 Release hardening: **10/10 PASS**
- Stage-3 Caller/governance audit: **15/15 PASS**
- Stage-3 Manual feedback: **5/5 PASS**
- Validation identity continuity: **8/8 PASS**
- Stage-3 real-state regression: **8/8 PASS**
- Test-4 feedback: **9/9 PASS**
- Test-6 deployment/build guard: **8/8 PASS**
- Test-8 static: **11/11 PASS**
- Test-8 dynamic: **6/6 PASS**
- Test-9 static: **7/7 PASS**
- Test-9 dynamic: **4/4 PASS**
- TEST-11 shared-boundary/manual regression: **3/3 PASS**
- TEST-11 exact in-lane partial Validation commit: **1/1 PASS**
- TEST-11 rollback/Prototype: **2/2 PASS**
- TEST-11 Yellow/Red governance: **3/3 PASS**
- TEST-12 persisted-state/manual-browser-path: **7/7 PASS**
- Stage-3 build identification after TEST-12 identity advancement: **11/11 PASS**

Controlled aggregate: **350/350 PASS, 0 FAIL**.

Long-running suites were executed in deterministic assertion ranges where required. Interrupted invocations were not treated as completed gates.

Two historical static assertions were updated because they asserted the superseded implementation shape (a Validation-only manual branch and scenario registration directly inside the old Validation function). Production code was not changed to satisfy them. The updated assertions require the stronger architecture: domain-neutral Stage-2 entry, canonical ProgrammeRegistry resolution, shared scenario registration/commit, bounded continuation search, and no Validation-only manual-planner branch.

## Release identity and structural freeze

- Build id: `STAGE3-GITHUB-TEST-12`
- Visible badge: `REV 1.0.185 · S3 TEST-12`
- Product revision remains `1.0.185`
- Build-identification gate: **11/11 PASS**
- Test-6 post-identity gate: **8/8 PASS**
- Stage-10 sticky Planning header/date/lane/`−`/`+`/`FIT` requirement remains deferred.

TEST-12 is a GitHub manual browser acceptance package. It is **not** a Stage-3 RC and does not complete Stage 3.
