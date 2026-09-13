# LabOS REV 1.0.109 — QA closure and fault-injection report

## Executive result

REV 1.0.109 closes all seven defects identified in the broad REV 1.0.108 campaign. The release retains IndexedDB schema **35** and therefore does not require a data reset.

The highest-risk defect — a sister-lab transfer deleting a shared calibration/readiness dependency — was reproduced from the prior test case and retested after the fix. `P26-1006 → LAB-DE` now retains the shared `EQ-008` readiness reservation and the resulting whole portfolio passes every planning-integrity category with zero findings. A deliberately corrupted transfer candidate was also injected and the final transfer gate rejected it atomically with `NETWORK_TRANSFER_INTEGRITY_FAILED`.

## Defect closure

| ID | Prior severity | Defect | REV 1.0.109 correction | Verification |
|---|---|---|---|---|
| F-04 | Critical | Sister-lab transfer could remove request-sourced readiness used by other projects | Auto-generated readiness is portfolio/resource-owned; all cleanup paths preserve it; compare and accept both run whole-portfolio integrity gates | PASS — reproduced transfer remains integrity-clean; injected invalid candidate rejected |
| F-05 | High | Scenario Lab could call a recovery “better” because it compared with a conflict-penalized scenario baseline | Untouched LIVE is the optimization reference; Scenario-as-is is separate; non-worsening/Pareto guard and no-other-project-later rule | PASS — prior outage case creates 5 simulated conflicts but all worse-than-LIVE options are filtered |
| F-01 | High | Impossible dates such as 2026-02-30 were normalized and accepted | Strict ISO calendar validation, independent of JS rollover semantics | PASS — 2026-02-29/30 rejected, 2028-02-29 accepted, 2100-02-29 rejected |
| F-03 | High | Fractional sample count could partially allocate samples | Integer validation before mutation | PASS — 1.5 and negative values reject with zero state mutation |
| F-02 | Moderate | Prototype quantity had no upper bound | Configurable controlled limit, default 5,000; enforced in service, edit and wizard flows | PASS — 5,000 accepted; 5,001 and 1,000,000 rejected |
| F-06 | Moderate | Request filters clipped at mobile/common desktop widths | Auto-fit responsive grid plus width containment | PASS — 16 breakpoint-adjacent widths from 320 to 1920 px |
| F-07 | Moderate | Scenario inputs clipped at 360 px | Width-contained labels/selects/inputs; one-column compact breakpoint | PASS — 9 widths including 320/360 with outage fields exposed |

## Planning integrity changes

Readiness reservations created by AUTO PLAN now carry `portfolioOwned=true` and preserve `originRequestId` as provenance. Replanning, request-definition invalidation, portfolio planning, escalation, sister-lab comparison, demo replanning and archive deletion no longer delete such readiness merely because the triggering request changes site or is removed.

Sister-lab planning is now transactional at the portfolio boundary. Every candidate is checked with both generic invariants and `planningIntegrityAudit`; the final `transferToSite` call repeats the check before producing the accepted transfer record. The injected-fault test deliberately removed the calibration/readiness reservation that previously caused the production defect; the transfer was rejected rather than committed.

Baseline REV 1.0.109 planning integrity is clean: **0 findings across 15 audited defect categories**. AUTO PLAN retains the REV 1.0.108 outcome-first rule. The current demo baseline remains 4 unplanned / 9 total late days / 6 day maximum delay. No tested option is currently a true optimization, so AUTO PLAN correctly recommends no change; the available red result remains a recovery trade-off, not an optimization.

## Scenario Lab changes

Scenario Lab now exposes three conceptually distinct rows:

1. **Current LIVE baseline** — untouched accepted plan and sole optimization reference.
2. **Scenario as-is** — simulated disruption before recovery; informational only.
3. **Verified optimization options** — conflict-free candidates that do not worsen critical LIVE delivery metrics, do not move another accepted project later, and improve at least one outcome.

The exact REV 1.0.108 failure was replayed using `P26-1005` with an equipment outage over its booked equipment window. LIVE remains 9 portfolio late days / 6-day maximum delay with zero scenario conflicts. The simulated state has five direct conflicts. Candidate plans that previously appeared because they merely resolved those conflicts while adding large amounts of lateness are now filtered; none is Recommended.

Scenario application also records a planning-state fingerprint. If LIVE planning changes after the twin was calculated, the stale scenario is rejected and must be regenerated. A final whole-portfolio integrity audit executes before commit.

## Boundary and responsive regression

The focused REV 1.0.109 regression suite passed **11/11** targeted groups with **0 failures**. These groups cover bootstrap, date boundaries, quantity boundaries, sample allocation boundaries, the exact shared-readiness transfer defect, injected transfer corruption, the exact Scenario Lab baseline defect, scenario apply/stale-state gates, responsive geometry, all 12 Android role selections, and uncaught browser errors.

Responsive geometry was checked at request-filter widths 320, 360, 390, 412, 600, 768, 899, 900, 1024, 1119, 1120, 1121, 1280, 1366, 1440 and 1920 px. Scenario controls were checked at 320, 360, 390, 412, 600, 720, 768, 1024 and 1366 px with equipment-outage controls explicitly made visible. No measured control crossed its container or viewport and no body-level horizontal overflow was produced.

The compact Android role-selector regression was repeated for all **12 roles** at 360 px and remained synchronized with application identity while closing the drawer after selection.

## Residual qualification boundary

The earlier REV 1.0.108 campaign exhaustively enumerated the finite role/gate and responsive matrices and used equivalence/boundary/fault partitions for infinite domains. REV 1.0.109 was then regression-tested specifically against every defect found plus baseline integrity and AUTO PLAN semantics. A physical-device Android qualification, authentic historical schema 0–30 production fixtures, and production multi-user/server behavior remain outside this static GitHub Pages POC environment.

## Release decision

The seven identified defects are closed in this POC and no new failure was observed in the focused REV 1.0.109 regression. The static POC remains unsuitable as a production QMS/LIMS until authenticated server-side identity/authorization, transactional shared storage, immutable audit retention, backup/restore, e-signature controls where applicable, integration validation and formal deployment qualification are implemented.
