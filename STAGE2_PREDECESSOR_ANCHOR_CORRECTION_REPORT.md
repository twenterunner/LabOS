# LabOS Stage-2 Manual Replan Predecessor Anchor Correction

**Date:** 2026-09-27  
**Product revision:** REV 1.0.185  
**Candidate build:** `STAGE2-PREDECESSOR-FIX-TEST1`  
**Protected source baseline:** Stage-4 RC1 / `355c0a4111ddf169de9096bb60831ee702285e623b4ac1ce7df93d07ebe9eda7`

## Reproduced defect

For a Validation dependency chain `A → B → C → D`, manually constraining `C` could cause the canonical whole-programme solve to move `A` and `B` as well as `C/D`.

Controlled reproduction used a four-activity Validation chain. Baseline predecessor bookings were on 2026-10-20. Replanning activity 3 with a later planning context and manual date caused the untouched Stage-4 RC1 to move activities 1 and 2 to 2026-10-22.

## Corrected policy

For a manual Validation activity replan:

1. Determine the selected activity's transitive predecessor set from the canonical dependency graph.
2. Reintroduce already-booked predecessors into the transient Validation planning adapter as temporary hard anchors.
3. Run the same canonical `PlannerService` / `PlanningEngine`; no second scheduler is introduced.
4. The selected activity is constrained to the accepted manual date; successors remain free to move according to dependencies/capacity.
5. If the requested move would require a predecessor to move, reject that candidate instead.
6. Restore original predecessor lock/constraint state and remove all temporary anchor metadata before returning the candidate.

## Code changed

- `labos-planning-stage2-1.0.185.js`
- `labos-services-1.0.185.js`
- build identity in `index.html` and `labos-version.json`
- controlled handoff / invariant / regression / decision documentation
- added `qa/stage2-manual-predecessor-anchor-tests.js`

## Automated evidence

- New predecessor-anchor regression: **2/2 PASS**.
- Stage-2 graph suite: **15 PASS** observed; harness remained alive on timers after completing assertions.
- Stage-2 portfolio suite: **10 PASS** observed; harness remained alive on timers after completing assertions.
- Stage-2 hardening suite: **7 PASS** observed; harness remained alive on timers after completing assertions.
- Stage-2 caller audit: **12/12 PASS**.
- Stage-2 browser-feedback static suite: **5/5 PASS**.
- Stage-3 TEST-11 manual-feedback suite: **3/3 PASS**.
- Stage-3 TEST-11 exact Validation in-lane commit: **1/1 PASS**.
- Stage-4 persisted-state readiness: **4/4 PASS**.

Historical TEST-14's hard-coded Green fixture currently reports 0 Green / 8 Yellow on both the untouched Stage-4 RC1 and this correction candidate when run on 2026-09-27; this is date drift in that historical test's live-clock dependency, not a difference introduced by this patch.

## Required browser acceptance

1. Open a Validation programme with at least four sequential tests `A → B → C → D`.
2. Record A and B start/end/resources/site.
3. Manually replan C to a later feasible date and accept with rationale.
4. Verify A and B are byte-for-byte unchanged in planning placement/resource/site fields.
5. Verify C moves to the accepted date.
6. Verify D may move automatically and remains after C.
7. Try a date for C earlier than B can finish; verify LabOS rejects/marks the candidate infeasible rather than moving A/B.
8. Reload the app and verify A/B are not permanently locked solely because of this replan.

This is a correction candidate, not a new protected RC until browser acceptance is explicitly given.
