import React from 'react';
import { CheckCircle2, Scale, Sparkles } from 'lucide-react';

const tagInfo = {
  safe: { label: 'Careful plan', Icon: CheckCircle2 },
  balanced: { label: 'Balanced plan', Icon: Scale },
  risky: { label: 'Bold plan', Icon: Sparkles },
};

export default function OptionPreview({ option }) {
  const { label, Icon } = tagInfo[option.tag] || tagInfo.balanced;

  return (
    <span className="oc-option-preview">
      <Icon aria-hidden="true" className="shrink-0 text-[var(--color-science)]" size={20} />
      <span className="oc-sr-only">What happens: </span>
      <span className="oc-option-preview__text">{option.hint}</span>
      <span className="oc-option-preview__tag">{label}</span>
    </span>
  );
}
