## REV 1.0.28 — persisted-browser archive repair

Schema 14 re-runs archived-demo installation for already-upgraded browser data. Existing active work is preserved; three completed demo builds are added/normalized under Prototype Requests → Archived. A visible fallback button is shown when a recognized demo still has zero archived builds.

# ProtoLab OS REV 1.0.25 Verification

REV 1.0.25 was verified against the current application contract before packaging.

## Current regression suites

- `node verification-v122-node.js` — **14/14 passed**
- `node verification-node.js` — **46/46 passed**
- `node verification-ui-node.js` — **23/23 passed**
- `python verification-static.py` — **31/31 passed**
- `node verification-repository-node.js` — **6/6 passed**
- `node verification-v123-node.js` — **8/8 passed**

**Total: 128 passed, 0 failed.**

REV 1.0.24 coverage additionally includes:
- competency catalogue edit controls and skills-manage permission gating;
- immutable competency IDs while editable qualification rules are persisted and audited;
- staff competency issue/renew/revoke lifecycle;
- certificate validity derived from the edited competency rule without retroactively rewriting historical certificates.

REV 1.0.23 coverage includes:
- hard planning constraints for vacation, staff absence, equipment outage/shutdown and lab-wide closure;
- immutable original commitment plus reason-coded replan history and actual delivery comparison;
- replan root-cause and commitment-performance KPIs;
- app revision 1.0.23 / schema 10 and repository migration;
- optional BOM/build consumables and cost roll-up;
- cost on potential projects;
- visual/action-first dashboard;
- searchable active/archive Prototype Requests with report and Route Traveller actions;
- one planning date header row shared by all swimlanes;
- green ✓ / yellow ● / red ✕ workflow semantics;
- Characterisation and Build Report rendering without the previous missing-chart exception;
- Equipment/Calibration, Management KPIs, request workspace and all other primary navigation views render without exceptions;
- delivered requests become archived on close;
- BOM editor exposes component/consumable type, unit cost and waste;
- exact BOM material/revision readiness rules remain intact;
- no external runtime dependencies and relative GitHub Pages-safe assets.


REV 1.0.25 coverage additionally includes:
- completed/archived demo builds with approved controlled reports;
- build-report approval-to-final control and exclusion of cost from Build Report;
- test-report measurement/specification/Cpk/yield-loss analytics;
- proposal-first AUTO-PLAN / portfolio optimization with Accept / Reject;
- once-per-day operational improvement review.

## REV 1.0.26 addendum

- Sample evidence model supports per-sample description, structured data and multiple locally stored/compressed photos.
- Build Report includes only evidence explicitly selected for report inclusion.
- FINAL Build Report approval is invalidated and the report revision advances when sample evidence or sample/serial labels change.
- Schema 11 → 12 migration initializes sample evidence fields without changing permanent Lab Sample IDs.
- Dedicated REV 1.0.26 regression suite: 10/10 passed; combined current regression set: 143/143 passed, plus JavaScript syntax checks.

## REV 1.0.27 addendum

- Schema 12 → 13 migration repairs duplicate permanent Lab Sample IDs and preserves linked evidence.
- Archive-demo injection uses natural traceability keys and cannot create a duplicate Lab Sample ID when an equivalent sample already exists under a different internal row ID.
- Existing demo recognition no longer depends only on the historical `dataVersion` string.
- Actual v1.0.24 demo snapshot migration verified to produce exactly three archived examples, unique Lab Sample IDs, unique nonblank formal serials and zero invariant errors.
- Current selected regression set: **150 passed / 0 failed**, plus JavaScript syntax checks and ZIP integrity.

