# Stage 3 GitHub Pages Manual Test Checklist — TEST 3

Deploy the ZIP contents so `index.html` is at the GitHub Pages root. Use a hard refresh or private/incognito window after deployment.

## 1. Build identification
- Header must show **`REV 1.0.185 · S3 TEST`**.
- Sidebar footer must show **`Controlled build: STAGE3-GITHUB-TEST-3`**.
- Browser title must read **`LabOS — REV 1.0.185 · STAGE 3 TEST`**.
- If any identifier is wrong, stop: the intended checkpoint is not running.

## 2. Requested sister-lab work in My Work — repaired in TEST 3
- From `LAB-NL`, submit a whole-programme sister-lab request to another internal lab such as `LAB-DE`.
- Switch the active lab/context to the receiving lab.
- Open **My Work / Action Centre**.
- Confirm the new **Requested** transfer appears as an actionable receiver item with **Review request**.
- Accept one request and reject another if convenient; confirm the item/status updates appropriately.

## 3. Single-test / single-operation sister-lab routing — repaired in TEST 3
- Open Planning and select a **planned Prototype test/operation bar**.
- Open its manual/replan options.
- Confirm **`Route only this test / operation to sister lab`** is available.
- Compare/select a sister lab and submit the request.
- Before acceptance, confirm programme ownership has not silently changed.
- At the receiving lab, accept the request and confirm only that selected operation is routed remotely.
- Run AUTO/replan again and confirm the accepted partial assignment is retained.

## 4. Future / potential projects in Overall Planning — restored in TEST 3
- Open Planning → **Overall**.
- Confirm potential/future-project lanes are visible and clearly marked **POTENTIAL**.
- Confirm probability (for example `%`) and **probability-weighted hours** are shown.
- Toggle **Show potential projects** off and on.
- Confirm this only changes visibility; it must not delete the underlying potential project data.

## 5. Planning perspectives — restored/verified in TEST 3
Switch through all four planning views and confirm each genuinely changes the swim-lane perspective:
- **Overall** — programme swim lanes, including potential projects when enabled.
- **Per programme** — task/test-oriented programme detail lanes.
- **Per equipment** — equipment loading lanes.
- **Per person** — people/qualification loading lanes.

## 6. Core Stage-3 whole-programme governance
- Compare a Prototype programme with sister labs and request another internal lab.
- Confirm the request does **not** immediately change LIVE ownership/routing.
- Accept at the receiving lab; only then should whole-programme `executionSiteId` move while `homeSiteId` remains unchanged.
- Reject/cancel paths should leave LIVE planning unchanged.

## 7. Validation partial routing
- For Validation, verify an activity/test or leg/subflow can be requested at a sister lab through the governed request/accept flow.
- Confirm Validation does not directly commit another lab without acceptance.

## 8. Scenario / external governance smoke
- Sister-lab Scenario actions must create governed internal requests, not direct LIVE moves.
- External Scenario options must create an external request requiring commercial approval; they must not directly become LIVE/approved.
- Pending external commercial work should appear in My Work, and approval should create the distinct external order.

## 9. Normal-use regression observation
Use LabOS normally for several minutes. Report anything missing, confusing, broken, unexpectedly removed, or worse than an earlier build—even if it is outside Stage 3. It will be classified into the controlled 10-stage framework rather than patched ad hoc.

## Result
Record PASS/FAIL for the relevant items and attach screenshots for failures. Any genuine failure keeps Stage 3 open. Do not begin Stage 4 until Stage 3 is explicitly accepted.
