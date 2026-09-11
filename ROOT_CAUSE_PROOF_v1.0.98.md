# LabOS REV 1.0.98 — startup failure root cause proof

## Observed failure

REV 1.0.97 displayed:

> LabOS could not start — No migration available from schema 32

## Root cause

The runtime declares `SCHEMA_VERSION = 33`, but the migration chain in REV 1.0.97 ended at schema 31. Schema 32 had already been used by REV 1.0.92 and REV 1.0.93, and schema 33 was introduced later. The explicit transitions **31 → 32** and **32 → 33** were never added to `MigrationService`.

Fresh demo data could still start because it was created directly at the current schema. Existing browser data, however, correctly entered the migration path and failed at schema 32. This is why the defect was not caught by a fresh-install-only boot test.

## Proof

`ROOT_CAUSE_REPRO_v1.0.98.json` executes the actual migration services against the same REV 1.0.93-style schema-32 state:

- REV 1.0.97: `No migration available from schema 32`
- REV 1.0.98: schema 32 → 33 succeeds
- request count and IDs remain unchanged
- a sentinel user-edited build title is preserved
- invariant validation returns zero issues

## General correction

REV 1.0.98 restores explicit, idempotent, data-preserving migrations. The migrations normalise the current planning, enterprise and Project Team authority models but do **not** replace the user's portfolio. The existing canonical planning-definition reconciliation then runs through the normal startup flow.

The verification suite now includes an **upgrade boot test**, not only a clean-install boot test. That specifically protects against this class of regression in future releases.
