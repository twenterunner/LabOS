# LabOS REV 1.0.110 — multi-lab planning KPI regression report

## Defect reproduced
REV 1.0.109 rendered the base Planning page inside `siteScopedStateV1099`, but the later REV 1.0.94 planning-health enhancement ran after `App.state` had been restored to the enterprise state. Its default `planningHealthModelV1094()` therefore read `App.state.requests` for all sites and overwrote the six local KPI tiles with enterprise totals. The same default helper fed Build Commitment Health.

## Correction
REV 1.0.110 adds an explicit active-lab planning-state guard. Default planning-health calculations derive their request population from the selected `activeLabId` / `executionSiteId`. The post-render planning enhancement also executes inside the active-lab scope so related timeline/header augmentation remains consistent with the local page.

## Dynamic UI regression
An isolated Chromium harness loaded the real runtime files with an in-memory repository and exercised the real lab selector and Planning navigation. No page errors were emitted.

Expected and observed demo metrics:

| Laboratory | All | On time | Late | Days late | Commitment movement | Unplanned | Commitment rows |
|---|---:|---:|---:|---:|---:|---:|---:|
| NL-TW · Twente | 8 | 2 | 2 | 9 | 4 | 4 | 8 |
| DE-ST · Stuttgart | 5 | 4 | 0 | 0 | 4 | 1 | 5 |
| US-DT · Detroit | 8 | 5 | 0 | 0 | 5 | 3 | 8 |

The visible request IDs in Commitment Health were also verified to belong only to the selected site's execution portfolio.

## Additional boundary checks
- Explicit empty health input remains empty rather than falling back to enterprise requests.
- A simulated execution-site transfer changes site membership in the planning-health model.
- Runtime JS syntax passes for all five JS bundles and the service worker.
- Index references only REV 1.0.110 runtime assets and every local asset reference exists.
- Schema remains 35.

## Qualification boundary
This remains a static GitHub Pages POC. Demo role and Active lab selectors are not authenticated production authorization boundaries. Production rollout still requires server-side identity/site authorization and shared transactional persistence.
