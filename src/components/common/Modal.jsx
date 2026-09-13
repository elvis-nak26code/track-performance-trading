// Modale générique réutilisable (overlay + panneau centré).
// Sur mobile, le panneau occupe tout l'écran avec un en-tête fixe : le
// contenu (formulaire, prévisualisation) prend toute la hauteur restante et
// défile si besoin, sans jamais être rogné.
import PropTypes from 'prop-types';

export default function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full bg-card overflow-hidden sm:rounded-card sm:max-w-lg sm:max-h-[90vh] sm:border sm:border-card-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-4 py-3 sm:px-5 border-b border-card-border">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary text-lg leading-none">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};
