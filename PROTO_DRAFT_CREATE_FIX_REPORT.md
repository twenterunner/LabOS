# LabOS Prototype Create Draft correction — TEST-1

Build identity: `REV 1.0.185 · PROTO DRAFT CREATE FIX TEST-1`

## Defect reproduced

The Prototype request wizard rendered a **Create draft** button and bound a click handler, but a newly created request did not receive canonical laboratory ownership. `StateTransactionService.adopt()` therefore rejected the state with:

- `<request>: homeSiteId is required`
- `<request>: executionSiteId is required`

The UI handler only caught `RequestService.create()` errors, not persistence failures, so the rejected transaction appeared to the user as a no-op.

## Narrow correction

1. `RequestService.create()` now calls the existing Stage-1 canonical ownership service at creation:
   `LabOwnership.assignAtCreation(state, request, {domain:'prototype'})`.
2. The wizard's **Create draft** handler now includes creation, flowdown and persistence in one `try/catch`, so any future transaction failure is surfaced to the user instead of silently appearing to do nothing.
3. Product revision remains `1.0.185`; only the controlled test-build identifier changes.

## Verification

### Focused Node regression

`node qa/proto-draft-create-fix-tests.js`

Result: **3 PASS / 0 FAIL**

Verified:
- canonical `homeSiteId` assigned;
- canonical `executionSiteId` assigned;
- zero Stage-1 canonical issues for the new draft;
- transaction/persistence commit succeeds.

### Full browser wizard smoke test

Chromium smoke test executed against the packaged runtime by inlining the same deployment scripts into a browser page (the environment blocks direct localhost/file navigation).

Result:
- request count `32 → 33`;
- created request `P26-1205`;
- status `DRAFT REQUEST`;
- `homeSiteId = LAB-NL`;
- `executionSiteId = LAB-NL`;
- canonical issues `[]`;
- modal closed after creation;
- toast shown: `Draft prototype request created.`;
- no browser console/page errors from the create-draft action.

## Manual browser check

1. Open **Prototype Builds** or the Prototype dashboard.
2. Click **+ New prototype request**.
3. Complete the six wizard steps.
4. Click **Create draft**.
5. Expected: modal closes, the new `DRAFT REQUEST` opens, and the success toast appears.
6. Refresh the browser and confirm the draft is still present.
