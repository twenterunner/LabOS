# LabOS REV 1.0.121 — single-operation sister-lab routing

## Fixed

- Fixed the sister-lab routing modal remaining permanently on the loading message. REV 1.0.120 attempted to update `#modalRoot .modal-body`, but `openModal()` does not create an element with that class. REV 1.0.121 uses a dedicated routing-result container that is guaranteed to exist.
- Sister-lab evaluation now yields between laboratory solver runs and reports progress after each lab, avoiding an apparently frozen mobile dialog during a heavy synchronous planning calculation.

## Extended

- Individual sister-lab routing now supports both canonical `process` and `test` planning tasks.
- Development tasks, final closeout and historical/completed work remain non-routable as individual operations.
- Cross-site planning invariants now explicitly permit governed remote process or test operations while continuing to reject accidental cross-site assignments for other task kinds.
- The Planned Task dialog now offers **Route only this operation to a sister lab →** for executable process steps and formal tests.
- Accepted task transfer records retain `taskKind` so network metrics can distinguish process-step and test routing.
- Network metrics now include **Sister-lab operations** in addition to whole-build transfers.

## Preserved

- Build `executionSiteId` remains unchanged for a single-operation transfer.
- Per-operation site override remains stored in `taskSiteOverridesV1170[stepId]` for backward compatibility.
- Transfer lead time before/after the remote operation, downstream replanning, equipment/skill/readiness checks and whole-portfolio integrity validation remain mandatory.
- Full-width Green/Yellow day-level manual replanning remains unchanged.
- IndexedDB schema remains 35.
