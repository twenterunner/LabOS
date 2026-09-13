# LabOS REV 1.0.102 — planning/network consistency update

REV 1.0.102 is based on the working REV 1.0.101 package and preserves the protected REV 1.0.98 functional baseline while changing only planning/network behavior requested after REV 1.0.101.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.102_WEB.zip`.
2. Upload **all files from the ZIP root** to the GitHub Pages repository root, replacing the previous runtime files.
3. Hard refresh the page once after GitHub Pages finishes deploying.
4. Confirm the header shows **REV 1.0.102**.

## REV 1.0.102 changes
- Lab Network Recovery now contains only active builds whose canonical plan is **unplanned, incomplete/unresolved, or genuinely late**.
- A forecast is no longer considered reliable for an active build unless every current canonical planning task is scheduled exactly once. Stale forecast fields are cleared during reconciliation.
- The network comparison now explicitly separates **Current accepted plan finish** from **Replan now at home/current lab**. A current reserved plan can legitimately finish earlier than a fresh replan from today.
- Any active project can be compared/routed to a sister lab, even if its current plan is on time.
- Accepted sister-lab moves are classified as **Recovery** or **Elective routing**. Both are shown in network KPI; elective moves receive no outsourcing-avoidance credit.
- Planning timelines use **day-level UI resolution**. AM/PM labels and manual AM/PM constraint windows have been removed; exact timestamps remain internal for collision, readiness and dependency validation.
- Timeline navigation is direct: **swipe left/right on touch** or **click-drag left/right with a mouse**. The arrow buttons are removed. Zoom − / Fit / + remains.

## Data safety
Schema remains **35**. REV 1.0.102 does not reset IndexedDB or replace user-entered build data. Existing active plans are reconciled against the canonical task definition; only unreliable stale forecast fields are cleared when the current plan is incomplete.

See `CHANGELOG_v1.0.102.md` and `VERIFICATION_v1.0.102.md` for details.
