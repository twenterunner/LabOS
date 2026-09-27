# LabOS Stage-3 Network My Work Inbox Correction

**Date:** 2026-09-27  
**Product revision:** `REV 1.0.185`  
**Candidate:** `STAGE3-NETWORK-INBOX-FIX-TEST1`

## Reproduced failure

For a receiving laboratory with 12 active canonical network-transfer records, the My Work section badge showed `12 active` but the UI rendered only six cards. A newly submitted `P26-1008` request could therefore exist canonically and trigger the equivalent-pending-request guard on a second submission while remaining invisible in My Work.

Root cause in `labos-app-1.0.185.js`:

- the final Stage-3 canonical receiving-lab My Work wrapper calculated the full active row set;
- the badge used `rows.length`;
- the cards used `rows.slice(0,6)`.

This reintroduced a top-six truncation after the broader My Work queue had previously been corrected to show all mandatory work.

## Narrow correction

The final Stage-3 receiving-lab network My Work section now:

1. renders every active receiver record (`Requested`, `UnderReview`, `Accepted`, `InExecution`);
2. prioritizes `Requested`, then `UnderReview`, then `Accepted`, then `InExecution`;
3. sorts within a state newest-first so a newly submitted receiver decision cannot be hidden behind older follow-up items;
4. retains canonical `networkTransfers` / `NetworkRecordAdapter` as the only source of truth;
5. does not change duplicate-request protection, transfer governance, planning, persistence, or acceptance semantics.

## Regression evidence

`qa/stage3-mywork-network-inbox-tests.js`:

- 12 active receiver records -> 12 rendered network cards: PASS;
- newest pending `P26-1008` appears first: PASS;
- equivalent pending `P26-1008` remains duplicate-protected: PASS;
- final Stage-3 My Work source contains no top-six slice: PASS.

Stage-2 predecessor-anchor regression: 2/2 PASS.

This is a controlled Stage-3 UI/work-queue regression correction candidate. It does not constitute formal re-acceptance until browser-tested by the user.
