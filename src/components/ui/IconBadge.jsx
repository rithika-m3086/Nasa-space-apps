export default function IconBadge({ icon: Icon, children, color = 'var(--color-accent)' }) {
  return (
    <span className="oc-icon-badge" style={{ '--badge-color': color }}>
      {Icon && <Icon aria-hidden="true" size={20} style={{ color: 'var(--badge-color)' }} />}
      <span>{children}</span>
    </span>
  );
}
