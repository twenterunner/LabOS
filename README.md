# LabOS Prototype Build POC — REV 1.0.121

Static HTML/CSS/JavaScript proof-of-concept for GitHub Pages. Upload **all files from the root of this ZIP to the repository root**.

REV 1.0.121 fixes the sister-lab operation-routing dialog that could remain indefinitely on “Checking every sister lab…”. The cause was a UI update targeting a non-existent `.modal-body` element. The comparison now updates a dedicated live result container and evaluates sister labs one at a time so progress is visible on mobile.

Individual sister-lab routing is also extended from formal tests to **executable process steps**. The build execution site remains unchanged; only the selected process step or test receives a governed task-site override. The canonical planner then applies sister-lab transfer lead time, allocates resources at that site, replans downstream work and validates the whole portfolio before the option can be accepted.

The existing full-width Green/Yellow in-swimlane manual replanning remains available in both Planning and Build > Schedule. Browser data schema remains **35**, so upgrading from REV 1.0.120 does not require a data reset.

See `CHANGELOG_v1.0.121.md`, `QA_REPORT_v1.0.121.md`, and `VERIFICATION_v1.0.121.md` for details.
