# ProtoLab OS REV 1.0.24 Verification

REV 1.0.24 was verified against the current application contract before packaging.

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
