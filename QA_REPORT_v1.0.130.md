# QA report — LabOS REV 1.0.130

Focus: Daily Operations / My Work role ownership, active-lab isolation, decision authorization and same-lab load balancing.

## Results

- JavaScript syntax checks: **PASS** for core, services, repository, demo-data and app assets.
- Current HTML asset references: **PASS**; all REV 1.0.130 local assets resolve in the package.
- Runtime service harness against seeded multi-lab demo state: **PASS**.
- Quality Engineer sees no Staffing / Capacity improvement actions: **PASS**.
- Prototype Technician, Process Engineer and Metrology roles do not receive planner/manager proposals: **PASS**.
- Prototype Lab Planner receives only Staffing proposals: **PASS**.
- Lab Manager receives governed Staffing oversight and Capacity actions: **PASS**.
- Administrator receives all actionable proposals for the active lab only: **PASS**.
- Generated proposals and every suggested target stay inside the active lab: **PASS**.
- Unauthorized implementation is blocked by the service even if a stale proposal ID is invoked directly: **PASS**.
- Daily review state is tracked independently per lab and a second-lab review does not overwrite the first lab's daily snapshot: **PASS**.

## Runtime harness output

```text
site LAB-NL NL-TW all 2 Staffing:lab_planner:LAB-NL,Staffing:lab_planner:LAB-NL
quality 0 
lab_planner 2 Staffing,Staffing
lab_manager 2 Staffing,Staffing
technician 0 
administrator 2 Staffing,Staffing
process_engineer 0 
metrology 0 
PASS Quality Engineer receives no planner/manager improvement actions
PASS Prototype Technician receives no planner/manager improvement actions
PASS Process Engineer receives no planner/manager improvement actions
PASS Metrology receives no planner/manager improvement actions
PASS Lab Planner sees only Staffing proposals
PASS Lab Manager sees only governed management proposals
PASS Administrator sees all proposals for active lab
PASS All generated proposals are active-lab scoped
PASS All proposed booking moves remain in active lab
PASS Staff target Sofia Bakker remains same lab
PASS Staff target Nora Dekker remains same lab
PASS Staff target Sofia Bakker remains same lab
PASS Unauthorized Quality Engineer cannot implement a staffing proposal
PASS Lab Planner authorized for staffing proposal
PASS Daily review stamped with active lab
PASS Daily review completion tracked per lab
PASS Second lab receives independent daily review
PASS First lab daily review retained after reviewing another lab
```

## Planning-situation revocation regression

Additional checks for the capacity-release patch:

- JavaScript syntax checks after patch: **PASS** for core, services, repository, demo-data and app assets.
- Local `index.html` asset references: **PASS**.
- Same-lab booking is blocked by a site-scoped lab closure: **PASS**.
- Sister-lab booking is not blocked by that closure: **PASS**.
- Full revocation is classified as a relaxation: **PASS**.
- Shortening a closure is classified as a relaxation: **PASS**.
- Shortening releases only bookings that fall outside the new blocked interval: **PASS**.
- Metadata-only edit is detected without planning churn: **PASS**.
- Moving the constraint to another lab is not misclassified as a relaxation: **PASS**.
- Revocation applies with synthetic unrelated blocker state present: **PASS**.
- Revoke-only path performs no portfolio optimizer call: **PASS**.
- Stale pending planning-situation retry is cleared: **PASS**.
- Revocation audit record is created: **PASS**.
- Revoke action no longer routes through the blocking `previewPlanningSituationChange` transaction: **PASS**.

Browser automation could not be used in the build container because local/file navigation is administrator-blocked in the installed Chromium policy, so the regression was exercised through source-backed Node harnesses plus static asset/syntax checks.


## Corrective hotfix QA — My Work role scoping
- **PASS — JavaScript syntax:** `node --check` on `labos-app-1.0.130.js` and `labos-services-1.0.130.js`.
- **PASS — training governance unit test:** scheduling a Training resource-care item whose competency technical owner is Noah Visser now creates both booking and action with operational owner Lucas Vos / `lab_manager`, while retaining `technicalOwner = Noah Visser`.
- **PASS — calibration governance unit test:** scheduling Calibration creates booking/action owner Daan Mulder / `metrology` with the governed role set.
- **PASS — stale-data migration present:** existing scheduled care bookings/actions are normalized to care-type operational ownership and persisted automatically.
- **PASS — duplicate suppression:** My Work readiness rows skip a care reservation when its governed open action already represents the same `careItemKey`.
- **PASS — Process Engineer scope:** the Process Engineer dashboard no longer contains the generic whole-lab capacity/readiness/potential-project panels; it uses a role-specific process/method work view.
- **PASS — Process Engineer action gate:** non-process resource-care and unrelated personally-named actions are excluded from Process Engineer My Work; process/method/route actions remain eligible.
- **Environment note:** container Chromium is organization-policy blocked from opening local test URLs/files, so browser automation could not be used in this environment. Static syntax and executable service-level ownership tests were completed instead.
