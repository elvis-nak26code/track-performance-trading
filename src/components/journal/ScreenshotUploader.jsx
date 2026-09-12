// Uploader de captures d'écran pour la démo : utilise URL.createObjectURL
// pour prévisualiser localement sans aucun envoi réseau (pas de backend réel).
// Chaque capture peut recevoir un titre/légende optionnel.
import { useRef } from 'react';
import PropTypes from 'prop-types';

const MAX_SCREENSHOTS = 6;

export default function ScreenshotUploader({ screenshots, onChange }) {
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const files = Array.from(fileList).slice(0, MAX_SCREENSHOTS - screenshots.length);
    const newScreenshots = files.map((file) => ({
      id: `shot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      caption: '',
    }));
    onChange([...screenshots, ...newScreenshots]);
  }

  function removeScreenshot(id) {
    const shot = screenshots.find((s) => s.id === id);
    if (shot?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(shot.url);
    }
    onChange(screenshots.filter((s) => s.id !== id));
  }

  function updateCaption(id, caption) {
    onChange(screenshots.map((s) => (s.id === id ? { ...s, caption } : s)));
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary font-mono mb-2">
        Captures d&apos;écran ({screenshots.length}/{MAX_SCREENSHOTS})
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {screenshots.map((shot) => (
          <div key={shot.id} className="rounded-card overflow-hidden border border-card-border group">
            <div className="relative aspect-video bg-bg">
              <img src={shot.url} alt={shot.caption || shot.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeScreenshot(shot.id)}
                className="absolute top-1 right-1 bg-bg/80 text-danger text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer la capture"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={shot.caption || ''}
              onChange={(e) => updateCaption(shot.id, e.target.value)}
              placeholder="Titre de la capture (optionnel)…"
              className="w-full bg-card border-t border-card-border px-2 py-1.5 text-xs text-text-primary normal-case font-sans placeholder:text-text-secondary focus:outline-none focus:bg-bg"
            />
          </div>
        ))}
        {screenshots.length < MAX_SCREENSHOTS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-card border border-dashed border-card-border text-text-secondary hover:text-accent hover:border-accent/50 flex flex-col items-center justify-center text-xs font-mono transition-colors"
          >
            <span className="text-lg leading-none mb-1">+</span>
            Ajouter
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}

ScreenshotUploader.propTypes = {
  screenshots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      file: PropTypes.instanceOf(File),
      url: PropTypes.string,
      name: PropTypes.string,
      caption: PropTypes.string,
       })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};
