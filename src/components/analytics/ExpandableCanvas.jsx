// Vue "grand écran" pour les graphiques d'analytics : un bouton (agrandir) en
// haut à droite au-dessus du graphique ouvre un overlay plein écran (via l'API
// Fullscreen du navigateur) où le graphique est rendu sur toute la hauteur de
// l'écran. Le composant enfant (un graphique recharts) reçoit la prop
// `fullscreen` pour adopter sa hauteur pleine écran.
import { Children, cloneElement, isValidElement, useState } from 'react';
import PropTypes from 'prop-types';
import { Maximize2, X } from 'lucide-react';

const FULLSCREEN_ID = 'blacktracker-chart-fullscreen';

export default function ExpandableCanvas({ label, children }) {
  const [open, setOpen] = useState(false);

  function openFull() {
    setOpen(true);
    setTimeout(() => {
      const el = document.getElementById(FULLSCREEN_ID);
      if (el && !document.fullscreenElement && el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    }, 80);
  }

  function close() {
    setOpen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  const full = isValidElement(children)
    ? cloneElement(children, { fullscreen: true })
    : children;

  return (
    <>
      <div className="relative group">
        <button
          type="button"
          onClick={openFull}
          title="Afficher en grand écran"
          aria-label="Afficher en grand écran"
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-lg border border-card-border bg-card/90 text-text-secondary hover:text-accent hover:border-accent/50 flex items-center justify-center opacity-60 hover:opacity-100 focus:opacity-100 transition-opacity"
        >
          <Maximize2 size={15} />
        </button>
        {children}
      </div>

      {open && (
        <div
          id={FULLSCREEN_ID}
          className="fixed inset-0 z-[80] flex flex-col bg-bg"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-card-border bg-card shrink-0">
            <span className="font-mono text-xs uppercase tracking-wide text-text-secondary">
              {label || 'Analyse en grand écran'}
            </span>
            <button
              type="button"
              onClick={close}
              className="flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-danger px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <X size={14} />
              Quitter le plein écran
            </button>
          </div>
          <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-auto">{full}</div>
        </div>
      )}
    </>
  );
}

ExpandableCanvas.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
};