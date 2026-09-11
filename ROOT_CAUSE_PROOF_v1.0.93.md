# LabOS REV 1.0.93 — AUTO-PLAN root-cause proof

## Reported symptom

AUTO-PLAN could present a proposal many years after a near-term requested delivery and still rank that proposal as the best available option.

## Proven root cause

In REV 1.0.92 the low-level slot searches were bounded by **iteration count**, not by a date:

```js
for (let i = 0; i < 5000; i++) { ... t = nextWorkStart(new Date(t.getTime() + 3600000)); }
for (let i = 0; i < 8000; i++) { ... t = nextWorkStart(new Date(t.getTime() + 3600000)); }
```

`nextWorkStart()` skips non-working time. Therefore 5,000/8,000 iterations do not mean 5,000/8,000 contiguous clock-hours; they can advance over nights and weekends for several calendar years. There was no independent `planningHorizonEnd` check. Once any conflict-free slot was eventually found, candidate ranking could treat it as feasible even when it was operationally meaningless.

This is a planner-engine defect, not a display-only defect.

## Direct reproduction on REV 1.0.92

The unmodified REV 1.0.92 `PlannerService` was run against a deterministic scenario with:

- requested delivery = `2026-09-18`
- hard whole-lab capacity closure ending `2029-06-07`

Observed result:

```json
{
  "version": "1.0.92-poc",
  "forecast": "2029-06-13",
  "daysLate": 999,
  "bookings": 8
}
```

The planner crossed the multi-year blockage and built a schedule 999 days late instead of declaring that the request could not be planned within a meaningful horizon.

Full machine-readable evidence: `ROOT_CAUSE_REPRO_BEFORE_v1.0.93.json`.

## Correction

REV 1.0.93 introduces a date-based planning horizon:

- default detailed horizon = 180 days from planning start;
- requested-date recovery allowance = requested delivery + 90 days;
- effective horizon = whichever of those is later;
- both values may be configured through state settings.

Both care/readiness and normal production slot searches stop at `planningHorizonEnd`. When no conflict-free slot exists, the service throws `CAPACITY_UNRESOLVABLE` and includes the horizon and requested delivery in the error. The UI renders this as **Planning horizon reached**.

The engine also computes the end of currently blocking intervals and jumps to the next useful search point rather than iterating one hour at a time through a long closure.

## Direct verification on REV 1.0.93

The same deterministic scenario produces:

```json
{
  "version": "1.0.93-poc",
  "blocked": true,
  "code": "CAPACITY_UNRESOLVABLE",
  "horizonEnd": "2027-03-15T08:00:00.000Z",
  "requestedDate": "2026-09-18",
  "unchangedBookings": true,
  "forecastAfterFailure": null
}
```

This proves all three required properties:

1. the multi-year candidate is no longer accepted;
2. the failed planning attempt is atomic and does not mutate live bookings; and
3. no false forecast is committed.

Full machine-readable evidence: `ROOT_CAUSE_REPRO_AFTER_v1.0.93.json`.

## Normal-plan regression

A separate normal deterministic request was also planned successfully:

- bookings created: 8
- forecast: `2026-09-21`
- forecast inside controlled horizon: yes

This verifies that the fix rejects pathological horizon overrun without preventing normal AUTO-PLAN operation.
