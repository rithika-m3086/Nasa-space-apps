export default function Card({ children, className = '', as: Element = 'section', ...props }) {
  return (
    <Element {...props} className={`oc-card ${className}`.trim()}>
      {children}
    </Element>
  );
}
