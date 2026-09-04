// Barre du haut visible uniquement sur mobile/tablette (< breakpoint lg),
// avec le bouton hamburger (icône, pas d'émoji) qui ouvre le menu latéral
// en tiroir.
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';

export default function MobileTopBar({ onOpen }) {
  return (
    <div className="lg:hidden sticky top-0 z-20 h-14 flex items-center gap-3 px-4 bg-bg/95 backdrop-blur border-b border-card-border">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Ouvrir le menu"
        className="w-8 h-8 flex items-center justify-center rounded-card text-text-primary hover:bg-white/[0.05]"
      >
        <Menu size={20} />
      </button>
      <span className="font-mono text-accent font-semibold tracking-wide text-sm">
        // JOURNAL·DE·TRADING
      </span>
    </div>
  );
}

MobileTopBar.propTypes = {
  onOpen: PropTypes.func.isRequired,
};
