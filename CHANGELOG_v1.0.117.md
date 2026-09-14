# LabOS REV 1.0.117 — change log

## Network execution and planning
- Added governed **single-test sister-lab execution**. A test may be routed to another internal lab while the build remains owned by its home/execution lab.
- Sister-lab test comparison uses the canonical planner, includes transfer lead time, replans downstream work, and runs invariant + whole-portfolio planning-integrity gates before an option can be accepted.
- Added per-task site traceability (`taskSiteOverridesV1170`, task transfer history, network-transfer scope) and separate network KPI counting for sister-lab builds vs sister-lab tests.
- Corrected site isolation of lab-wide closure/outage events so an event at one lab does not silently block unrelated sister labs.
- Extended the site-isolated orchestration so builds containing a governed remote test can still be auto/manual replanned against the full network resource model.

## Guided workflow / dead-end prevention
- Added an explicit workflow-liveness guidance model for every non-final lifecycle gate.
- Final NEXT ACTION fallback now points to a concrete controlled action/section or the correct role instead of leaving a passive/scroll-only dead end.
- Structural equipment and skill failures retain diagnostic evidence and guided recovery options.

## Demo portfolio
- Diversified all 24 seeded demo builds across material, calibration, maintenance, staff absence, lab closure, equipment outage, skill/training, Control Plan/Product Safety, route delta, quality disposition, long-horizon load, priority/capacity and sister-lab cases.
- Added one intentional structural home-lab capability case: `P26-1023` requires a specialist vibrodynamic test unavailable in Detroit and available in Stuttgart, specifically to demonstrate single-test sister-lab routing.
- Ordinary receipt/assembly/admin operations are not artificially assigned equipment merely to manufacture blockers.

## Qualification
- 36 fresh end-to-end A/B/C lifecycle builds (12 product families × A/B/C) reached CLOSED.
- All six ordered internal-lab whole-build transfer directions were exercised.
- 43 canonical active tests were compared against both sister labs (86 test/site alternatives).
- Manual replanning, downstream resequencing, long finite closures, structural equipment/skill faults, site isolation and whole-portfolio integrity were fault-injected and checked.

Schema remains 35; no reset is required.
