# LabOS REV 1.0.92 — lean guided build control, governed Control Plans and canonical planning capacity

## Workflow / UI
- Removed the redundant per-page **PROTOTYPE BUILD CONTROL** command tile. The sticky workflow cockpit is now the single navigation/status surface.
- Removed duplicate body-level **NEXT GUIDED ACTION** cards and `Next · …` buttons where the sticky cockpit already provides the next action.
- The sticky cockpit now shows **Requested delivery**, **Original commitment**, **Current commitment**, and **Latest forecast** alongside overall workflow progress.
- The controlled workflow now places **Control Plan selection / definition / approval before Resource plan & committed timing**.

## Control Plan governance
- New requests retain the REV 1.0.91 choice to select an approved Control Plan assigned/compatible with the product or explicitly defer selection/definition.
- **A-samples now require a Control Plan and Quality Engineering approval.**
- Edited/build-specific Control Plans require Quality Engineering approval. Once approved, the revision is promoted into the reusable product Control Plan portfolio while retaining source-build traceability.
- Product-linked approved Control Plans are included in the request selection candidate set.

## Assurance naming / matrix
- User-facing assurance convention is now **Internal experimental · A-samples · B-samples · C-samples**. Internal profile IDs remain stable for backward compatibility.
- The fold-out control matrix now includes a bold **Required / generated deliverables & documents** row for every level.

## Planning / KPI consistency
- Root cause of the >500% style KPI mismatch was a competing legacy capacity basis: management Forward Demand capacity counted only equipment `ready today`, while the planner used the controlled planning-capability / projected-readiness model. Management equipment capacity now uses the same canonical planning-capable resource population as scheduling.
- The previously hidden 4 h final review/release/handover allowance is now an explicit planning booking. The planning window, sticky swimlane and forecast therefore consume the same complete booking sequence instead of adding an invisible tail after the last displayed task.
- The canonical capacity pass is deliberately lightweight and the redundant workspace command rendering is removed, reducing avoidable work around planning/workspace renders without weakening final planner integrity checks.

## Archive fix
- Abort/archive reason capture is now scoped to the active archive modal with a unique field selector. Entered text is read from the active modal before validation, preventing the false “record a clear archive reason” loop.
