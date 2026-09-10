# LabOS REV 1.0.76 verification

Automated release verification is implemented in `verification-v176.py`.

Results at packaging:
- 18/18 release checks passed.
- JavaScript syntax passed for all six runtime JavaScript files.
- Full demo portfolio: 14/14 active plans completed, 198 build bookings, 0 equipment-capability mismatches, 0 invariant errors.
- Smart-replan runtime test: a demo build forecast at 2 Oct 2026 was re-evaluated against build-only/selective/target-first strategies and improved to 16 Sep 2026 using a valid cross-programme strategy; cross-programme impacts were detected for review.
- Runtime checks verified that Re-optimize is the yellow action before review, Commit forecast is unavailable before review, and Commit forecast becomes the next controlled action after plan review.
- Runtime checks verified Equipment & laboratory scope is absent from Lab Standards & Resources and present in Audit Readiness.

Browser navigation is restricted in the current execution environment, so these are executable domain/UI-helper tests rather than a claim of full manual browser click-through coverage.
