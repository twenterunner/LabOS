# LabOS — Laboratory Operations System

**Current prototype release: REV 1.0.132**  
**Data schema: 35**

LabOS is a static-browser proof of concept for controlled prototype-build and engineering-laboratory operations. It is designed for GitHub Pages deployment and stores the current POC data locally in the browser.

## REV 1.0.132 highlights
### Capacity situations are facts, not prerequisite blockers
- Adding or tightening a vacation, whole-lab closure, equipment outage or similar capacity event now always produces the **best feasible portfolio** around that constraint. A build that cannot obtain a complete schedule is left explicitly **unplanned / at risk** rather than blocking the event itself.
- Calibration, maintenance and training reservations follow the same principle: the reservation is accepted, affected builds are replanned where feasible, and any build that still cannot be placed is surfaced as an unplanned consequence for later recovery.
- Planning-event previews show consequences and retain an explicit accept/cancel decision; they no longer force users through a circular “complete resolution required” loop.

### Build-specific approval blocker corrected
- Pending reused-document / build-specific change approvals are now shown at the actual definition or control step that owns them instead of allowing every earlier step to appear green and then failing at Build Readiness.
- The yellow resolution action opens the real consolidated build-change sign-off package, with the correct signers and executable sign-off controls, rather than a generic approvals view that cannot clear the blocker.

## REV 1.0.130 highlights
### Planning-situation revocation and capacity release
- Revoking a lab closure, person absence, equipment outage/shutdown or other temporary capacity block is now a **non-blocking capacity release**. Unrelated portfolio blockers can no longer prevent the constraint from being removed.
- Shortening an existing event is treated the same way when the new blocked interval is a strict subset of the old interval.
- Existing accepted bookings are protected: revocation/relaxation does not silently move work back. The user chooses **Revoke/Apply only** or **Revoke/Apply & preview optimization**.
- If optional re-optimization hits unrelated blockers, LabOS clearly states that the constraint change is already live and the current schedule remains unchanged.
- Planning-situation cards and the edit dialog now expose an explicit **Revoke** action. Revoke is distinct from Undo and remains audit-trailed.
- Metadata-only edits (reason/owner/reference/type where the blocking footprint is unchanged) no longer force a portfolio replan.
- Existing planning-event `siteId` is preserved while editing so multi-lab constraints cannot silently move to the currently selected lab.

### Development-time learning
REV 1.0.130 fixes Daily Operations ownership and lab scoping. Executable improvement cards are now generated for the active lab only, explicitly assigned to actionable roles, and filtered by the logged-in role. Quality/technician roles no longer receive Prototype Lab Planner or Lab Manager actions; planners/managers/admins see only the actions they are authorized to execute. Accept/Reject/Defer is re-authorized at action time, and automatic load balancing cannot silently move work to a sister lab. Daily review snapshots are now retained per lab so role/lab switching cannot leave stale cards.


- Fixes the Business Unit upgrade migration: existing demo data upgraded from pre-BU releases is diversified in-place across the controlled BU master data instead of collapsing to Professional Power Tools.
- The repair is deliberately limited to the recognisable 24 pre-populated demo requests; real/user-authored portfolios are never redistributed automatically.
- All three demo labs now contain multiple BU allocations in the default 13-week KPI period.

### One reporting period for KPI
The Lab Performance page has one selected reporting period. Delivery, quality, readiness, capacity/utilization, cost, 5S, replan causes and internal-network utilization are calculated from evidence that falls inside that period. The user can choose the last 13 weeks, 12 months, 8 quarters, one week, one month, or a custom date range.

### Controlled Business Units + allocation
Configuration now contains a dedicated **Business Units** master-data section. Administrators create, rename, activate and deactivate Business Units there. Project Teams no longer type a free-format Business Unit; they select one from the controlled list. Stable Business Unit IDs preserve request/KPI history across renames.

The KPI page contains a pie chart and detail table showing how selected-period lab demand is allocated across those configured Business Units. The chart can be switched between booked lab time and direct resource cost (labour + equipment master rates). Fresh demo data spans Professional Power Tools, Consumer & DIY, Outdoor & Garden, Industrial Solutions and Battery & Energy Systems.

### Reason-coded replanning
Manual replanning always asks why the move is being made. Green/Yellow swimlane moves and the full Manual Planner require a reason category plus explanation. Accepted AUTO-PLAN/portfolio replans also capture the category in addition to their mandatory decision rationale. Task-level changes are retained even when the delivery commitment stays unchanged.

### Manual-move transaction repair
REV 1.0.128 fixes a manual move failure caused by regenerated booking IDs. The transaction now verifies the stable canonical task (`request + step`) against the already validated target and preserves the full integrity/fingerprint checks. It also corrects manual-vs-AUTO-PLAN semantics: manual dates are re-optimizable by default, while an explicit **Protect from AUTO PLAN** control creates a hard scheduling constraint. AUTO PLAN can propose releasing a soft manual delay and shows the original reason before the user accepts the change.

## Deployment
1. Extract the ZIP.
2. Upload **all files from the ZIP root** to the root of the GitHub repository used for GitHub Pages.
3. Keep `index.html` at repository root.
4. Refresh the site. The header must show **REV 1.0.132**.

If the live site still shows REV 1.0.122/1.0.124, it is still serving the older deployment.

## Data and evidence
The current POC uses IndexedDB/local browser persistence and JSON export/import. Quote/invoice evidence attached to Standard Test external sourcing is stored in the browser-local record in this POC. A future shared deployment should move evidence bytes to governed document/object storage while retaining immutable references in the LabOS transactional model.

## Compliance boundary
LabOS supports IATF 16949-aligned controls and audit-ready workflow concepts. Software alone does not make an organisation IATF 16949 certified; customer-specific requirements, product-safety controls, retention rules, approval matrices and controlled organisational procedures must be configured and governed by the deploying organisation.
