# LabOS — Laboratory Operations System

**Current prototype release: REV 1.0.128**  
**Data schema: 35**

LabOS is a static-browser proof of concept for controlled prototype-build and engineering-laboratory operations. It is designed for GitHub Pages deployment and stores the current POC data locally in the browser.

## REV 1.0.128 highlights

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
4. Refresh the site. The header must show **REV 1.0.128**.

If the live site still shows REV 1.0.122/1.0.124, it is still serving the older deployment.

## Data and evidence
The current POC uses IndexedDB/local browser persistence and JSON export/import. Quote/invoice evidence attached to Standard Test external sourcing is stored in the browser-local record in this POC. A future shared deployment should move evidence bytes to governed document/object storage while retaining immutable references in the LabOS transactional model.

## Compliance boundary
LabOS supports IATF 16949-aligned controls and audit-ready workflow concepts. Software alone does not make an organisation IATF 16949 certified; customer-specific requirements, product-safety controls, retention rules, approval matrices and controlled organisational procedures must be configured and governed by the deploying organisation.
