import React from 'react';
import { Modal, BigButton } from '../components/ui/index.js';

export default function HealthyOrbitModal({ open, onClose, reducedMotion }) {
  return (
    <Modal open={open} onClose={onClose} title="Stretch break?">
      <div className="grid justify-items-center gap-4 text-center">
        <p>Your crew has been working hard. Want to stretch and breathe?</p>
        <div
          className={`oc-breathing-orbit ${reducedMotion ? 'oc-breathing-orbit--still' : ''}`}
          role="img"
          aria-label="A gentle breathing circle, moving for 30 seconds"
        />
        <p className="text-sm text-[var(--color-muted)]">
          Breathe in as the circle grows, then breathe out as it shrinks.
        </p>
        <div className="oc-orbit-actions">
          <BigButton onClick={onClose}>Break</BigButton>
          <BigButton variant="secondary" onClick={onClose}>Keep playing</BigButton>
        </div>
      </div>
    </Modal>
  );
}
