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
