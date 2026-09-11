# LabOS REV 1.0.98 — schema migration repair

## Fixed

- Restored the missing **schema 31 → 32** and **schema 32 → 33** migration links.
- Existing REV 1.0.92 / 1.0.93 browser data at schema 32 now upgrades in place to schema 33 instead of stopping startup with `No migration available from schema 32`.
- Migration is data-preserving: requests, user edits, identity, planning records, project teams, approvals and history are retained.
- Existing enterprise/planning models are normalised through the current idempotent model guards; probability values such as legacy `70` are normalised to `0.70`.
- Canonical planning-booking reconciliation still runs through the normal post-migration startup path rather than resetting the user's portfolio.
- REV-specific runtime filenames remain in place to avoid stale browser assets.

## Verification

- Direct reproduction on the unmodified REV 1.0.97 migration service: **FAILS exactly with `No migration available from schema 32`**.
- Same REV 1.0.92/1.0.93-style schema-32 state on REV 1.0.98: **migrates to schema 33** with request count, IDs and a sentinel user edit preserved.
- Browser startup test with schema-32 state: **dashboard renders, `__PROTOLAB_READY__ = true`, 0 page errors, 0 invariant errors**.
- Schema 31 → 33, schema 32 → 33 and schema 33 no-op migration paths all pass.
