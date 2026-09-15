# QA Report — LabOS REV 1.0.134

## Scope
Formal sister-lab transfer governance and transfer-flow presentation.

## Automated checks performed

1. JavaScript syntax checks passed for core, demo data, repository, services and app runtime.
2. Whole-build handshake test:
   - generated a feasible NL → DE sister-lab candidate;
   - submitted formal request;
   - verified LIVE execution site did not change before receiver acceptance;
   - switched to receiving lab/receiver role;
   - accepted and revalidated;
   - verified execution moved only after acceptance;
   - verified sender + receiver traceability;
   - verified exactly one accepted transfer record remains for KPI/audit use.
3. Single-operation handshake test:
   - generated a feasible sister-lab operation candidate;
   - submitted a formal operation request;
   - verified LIVE task routing remained unchanged before receiver acceptance;
   - accepted from receiver lab after canonical revalidation;
   - verified routed booking changed only after acceptance;
   - verified no duplicate accepted transfer records.
4. Receiver rejection test:
   - rejected a pending whole-build request from the receiving lab;
   - verified LIVE execution remained at the sending lab.
5. Scenario Lab governance test:
   - verified the service layer refuses direct sister-lab LIVE application and requires the formal sender-request / receiver-acceptance path.
6. Package references checked against the REV 1.0.134 asset names.
7. ZIP integrity checked after packaging.

## Governance assertions

- Pending transfer requests do not count as accepted sister-lab KPI events.
- Receiver rejection/cancellation do not alter LIVE bookings.
- Receiver acceptance is only executable at the receiving active lab by an authorized planning/management role.
- Acceptance re-solves against current capacity; stale feasibility comparisons are not blindly applied.
