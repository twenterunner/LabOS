# LabOS REV 1.0.83 — usability and accessibility hardening

## Interface improvements

- Refined the visual hierarchy with calmer card elevation, stronger page titles, and restrained metric status rails.
- Standardised keyboard focus visibility across controls and made table row interaction easier to follow.
- Improved mobile dialogs: safe-area-aware sizing, a sticky action area, and compact two-column actions.
- Respects the operating-system reduced-motion preference.

## Defect fixes

- Dialogs now close with `Escape`.
- Keyboard `Tab` and `Shift+Tab` stay inside an open dialog.
- Closing a dialog returns focus to the control that opened it, preserving context for keyboard and assistive-technology users.
- The service-worker identity and all browser asset cache-busters are REV 1.0.83, preventing stale UI assets after deployment.

## Material receiving

- The material resolver now offers **Receive lab stock** even when no supply plan exists. It records actual lot/batch, quantity, supplier/source and a controlled reference, then reserves matching stock to the exact BOM automatically.

## Verification

- JavaScript syntax validation remains clean for every production script.
- The existing end-to-end REV 1.0.82 planning and material workflow regression suite continues to pass after the UI changes.
