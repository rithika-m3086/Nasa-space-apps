import React from 'react';

const expressions = new Set(['happy', 'thinking', 'cheering', 'worried']);

export default function Bolt({ expression = 'happy', size = 48 }) {
  const face = expressions.has(expression) ? expression : 'happy';

  return (
    <svg
      className="oc-bolt"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden="true"
      focusable="false"
      data-expression={face}
    >
      <path d="M48 18V9m0 0-5-5m5 5 5-5" fill="none" stroke="#D9DEEE" strokeWidth="4" strokeLinecap="round" />
      <circle cx="48" cy="8" r="4" fill="#FFD23F" />
      <rect x="15" y="23" width="66" height="62" rx="21" fill="#DDF6FF" stroke="#6D72B4" strokeWidth="4" />
      <path d="M15 48H8m73 0h7" stroke="#6D72B4" strokeWidth="4" strokeLinecap="round" />
      <circle cx="8" cy="48" r="4" fill="#FFB38A" />
      <circle cx="88" cy="48" r="4" fill="#FFB38A" />
      {face === 'worried' && (
        <path d="m31 41 9 3m25-3-9 3" fill="none" stroke="#48517F" strokeWidth="3" strokeLinecap="round" />
      )}
      {face === 'cheering' ? (
        <>
          <path d="m33 48 2-5 3 4 5 1-4 3-1 5-3-4-5-1Zm27 0 2-5 3 4 5 1-4 3-1 5-3-4-5-1Z" fill="#8B5CF6" />
          <path d="M34 65q14 18 28 0" fill="#FF5FA2" stroke="#48517F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          {face === 'thinking' ? (
            <path d="M34 51q4 5 8 0m12 0q4 5 8 0" fill="none" stroke="#48517F" strokeWidth="4" strokeLinecap="round" />
          ) : (
            <>
              <circle cx="34" cy="50" r="4" fill="#48517F" />
              <circle cx="58" cy="50" r="4" fill="#48517F" />
            </>
          )}
          {face === 'happy' && <path d="M36 66q12 11 24 0" fill="none" stroke="#48517F" strokeWidth="4" strokeLinecap="round" />}
          {face === 'thinking' && <path d="M43 69q5-6 10 0" fill="none" stroke="#48517F" strokeWidth="3" strokeLinecap="round" />}
          {face === 'worried' && <path d="M36 70q12-11 24 0" fill="none" stroke="#48517F" strokeWidth="4" strokeLinecap="round" />}
        </>
      )}
      <circle cx="23" cy="72" r="3" fill="#22D3EE" />
      <circle cx="73" cy="72" r="3" fill="#7CFF6B" />
    </svg>
  );
}
