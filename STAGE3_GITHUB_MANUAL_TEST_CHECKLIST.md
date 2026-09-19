# Stage 3 GitHub Pages Manual Test Checklist — TEST 6

Controlled build: **STAGE3-GITHUB-TEST-6**  
Product revision: **1.0.185**

## Important continuity instruction

**Do NOT reset demo data, clear site storage, clear IndexedDB, or use a clean browser profile for the primary continuity test.**

Use the same browser/site data that you carried through the earlier Stage-3 GitHub test builds. Hard-refresh the deployed files if needed, but preserve LabOS IndexedDB state.

Confirm first:

- header shows **`REV 1.0.185 · S3 TEST`**;
- sidebar footer shows **`Controlled build: STAGE3-GITHUB-TEST-6`**.

## Requested browser checks

### 1. Validation planned-item route action after carried-forward state
Tap a planned Validation activity in your existing browser state, preferably the same kind of activity that previously showed the defect (for example `Load endurance`).

PASS if the common planned-item window now shows **Route only this test/activity to a sister lab** whenever that canonical activity is independently routable.

### 2. Validation Green / Yellow manual alternatives
From that Validation planned-item window choose **Move / replan in swimlane**.

PASS if feasible alternatives progressively appear in the same swimlane. Green means no controlled resource is displaced and no extra readiness work is introduced; filling a previously unassigned resource may remain Green. Yellow is reserved for a controlled resource/readiness change.

### 3. Prototype regression check
Tap and manually replan one Prototype task, then open its single-test sister-lab routing.

PASS if Prototype behavior remains unchanged from TEST 5: common planned-item interaction, Green/Yellow alternatives and governed partial sister-lab request.

### 4. Validation partial transfer decision
Create one Validation single-activity sister-lab request. Switch to the receiving lab and accept or reject it.

PASS if the receiver decision is governed, appears in the appropriate work/follow-up flow, and does not silently transfer programme ownership for a partial activity.

### 5. Accepted Validation partial routing survives AUTO/replan
For an accepted Validation partial transfer, run the relevant AUTO/replan operation.

PASS if the accepted remote activity remains the single live active booking/site assignment and no stale local live booking reappears.

### 6. Refresh / reopen continuity
Refresh the GitHub Pages application or close/reopen the tab/browser **without resetting IndexedDB**.

PASS if the repaired Validation activity still has its canonical planned-item behavior, manual alternatives and sister-lab routing after reload.

### 7. General regression feedback
Use LabOS normally and report anything missing, confusing, unintentionally removed, slower, or newly desired. You do not need to classify it; ChatGPT will map every item into the established 10-stage framework before any change is made.
