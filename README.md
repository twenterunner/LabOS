# LabOS Prototype Build POC — REV 1.0.122

Static HTML/CSS/JavaScript proof-of-concept for GitHub Pages. Upload **all files from the root of this ZIP to the repository root**.

REV 1.0.122 removes the remaining artificial sister-lab routing restriction from individual planned work. Every active canonical planning step can now be evaluated at a sister lab: **process**, **formal test**, **method/process development**, and **final quality review / release / handover**. Completed/historical work remains locked, and non-booking planning-situation markers are not transferable.

The correction is end-to-end rather than UI-only. REV 1.0.121 still restricted remote work in four places: the Planned Task popup, `MultiLabPlanningV1170._taskContext`, the cross-site planning-integrity invariant, and a closeout-planner branch that hard-coded the final booking to the build's home lab. REV 1.0.122 aligns all four layers with the canonical task model.

For a remote final closeout step, build ownership and approval authority remain unchanged. Only the planned execution location changes. Transfer lead time to the sister lab is included, the complete request is replanned, and the whole portfolio must pass the existing coverage, invariant and planning-integrity gates before the option can be accepted.

The existing full-width Green/Yellow in-swimlane manual replanning remains available in both Planning and Build > Schedule. Browser data schema remains **35**, so upgrading does not require a data reset.

See `CHANGELOG_v1.0.122.md`, `QA_REPORT_v1.0.122.md`, and `VERIFICATION_v1.0.122.md` for details.
