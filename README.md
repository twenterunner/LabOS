## REV 1.0.42 · Formal Control Plan approval fix

This revision fixes the broken formal Control Plan approval action and unifies approval behavior across the fixed Guided Build Workflow dock, the build Control Plan workspace, and the Quality Workbench. Build-specific Process Engineering / Quality / Product Safety delta reviews remain separate from the final Control Plan approval. Separation of duties is enforced consistently: the Control Plan owner cannot formally approve the same revision when separation of duties is enabled; an independent authorised Quality Engineer or Approver / Reviewer can. Schema remains 21; no data reset is required.

All v1.0.41 process-evidence, readiness, reporting, planning and data-export functionality is retained.
