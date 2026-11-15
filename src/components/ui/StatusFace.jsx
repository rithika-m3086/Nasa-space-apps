import React from 'react';
import Bolt from '../Bolt.jsx';

export function getStatus(value) {
  if (value > 60) return 'great';
  if (value >= 30) return 'ok';
  return 'low';
}

const faceDetails = {
  great: { label: 'Great', expression: 'cheering' },
  ok: { label: 'OK', expression: 'thinking' },
  low: { label: 'Low', expression: 'worried' },
};

export default function StatusFace({ value, status }) {
  const details = faceDetails[status || getStatus(value)];
  return (
    <span className={`oc-status oc-status--${status || getStatus(value)}`}>
      <Bolt expression={details.expression} size={24} />
      <span>{details.label}</span>
    </span>
  );
}
