import React from 'react';

export default function Card({ children, className = '', as: Element = 'section', ...props }) {
  return (
    <Element {...props} className={`oc-card oc-panel ${className}`.trim()}>
      {children}
    </Element>
  );
}
