# LabOS REV 1.0.133 verification scope

Verification targets:
1. JavaScript syntax for all runtime files.
2. HTML runtime references point to REV 1.0.133 files.
3. Material-ready request does not expose Material Receipt as a future planning task.
4. Material-not-ready request retains Material Receipt planning demand.
5. Valid calibration interval + approved certificate is ready.
6. Valid calibration interval + missing approval/evidence is reported as an evidence gap, not a calibration renewal.
7. Expired calibration interval is reported as a true renewal requirement.
8. Finite lab closures are treated as scheduling constraints and the search horizon extends beyond the closure.
9. Planning-task coverage failures retain a concrete task name.
10. ZIP integrity and referenced assets are checked before release.
