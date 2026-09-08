import { createPortal } from 'react-dom';

// View-owned dialogs escape the prayer surface's clipping and stacking context.
export default function AppOverlay({ children }) {
  return createPortal(children, document.getElementById('app-overlays') || document.body);
}
