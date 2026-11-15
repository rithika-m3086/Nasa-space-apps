import React from 'react';

export default function Toggle({ label, checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      className="oc-toggle"
      role="switch"
      aria-checked={Boolean(checked)}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="oc-toggle__track" aria-hidden="true">
        <span className="oc-toggle__thumb" />
      </span>
      <span>{label}</span>
    </button>
  );
}
