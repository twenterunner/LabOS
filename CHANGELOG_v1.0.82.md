# LabOS REV 1.0.82 — change log

## Corrected defects

### 1. Swimlane calendar fields were present in code but not in the active renderer
REV 1.0.80 added month / ISO calendar week / weekday / date and weekend bands to an older `planningSwimlane` implementation. Later REV 1.0.68/1.0.70 renderer overrides remained the effective functions at runtime and replaced that markup. The same override pattern existed for the build-workspace swimlane.

REV 1.0.82 changes the final active portfolio/resource renderer and the final active build-workspace renderer. Every rendered day now contains **month + CW + weekday + date + AM/PM**. When weekend planning is disabled, Saturday and Sunday are shaded in the header and through the complete lane tracks. Existing `− / Fit / +` zoom enhancement remains active. An unplanned build now still renders a 14-day working-calendar skeleton when the swimlane is expanded, so month/CW/weekend context is visible before the first schedule exists.

### 2. Material-resolution button was a self-link
The Material workflow blocker labelled **Open material resolution** used `data-workspace-tab="materials"`. The user was already on the Materials section, so the button could only select the same view. It had no executable resolution logic.

REV 1.0.82 replaces that self-link with a material root-cause resolver. For **Lab supplied** material it distinguishes:

- exact stock exists but is not reserved → reserve exact part/revision lots;
- true stock shortage → reserve any exact stock first and create a controlled incoming supply plan only for the uncovered quantity;
- incoming supply already planned → receive it into actual lot/batch inventory;
- reserved physical stock → issue it to the build.

A future supply plan makes the request planning-feasible but does **not** falsely make Build Readiness complete. Physical receipt/reservation and issue are still required before `buildReady=true`.

## Data semantics
- `request.materialReplenishments[]` stores controlled incoming lab-supply intent with requirement ID, quantity, expected date, owner, reference and status.
- Incoming plans are considered by `materialPlanningAssessment()` when deriving planning feasibility and earliest material date.
- Physical Build Readiness continues to depend on actual issued quantities.
- Exact-stock reservation decrements available lot quantity to prevent the same stock being reserved twice.
- A partial receipt keeps the unreceived remainder as an active incoming plan.

## Verification
See `VERIFICATION_v1.0.82.md`, `ROOT_CAUSE_PROOF_v1.0.82.md` and `VERIFICATION_RESULTS_v1.0.82.txt`.
