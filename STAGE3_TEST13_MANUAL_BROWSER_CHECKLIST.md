# LabOS Stage 3 — TEST-13 Manual Browser Acceptance Checklist

**Controlled build:** `STAGE3-GITHUB-TEST-13`  
**Visible identity:** `REV 1.0.185 · S3 TEST-13`  
**Test condition:** deploy over the existing GitHub Pages/site while preserving the existing IndexedDB/site data. Do **not** Reset Demo Data, clear IndexedDB/site data, or switch to a fresh browser profile.

Record each item as PASS / FAIL / NOT TESTED and add the exact programme/activity/site used where useful.

## A. Build identity

After full startup confirm:

- visible badge is `REV 1.0.185 · S3 TEST-13`;
- controlled build is `STAGE3-GITHUB-TEST-13`.

## B. Prototype Green manual replan

Open a planned Prototype booking → Move / replan in swimlane → select a Green alternative different from the current booking → provide the required reason → commit.

Verify:

- the Green action responds to tap/click and does **not** merely flash/redraw the screen;
- required governance/reason is reached;
- the intended live booking moves to the selected date/resource;
- the swimlane refreshes;
- browser refresh preserves the committed move.

## C. Prototype Yellow manual replan

Select a Yellow Prototype alternative.

Verify:

- merely selecting Yellow does not mutate/persist the booking;
- controlled reason/confirmation is required;
- cancel/back leaves the original booking unchanged;
- explicit acceptance commits the intended date/resource;
- browser refresh/reopen preserves the committed move.

## D. Validation Green manual replan

Repeat Green manual replanning on a Validation activity.

Verify:

- the Green action responds and does not merely flash/redraw;
- the intended Validation booking moves to the selected date/resource;
- the swimlane refreshes;
- browser refresh/reopen preserves the move.

## E. Validation Yellow manual replan

Select a Yellow Validation alternative.

Verify:

- selection alone causes no persistence;
- controlled Yellow confirmation is required;
- cancel/back leaves the booking unchanged;
- explicit acceptance commits the selected date/resource;
- refresh/reopen preserves it.

## F. Planning touch/pan interaction

On phone/touch, and desktop if available, verify:

- Green and Yellow actions respond reliably;
- action taps are not interpreted as timeline pan or Planning-view changes;
- blank timeline space can still be dragged horizontally;
- Overall / Per programme / Per equipment / Per person view controls still work.

## G. Active-site Escalation population

Switch Active lab between available labs such as LAB-NL, LAB-DE and LAB-US and open Escalation Mode each time.

Verify:

- the project/programme population changes with the active laboratory;
- you do not see the same global programme list for every site;
- both Prototype and Validation programmes belonging to the selected site may appear;
- switching back restores that site's own population.

## H. Escalation analysis/review scope

Run an Escalation analysis for one active-site programme.

Verify:

- the selected target belongs to the active site;
- before/after impact lists/review are restricted to programmes in that active site's canonical population;
- programmes belonging only to another site are not silently resequenced by the active-site Escalation transaction;
- cancelling review makes no LIVE planning change.

## I. Expired sister-lab proposal revalidation

Use an expired pending sister-lab request if one is available (the historical persisted P26-1009 case may still be suitable).

Verify:

- expired proposal does not end in an unrecoverable `Network transfer request has expired` loop;
- the receiver gets a governed Refresh / Reject revalidation path;
- preview/Refresh does not create a LIVE SiteAssignment;
- Refresh preserves the same formal request/scope and creates a fresh proposal validity window;
- if the refreshed scope is feasible, a subsequent explicit Accept can complete;
- if no longer feasible, the controlled result explains the blocker and permits rejection rather than silently accepting stale assumptions.

## J. Sister-lab routing/persistence regression

For an already accepted task/activity-level sister-lab assignment:

- manually replan it;
- confirm the task remains assigned to the accepted sister lab;
- confirm programme home/execution ownership is not silently replaced by a task-level remote site;
- refresh/reopen the browser;
- confirm exactly one live SiteAssignment remains.

## K. AUTO/replan and full browser reopen

After the tests above:

- run AUTO/replan;
- confirm accepted task-level sister-lab routing remains intact;
- genuinely blocked work remains protected;
- feasible independent proposals remain reviewable;
- fully close/reopen the browser without clearing IndexedDB;
- confirm accepted Prototype/Validation manual moves and network assignments remain represented exactly once.

## Acceptance rule

Any failed Stage-1/Stage-2/Stage-3 behavior keeps Stage 3 open and must be reproduced/fixed at the generic architectural root cause. Do not create a Stage-3 RC/checkpoint and do not start Stage 4 until all required browser acceptance items pass and the user explicitly accepts Stage 3.
