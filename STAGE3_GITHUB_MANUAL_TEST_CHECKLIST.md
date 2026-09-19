# Stage 3 GitHub Pages Manual Test Checklist — TEST 5

Controlled build: **STAGE3-GITHUB-TEST-5**  
Product revision: **1.0.185**

Before testing, hard-refresh or use a private/incognito tab. Confirm:

- header shows **`REV 1.0.185 · S3 TEST`**;
- sidebar footer shows **`Controlled build: STAGE3-GITHUB-TEST-5`**.

## Requested browser checks

### 1. Same planned-item interaction for Prototype and Validation
Tap one planned Prototype operation and one planned Validation activity.

PASS if both open the same style of planned-item window with the same core actions. The title/domain label may differ, but the interaction model must not fall back to a separate Validation-only window.

### 2. Green / Yellow / Red manual alternatives in both domains
For both the Prototype operation and Validation activity, choose **Move / replan in swimlane**.

PASS if the current swimlane remains visible and feasible alternatives progressively appear using the same Green/Yellow/Red semantics. Report if either domain shows no Green option where you would reasonably expect one, or if the interaction takes materially longer in Validation.

### 3. Prototype single-test sister-lab alternatives
Tap a planned Prototype operation and choose **Route only this test/activity to a sister lab**.

PASS if feasible sister labs are shown when available and the action creates a governed request rather than silently changing execution ownership.

### 4. Validation single-activity sister-lab alternatives
Repeat the previous test for a planned Validation activity.

PASS if the same interaction exposes feasible sister-lab alternatives where available and uses the governed request/receiver flow. Validation leg/subflow routing must remain available elsewhere where applicable.

### 5. Receiver decision and survival through later planning
Create one partial sister-lab request, accept it from the receiving lab, then run AUTO/replan on the relevant programme/portfolio.

PASS if the accepted partial assignment remains governed and is not silently returned to the home lab or overwritten by later planning.

### 6. Persisted browser state
Without resetting demo data, perform several planning/network actions (for example request/reject/replan), refresh/reopen the GitHub Pages build, then repeat one Prototype and one Validation manual/network check.

PASS if the common interaction and feasible alternatives still work after prior state mutations/reload.

### 7. General regression pass
Use LabOS normally and report anything missing, confusing, unintentionally removed, slower, or newly desired. You do not need to classify it; ChatGPT will map every item into the established 10-stage framework before any change is made.
