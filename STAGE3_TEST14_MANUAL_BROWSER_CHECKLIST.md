# Stage 3 TEST-14 Manual Browser Checklist

Deploy the exact TEST-14 ZIP over the existing LabOS site **without clearing IndexedDB/site data**. Do not Reset Demo Data and do not use a fresh browser profile.

Record PASS / FAIL / NOT TESTED for each item.

## A. Validation Green governance

- Open a planned Validation activity and choose Move / Replan.
- Tap a Green alternative different from the current booking.
- Verify a rationale/formal-acceptance modal opens **before any persistence**.
- Verify empty rationale cannot accept.
- Enter a rationale and Apply.
- Verify exactly the intended replan commits and survives browser refresh/reopen.

## B. Validation sequence preservation

After replanning one Validation test:

- verify the **entire Validation test sequence remains present**;
- verify every expected Validation activity still has one active booking;
- downstream tests may move if dependencies/capacity require it, but may not disappear;
- verify predecessor ordering still makes sense after the move.

## C. Validation Yellow governance

- Tap a Yellow alternative.
- Verify selection alone causes no persistence.
- Verify the same rationale/formal-acceptance flow is required.
- Cancel/back and confirm the plan remains unchanged.
- Accept with rationale and verify the move persists once and survives refresh/reopen.

## D. Prototype Green/Yellow regression

- Prototype Green still opens the governed action and commits correctly.
- Prototype Yellow remains confirmation/rationale-gated and commits correctly.
- Both survive browser refresh/reopen.

## E. Planning touch/pan/view ownership

- Green/Yellow controls respond reliably on phone/touch.
- Action taps are not interpreted as pan and do not switch Planning perspective.
- Blank timeline area can still pan horizontally.
- Genuine Overall / Per programme / Per equipment / Per person controls still work.

## F. Active-site Escalation

- Switch active lab between available sites.
- Verify Escalation programme population changes to that active site's canonical Prototype/Validation population.
- Run analysis/review and verify only active-site programmes are affected.
- Cancel review and verify no LIVE planning mutation.

## G. Stale sister-lab proposal revalidation

- Use an expired pending sister-lab request if available.
- Verify governed Refresh / Reject replaces the dead-end expiry loop.
- Preview/Refresh must not create a LIVE SiteAssignment.
- Refresh preserves request identity/scope and creates a fresh validity window.
- A subsequent explicit Accept may complete only if fresh feasibility still passes.

## H. No duplicate state

After manual planning/network tests and a full browser reopen:

- no duplicate active Validation bookings;
- no missing Validation activities;
- no duplicate SiteAssignments;
- accepted task-level sister-lab routing remains task-level;
- programme ownership is not silently replaced by a remote task site.

## I. Build identity

Confirm after startup:

- `REV 1.0.185 · S3 TEST-14`
- `STAGE3-GITHUB-TEST-14`

## Acceptance rule

Any Stage-1/Stage-2/Stage-3 failure keeps Stage 3 OPEN. Do not start Stage 4 and do not create a protected Stage-3 checkpoint until every required TEST-14 manual check passes and the user explicitly accepts Stage 3.
