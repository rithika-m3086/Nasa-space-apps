import React from 'react';

export default function AstronautAvatar({ color = '#22D3EE' }) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <path d="M17 70c2-13 9-20 23-20s21 7 23 20" fill="#F5F7FF" stroke="#9AA6D1" strokeWidth="4" />
      <path d="M29 53v12m22-12v12" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <circle cx="40" cy="33" r="25" fill={color} stroke="#F5F7FF" strokeWidth="4" />
      <circle cx="40" cy="34" r="16" fill="#DDF6FF" stroke="#1D264A" strokeWidth="3" />
      <circle cx="35" cy="32" r="2" fill="#1D264A" />
      <circle cx="45" cy="32" r="2" fill="#1D264A" />
      <path d="M36 39q4 5 8 0" fill="none" stroke="#1D264A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 14 29 9m26 5-4-5" stroke="#F5F7FF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
