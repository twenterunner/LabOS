# LabOS Stage 3 — Manual Feedback Correction Report

Date: 2026-09-19
Controlled build target: **STAGE3-GITHUB-TEST-3**
Product revision: **1.0.185**

## Scope

This correction remains inside the controlled 10-stage rebuild framework. Stage 4 has not started.

The browser feedback from `STAGE3-GITHUB-TEST-2` was classified as:

1. **Stage 3 — My Work:** newly Requested sister-lab transfers were not visible as receiver work.
2. **Stage 3 — partial routing:** governed single-operation routing existed but the effective Prototype Planning click path bypassed the task action prompt, making it effectively undiscoverable.
3. **Controlled Stage-2 reopen — future projects:** potential/future projects were no longer represented in the effective canonical Planning page.
4. **Controlled Stage-2 reopen — planning perspectives:** Overall / Per programme / Per equipment / Per person were not all rendered through the same canonical planning experience.

## Architectural corrections

### Stage 3 — receiver My Work

Canonical network records from `NetworkRecordAdapter` now include `Requested` alongside `UnderReview`, `Accepted`, and `InExecution` in receiver My Work. Requested/UnderReview records expose a receiver review action. No UI-only transfer state was introduced.

### Stage 3 — single-operation routing

The effective Prototype planned-booking click path now opens the existing planned-task action prompt. That prompt exposes both normal Move / replan and governed single-operation sister-lab routing. The routing action continues to use the Stage-3 transfer scope/proposal/transaction path and the same Stage-2 planning kernel; no second planner or direct site assignment was added.

Validation activity/leg/subflow governed routing remains preserved.

### Controlled Stage-2 reopen — future projects

The canonical Overall Planning experience again displays future/potential-project demand from the existing pipeline model, including probability and probability-weighted expected load. These items are planning demand overlays only; they are not committed bookings and do not create a separate forecast/scheduling engine.

### Controlled Stage-2 reopen — planning perspectives

Overall, Per programme, Per equipment, and Per person now remain within the same canonical planning renderer/data model. Non-overall views no longer fall back to the disconnected legacy planning renderer. This change is functional architecture only; cosmetic redesign remains Stage 10.

## New regression coverage

`qa/stage3-manual-feedback-tests.js` contains five regression scenarios covering:

- Requested receiver My Work visibility;
- planned-task click-path reachability;
- visible governed single-operation routing action;
- future/potential-project probability overlay;
- canonical rendering of all four planning perspectives.

Fresh result: **5/5 PASS, 0 FAIL**.

## Fresh protection status for this correction tree

Stage 3:
- network/domain 77/77
- application 14/14
- transactions 18/18
- caller audit 15/15
- release hardening 10/10
- build identification 8/8
- manual-feedback regression 5/5
- **Stage-3 total 147/147 PASS, 0 FAIL**

Protected Stage 2:
- graph 27/27
- portfolio/scenario 24/24
- hardening 19/19
- **Stage-2 total 70/70 PASS, 0 FAIL**

Protected Stage 1:
- architecture/read purity 10/10
- integrity 17/17
- canonical boundary 3/3
- functional 16/16
- **Stage-1 total 46/46 PASS, 0 FAIL**

Combined Stage-1/2/3 automated assertions: **263/263 PASS, 0 FAIL**.

Structural checks:
- root JavaScript parse: 10/10 PASS
- local `index.html` script references: 9/9 present

Real browser/IndexedDB automation remains a separate manual/environment gate. Node fallback execution must not be described as real IndexedDB certification.
