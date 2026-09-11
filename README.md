# LabOS REV 1.0.99 — Multi-lab network release

REV 1.0.99 extends the protected REV 1.0.98 baseline from one laboratory to a configurable network of operationally independent laboratories while preserving one canonical planning engine.

## Deploy to GitHub Pages

1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.99_WEB.zip`.
2. Upload the **contents** of the extracted ZIP to the repository root. `index.html` must be at repository root.
3. Commit/publish through GitHub Pages.
4. Open the site and verify the header shows **REV 1.0.99**.
5. Existing REV 1.0.98 browser data migrates automatically from schema 33 to schema 34. Do not reset data merely to upgrade.

## Multi-lab operating model

- Each internal laboratory owns its own people, equipment, material stock, closures/readiness events and operational plan.
- Products have independent default sites for **Prototype**, **Validation / Testing** and **Failure Analysis**.
- New demand routes to the appropriate product default; existing controlled work is never silently moved when a product default changes.
- If the home lab cannot meet timing, **Lab Network Recovery** evaluates sister laboratories independently using the **same canonical PlannerService** and the target site's real capacity/readiness constraints.
- External facilities are retained as cost/lead-time benchmarks. They are not silently selected by the optimizer.
- A sister-lab transfer is a controlled transaction: home site remains traceable, execution site changes, rationale/history are retained, and the accepted sister-site schedule is committed atomically.
- Network KPIs quantify sister-lab builds, internal hours retained and estimated external outsourcing spend avoided.

## Configuration and future integration

Administration → **Laboratory network & product routing** maintains laboratories/facilities and product routing. Stable site IDs and site ownership are intentionally provider-neutral so an enterprise implementation can later source site/master data from APIs, ERP/PLM, SSO/SCIM or other identity/master-data systems.

## Verification supplied with this release

- `VERIFICATION_CORE_v1.0.99.json` — 37/37 core/migration/network checks passed.
- `VERIFICATION_PLANNER_v1.0.99.json` — 8/8 site-isolated tier/escalation checks passed.
- `BROWSER_VERIFICATION_v1.0.99.txt` — actual current runtime initialized and exercised through site switching, network comparison and transfer workflow with zero invariant errors.
- `REV1099_MOBILE_NETWORK_PROOF.png` — mobile planning/network UI proof.
- `ARCHITECTURE_PROOF_v1.0.99.md` — design invariants and regression rationale.

REV 1.0.98 remains the protected functional baseline against which this release was migrated and regression-tested.
