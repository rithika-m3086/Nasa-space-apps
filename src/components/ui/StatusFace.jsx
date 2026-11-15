import { Frown, Meh, Smile } from 'lucide-react';

export function getStatus(value) {
  if (value > 60) return 'great';
  if (value >= 30) return 'ok';
  return 'low';
}

const faceDetails = {
  great: { label: 'Great', Icon: Smile },
  ok: { label: 'OK', Icon: Meh },
  low: { label: 'Low', Icon: Frown },
};

export default function StatusFace({ value, status }) {
  const details = faceDetails[status || getStatus(value)];
  const { Icon } = details;
  return (
    <span className={`oc-status oc-status--${status || getStatus(value)}`}>
      <Icon aria-hidden="true" size={18} />
      <span>{details.label}</span>
    </span>
  );
}
