# LabOS REV 1.0.59 — governed Gage R&R, 5S KPI trend, closed-loop audit resolution and sign-off stability

## What changed

- Gage R&R now generates an explicit **APPROVE / REJECT system recommendation** while retaining the authorised reviewer as the final decision-maker. The default recommendation uses conservative AIAG-style automotive acceptance guidance and flags application-dependent 10–30% results rather than silently treating them as approved.
- Calculated crossed studies are checked against a typical 10-part, 2–3-operator, 2–3-repeat design for the automatic recommendation. Uploaded studies retain their controlled document and require the reviewer to verify design/evidence. Customer-specific requirements and intended use take precedence over the default guide.
- Only an explicit human Approve decision is decision-ready for downstream measurement assurance. A technical rejection remains retained and visible rather than being represented as an approved MSA record.
- Management → Lab Performance now includes 5S current condition, pillar performance, open corrective actions, zone status and time-window trend from real 5S audit records.
- Audit Readiness calibration blockers now give the exact resolution chain instead of routing only to scheduling. LabOS distinguishes scheduled work, certificate evidence, pending certificate approval and cleared readiness.
- The resource-care confirmation message now states that scheduling reserves work but does not itself satisfy readiness evidence.
- Audit evidence-pack mobile layout and print/PDF CSS have been reworked so certificate links, tables, foldouts and footer actions no longer clip or fall off the page.
- Release sign-off buttons bind to the exact pending approval-record IDs shown in the package, eliminating the stale role/person grouping lookup that could report “Signer package is no longer available” after tapping a visible signer.

## Verification

REV 1.0.59 adds focused regression checks for Gage R&R thresholds and human override governance, 5S KPI/trend derivation, calibration-resolution state, audit evidence print styling, stable release-signoff record binding and retained core/repository behavior. See `VERIFICATION.md`.

---

# LabOS REV 1.0.58 — streamlined sign-off packages and explicit ownership

## Approval simplification
REV 1.0.58 reduces approval fatigue without weakening governance. LabOS now presents approvals as **decision packages** rather than one visible tile per underlying approval record. Repeated items owned by the same signer at the same decision point are consolidated into one sign-off action, while the underlying records and audit trail are retained. Distinct independent roles are never silently collapsed.

- Build-specific route / Work Instruction / Control Plan deltas are grouped into one definition sign-off package by signer.
- Release approvals are shown in one release package with explicit progress such as `1/3 signers complete`.
- When more than one person or role must sign, every required signer is shown by name/role, with covered scope and signed/pending status.
- The legacy generic **Build Readiness approval** is removed from user-facing approval queues because readiness is already an evidence gate. Genuine Product Safety or explicitly configured independent readiness decisions remain.
- One signer action can approve that signer's related items in the package, but separate independent roles still require their own signatures.

## Next action and owner everywhere
Top-level workspaces now receive a compact role-aware **Next action / Next sign-off** strip with the action, owner, context and a direct route. The guided build workspace keeps its fixed workflow cockpit and now explicitly labels the current-step owner, sign-off state, and the owner of the next workflow step. When several signers remain, the workflow states how many remain and names the required roles/persons instead of saying only `approval pending`.

## Governance principle
The UI is intentionally simpler than the audit model: **one visible decision package, one sign-off per required signer, all underlying evidence retained**. This avoids click-heavy duplicate approvals while preserving separation of duties and traceability.

## Verification
REV 1.0.58 adds focused regression coverage for package consolidation, multi-signer visibility, duplicate Build Readiness suppression, owner/next-action guidance, Quality sign-off consolidation and audit preservation. See `VERIFICATION.md`.

---

# LabOS REV 1.0.57 — contextual MSA, automatic daily review and mobile navigation

## Changes

- Replan reason/explanation is pre-populated from the planning situation, request change or active constraint that caused the forecast movement; selecting a linked planning situation refreshes the explanation.
- Capability & SPC has been removed from the Quality workspace and from the legacy navigation redirect.
- MSA / Gage R&R is now a first-class controlled evidence workflow: upload an existing study or run a guided crossed/balanced Gage R&R.
- MSA studies retain study date, raw observations or uploaded document, technical conclusion, formal approval and explicit links to process, Standard Test and gage/equipment.
- Process, Standard Test and equipment views show linked MSA studies and guide the user to run/upload one when none exists.
- Controlled setup governance was rebuilt as responsive cards. Names/IDs no longer concatenate on narrow Android screens; each process/test/equipment is directly tappable.
- Daily Operations Check continues to run on application start and now rechecks automatically when the app becomes active/focused on a new calendar day, with manual rerun always available.
- Page subsection navigation is made reliably sticky below the fixed LabOS header on long non-workspace pages.
- The Lessons shortcut was removed from the primary build command area and local jump menu. Lessons remain a single controlled workbench in the late handover/closeout workflow, with automatic proposals plus manual/hindsight capture.

## Data migration

Schema 29 normalizes existing Gage R&R records with a study date, source type, Standard Test link field, technical conclusion and evidence metadata while preserving all existing study data.

## Verification

See `VERIFICATION.md` and `VERIFICATION_RESULTS_v1.0.57.json` in this package for the executed checks.
