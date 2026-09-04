// Bouton réutilisable avec variantes primaire (vert accent) / secondaire / danger.
import PropTypes from 'prop-types';

const VARIANT_CLASSES = {
  primary: 'bg-accent text-bg hover:bg-accent-soft',
  secondary: 'bg-transparent border border-card-border text-text-primary hover:border-accent/50',
  danger: 'bg-transparent border border-danger/20 text-danger hover:bg-danger/10',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary',
};

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-card px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};
