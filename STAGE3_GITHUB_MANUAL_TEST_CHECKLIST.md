# Stage 3 GitHub Pages Manual Test Checklist

Deploy the contents of the ZIP so that `index.html` is at the GitHub Pages root. Use a hard refresh/private window after deployment.

## Boot / persistence
- App loads with no visible boot error.
- Refresh the page after a small controlled change and confirm state persists.
- Reset Demo Data works.

## Protected planning smoke
- Prototype planning opens and AUTO planning still works.
- Validation planning opens and uses the same planning view/kernel.
- Manual planning still offers feasible/blocked alternatives.

## Whole sister-lab governance
- Compare a Prototype programme with sister labs.
- Request another internal lab: LIVE ownership/routing must **not** change immediately.
- Open/switch to the receiving lab and accept the request.
- Only after acceptance should whole-programme `executionSiteId` move; `homeSiteId` remains unchanged.
- Reject and cancel paths leave LIVE planning unchanged.

## Partial routing
- Request one Prototype operation at a sister lab and confirm programme ownership stays local.
- Accept it at the receiving lab and confirm only that operation is routed remotely.
- For Validation, test both an activity request and a leg/subflow request.

## Scenario Lab governance
- For a sister-lab Scenario Lab result, the action must say/request a governed sister-lab request rather than directly applying LIVE.
- Sending the Scenario Lab sister request must leave LIVE routing unchanged pending receiver acceptance.

## External execution governance
- Open an external Scenario Lab option.
- It must **not** offer direct LIVE application.
- Create an external request with quote reference, validity date and costs.
- Confirm My Work shows a pending external commercial approval.
- Approve with PO/approval reference.
- Confirm an ExternalOrder is created and the pending approval disappears.
- Internal sister-lab transfer records and external supplier records must remain conceptually separate.

## Receiver workload / KPI smoke
- Requested/UnderReview/Accepted/InExecution sister-lab work appears in the receiving lab workflow as appropriate.
- Network KPI views still render without errors and include canonical transfer data.

## Result
Record PASS/FAIL and screenshots for any failure. A failure means Stage 3 remains open; do not begin Stage 4.
