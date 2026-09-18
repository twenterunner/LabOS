# LabOS REV 1.0.187 Verification Matrix

Generated: 2026-09-18T04:49:30.976Z
Result: **40 PASS / 0 FAIL / 40 total**

| Test | Feature / scenario | Result | Regression risk | Notes |
|---|---|---:|---|---|
| G01 | Simple Prototype Build — deterministic constrained plan | **PASS** | High | 7 bookings · forecast 2026-10-05 |
| G02 | Material shortage — stage stays blocked and not green | **PASS** | High | 4 material issue(s) |
| G03 | Process development — one development task before execution | **PASS** | High | DEV-P26-1202-S4 completes before P26-1202-S4 |
| G04 | Equipment calibration/readiness constraint — planned equipment valid at use | **PASS** | High | 5 equipment bookings readiness-valid |
| G05 | Staff qualification constraint — impossible staff pool is rejected | **PASS** | High | ZERO_REQUIRED_SKILL |
| G06 | Manual plan — feasible slot uses canonical engine and commits | **PASS** | High | 2026-09-18 → 2026-09-18 (green) |
| G07 | Locked plan — auto-plan preserves valid lock | **PASS** | High | P26-1005-S2 preserved |
| G08 | Priority change — sandbox replan is isolated and reversion restores baseline | **PASS** | High | sandbox forecast 2026-10-05; LIVE unchanged |
| G09 | Late build recovery — local recovery differs from sister-lab comparison | **PASS** | High | 1 local recovery candidate(s); 3 lab comparison(s) |
| G10 | Sister-lab whole programme — request, accept, execute lifecycle | **PASS** | High | LAB-NL → LAB-DE |
| G11 | Partial sister-lab transfer — one operation moves, programme stays home | **PASS** | High | P26-1005-S2 moved to LAB-DE |
| G12 | Sister-lab rejection — live baseline remains intact | **PASS** | High | LAB-DE rejected without baseline mutation |
| G13 | Validation simple series — dependencies respected | **PASS** | High | 5 dependency-valid bookings |
| G14 | Validation parallel legs — independent legs can schedule concurrently | **PASS** | High | Test · Vibrodynamic specialist profile and Test · Interface dimensions run in parallel |
| G15 | Validation split/merge — flow synchronizes without dangling dependencies | **PASS** | High | 2-branch split merged back into controlled flow |
| G16 | New test development — closest standard/delta estimate becomes planned work | **PASS** | High | Functional verification: 4.5 h estimate |
| G17 | Prototype-linked Validation — prototype timing impact propagates | **PASS** | High | 2026-09-18 → 2026-10-01; Validation → 2026-10-12 |
| G18 | Test failure/rerun history — report retains complete controlled history | **PASS** | High | replaced 1 aggregate result(s) with explicit fail + rerun history |
| G19 | Automated Lessons Learned — structured lesson resurfaces for similar work | **PASS** | High | 12 lessons; 1 surfaced for P26-1001 |
| G20 | Automatic report — generated from execution evidence with release gaps explicit | **PASS** | High | 31 activities · 31 result records · Approved |
| G21 | Archive/restore — full history survives archive flag and persistence round-trip | **PASS** | High | 1 route + 0 measurement records preserved |
| G22 | KPI consistency — KPI total derives from canonical Validation records | **PASS** | High | 8 programmes · OTD 100% |
| G23 | Multi-lab KPI — selected labs use different underlying data | **PASS** | High | NL 8/22.7h; DE 1/0.0h; US 1/12.9h |
| G24 | Responsive Planning — source-level regression gate for pan/zoom/filter/mobile | **PASS** | High | pan/zoom/domain filter/mobile CSS hooks present (browser visual test reported separately) |
| N01 | Reject incapable equipment/lab | **PASS** | High | No registered equipment at Detroit Engineering Lab has the required capability “High-speed vibration” for Test · Vibrodynamic specialist profile. |
| N02 | Reject expired calibration without governed recovery/evidence | **PASS** | High | RECOVERY_REQUIRED |
| N03 | Reject unqualified/unavailable staff | **PASS** | High | ZERO_REQUIRED_SKILL |
| N04 | Reject skipped required workflow stage | **PASS** | High | Build Readiness has 4 unresolved blocker(s): Material ready for intended build, Committed timing plan … |
| N05 | Reject final report release with missing mandatory Validation results | **PASS** | High | 6 critical gap(s) |
| N06 | Reject incapable sister lab | **PASS** | High | No registered equipment at Twente Prototype Lab has the required capability “High-speed vibration” for Test · Vibrodynamic specialist profile. |
| N07 | Reject conflicting locked booking without moving it | **PASS** | High | Locked booking Mechanical Assembly conflicts with QA-OUTAGE. |
| N08 | Scenario/candidate planning cannot silently mutate baseline | **PASS** | High | LIVE fingerprint unchanged |
| N09 | Reject material receipt closure with missing required material | **PASS** | High | Exact BOM material can be covered by available stock and/or incoming supply but the reservation/supply commitment is not complete |
| N10 | Reject programme completion with unresolved blockers | **PASS** | High | 1 blocker(s) |
| A01 | One canonical public planner shared by Prototype and Validation | **PASS** | High | PlanningEngine handles both domains |
| A02 | Planning horizon rejects absurd distant plans | **PASS** | High | PLANNING_HORIZON_EXCEEDED — No complete feasible plan exists inside the 180-day planning horizon. Latest feasible completion would be 2028-01-11; use recovery, sister-lab, reprioritisation or external-capacity options instead of creating a multi-year plan. |
| A03 | Closed Validation has terminal authoritative workflow state | **PASS** | High | Closed → Report/Close terminal, no false planning blocker |
| A04 | Status colour causes are explainable via canonical blocker records | **PASS** | High | 9 coded reason(s) |
| A05 | Process-development explicit step linkage takes precedence over library candidate | **PASS** | High | DEV-P26-1202-S4 mapped only to P26-1202-S4 |
| P01 | Persistence contract — save/load/export/reset/import/reload | **PASS** | Medium | repository persistence contract passes (Node uses documented memory fallback; browser IndexedDB tested separately) |

## Verification scope

This matrix is generated by `qa/run-regression.js`; it executes the business/domain services directly against fresh demo-state clones. It is intentionally not a prose-only QA claim. Browser/UI and real IndexedDB coverage is reported separately in `BROWSER_VERIFICATION.md`.
