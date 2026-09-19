# Stage 3 GitHub Pages Manual Test Checklist — TEST 4

Controlled build: **STAGE3-GITHUB-TEST-4**  
Product revision: **1.0.185**

Before testing, hard-refresh or use a private/incognito tab. Confirm:

- header shows **`REV 1.0.185 · S3 TEST`**;
- sidebar footer shows **`Controlled build: STAGE3-GITHUB-TEST-4`**.

## Requested browser checks

### 1. One canonical Planning experience
Open Planning and switch through **Overall**, **Per programme**, **Per equipment**, and **Per person**.

PASS if the page remains recognisably the same Planning application: same header, key controls, visual language and swim-lane interaction. Only grouping/lane content should change. It must not jump back to the older `Visual Resource Planning` application.

### 2. Manual in-lane replan
In any perspective containing a planned Prototype test/operation, tap the planned item and choose **Move / replan in swimlane**.

PASS if the action responds promptly, the current swim-lane remains visible, and Green/Yellow feasible day options progressively appear across that lane. Red/infeasible conditions must never be silently committed. Selecting an option must use the governed Stage-2 planning commit path.

Please report roughly how long it feels from tapping the test to seeing the task prompt, and from choosing Move/replan to seeing the first planning feedback/options.

### 3. Single-operation sister-lab routing remains available
Tap a planned Prototype operation and verify **Route only this step to a sister lab** is still available alongside the manual replan action. Create a request if convenient and verify it remains governed rather than immediately changing execution ownership.

### 4. Future/potential project overlay
In Planning → Overall, toggle **Show potential projects** off and on. Verify potential work appears as forecast/probability-weighted demand and does not become committed bookings simply by being displayed.

### 5. AUTO PLAN semantics
On the canonical Planning page, verify there is one portfolio AUTO PLAN action covering Prototype + Validation demand. There should not be a competing `PLAN VALIDATION DEMAND` planning authority on this page. If Validation-specific planning appears elsewhere in a workflow, report where you see it.

### 6. General regression pass
Use LabOS normally for several minutes. Report anything missing, confusing, unintentionally removed, slower, or newly desired. You do not need to classify the feedback into a rebuild stage; ChatGPT will map each item into the established 10-stage framework before any change is made.
