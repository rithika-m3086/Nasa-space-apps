import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import BigButton from './BigButton.jsx';

const FOCUSABLE = 'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)];
    (focusables()[0] || dialog).focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="oc-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="oc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oc-modal-title"
        tabIndex={-1}
      >
        <header className="mb-4 flex items-center justify-between gap-4">
          <h2 id="oc-modal-title" className="oc-display text-2xl">{title}</h2>
          <BigButton variant="ghost" className="oc-icon-button" aria-label="Close dialog" onClick={onClose}>
            <X aria-hidden="true" />
          </BigButton>
        </header>
        {children}
      </section>
    </div>
  );
}
