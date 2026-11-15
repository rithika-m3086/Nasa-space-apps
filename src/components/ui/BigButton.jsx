import { LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion.js';

export default function BigButton({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      {...props}
      type={type}
      className={`oc-button oc-button--${variant} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      whileTap={reducedMotion || disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 430, damping: 19 }}
    >
      {loading && (
        <LoaderCircle
          aria-hidden="true"
          size={20}
          className={reducedMotion ? '' : 'animate-spin'}
        />
      )}
      {children}
    </motion.button>
  );
}
