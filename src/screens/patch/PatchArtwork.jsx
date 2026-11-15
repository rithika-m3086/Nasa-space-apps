import React from 'react';
import { PATCH_ICONS, PATCH_PALETTES } from './patchOptions.js';

const shapePaths = {
  shield: 'M100 18 L166 43 L158 119 Q151 158 100 183 Q49 158 42 119 L34 43 Z',
  hex: 'M58 25 H142 L178 91 L142 157 H58 L22 91 Z',
};

const namePaths = {
  round: 'M 29 99 A 71 71 0 0 1 171 99',
  shield: 'M 42 78 Q 100 29 158 78',
  hex: 'M 34 82 Q 100 28 166 82',
};

function PatchShape({ shape, fill, stroke }) {
  if (shape === 'round') {
    return <circle cx="100" cy="100" r="82" fill={fill} stroke={stroke} strokeWidth="7" />;
  }
  return <path d={shapePaths[shape] || shapePaths.hex} fill={fill} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />;
}

export default function PatchArtwork({ design, size = 220 }) {
  const palette = PATCH_PALETTES.find((item) => item.id === design.palette) || PATCH_PALETTES[0];
  const icon = PATCH_ICONS.find((item) => item.id === design.icon) || PATCH_ICONS[0];
  const Icon = icon.Icon;
  const shape = PATCH_SHAPES.find((item) => item.id === design.shape)?.id || 'round';
  return (
    <div
      className="relative mx-auto aspect-square"
      style={{ width: size, maxWidth: '100%', color: palette.ink }}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`${design.name}'s ${shape} mission patch, ${design.motto}`}>
        <defs>
          <path id="patch-name-ring" d={namePaths[shape]} />
        </defs>
        <PatchShape shape={shape} fill={palette.base} stroke={palette.accent} />
        <path
          d={shape === 'round' ? 'M100 37 A63 63 0 0 1 163 100' : shapePaths[shape]}
          fill="none"
          stroke={palette.accent}
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <text fill={palette.ink} fontSize="10" fontWeight="700" letterSpacing="1.2">
          <textPath href="#patch-name-ring" startOffset="50%" textAnchor="middle">
            {design.name || 'Junior Cadet'}
          </textPath>
        </text>
        <text x="100" y="151" fill={palette.ink} fontSize="9" fontWeight="700" textAnchor="middle">
          {design.motto}
        </text>
      </svg>
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
        style={{ color: palette.accent }}
        strokeWidth={2}
      />
    </div>
  );
}
