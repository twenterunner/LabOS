# LabOS REV 1.0.67

## UX / workflow corrections

- Restricted the global My/Team Next Action / Next Planning Decision banner to Dashboard and Action Centre only. The underlying guidance model now also returns no banner outside those views, and a DOM guard removes any late legacy insertion.
- Made sequential execution blockers actionable. When a user inspects a later process step, LabOS now identifies the exact prerequisite route step, highlights it as NEXT in the sticky substep rail, and provides a direct Go to <step> action.
- Updated the sticky NEXT command in Build execution so it routes directly to the prerequisite process step rather than displaying only a disabled generic message.
- Added a concise blocked-by-prerequisite summary explaining why the selected step is locked and what evidence must be completed first.
- Reduced unused whitespace on wide screens. Product-standard process routes use a two-column compact layout at large desktop widths; execution cards, requirement strips, sample cards and work-instruction blocks are denser while retaining full content.
- Version and cache-bust updated to 1.0.67.
