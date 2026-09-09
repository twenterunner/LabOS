# LabOS REV 1.0.42 Verification

REV 1.0.42 fixes formal Control Plan approval and separation-of-duties consistency. Schema remains 21.

Verification covers:
- formal `approveCp()` action exists and calls `ControlPlanService.approve()`;
- top Guided Workflow approval dock uses the same eligibility logic as the Quality Workbench;
- build-specific change reviews are clearly separated from formal Control Plan approval;
- self-approval is blocked when separation of duties is enabled;
- an independent authorised Quality Engineer can approve where eligible;
- an independent Approver / Reviewer can approve;
- approved status updates the Guided Build Workflow;
- prior domain, repository, UI and static package checks remain green.
