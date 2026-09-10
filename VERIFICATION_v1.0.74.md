# REV 1.0.74 verification

Automated checks cover runtime JavaScript syntax, version/cache consistency, responsive My Work card rules, the three-period capacity presentation, the visible weekend-planning control, 5S gallery removal, collapsible build-plan swimlanes, the simplified planning-event review, full-portfolio planning invariants, and an instrumented application-level green planning move.

The application-level move test loads the real LabOS domain and UI JavaScript in a minimal DOM harness, generates the demo portfolio, asks the real move engine for a non-no-op green alternative, verifies that its visible option ID resolves to the corresponding prevalidated proposal, commits that proposal through the real REV 1.0.74 commit function, and confirms that the live booking changed to the exact prevalidated target while move caches were cleared.

A second application-level test selects a yellow training-required alternative where available and verifies that accepting the prevalidated transaction both moves the booking and retains the scheduled training prerequisite.

Browser automation against a localhost web server is blocked in the current execution environment, so this file does not claim manual browser clicking. The app-level tests exercise the actual JavaScript move transaction with a DOM/persistence harness rather than only checking for source strings.
