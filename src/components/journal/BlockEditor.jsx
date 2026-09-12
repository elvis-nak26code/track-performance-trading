// Éditeur de blocs pour une entrée de journal : permet d'alterner librement
// des blocs de texte et des blocs image dans l'ordre voulu, chacun avec ses
// contrôles (déplacer haut/bas, supprimer, insérer un nouveau bloc dessous).
import { useRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowUp, ArrowDown, Trash2, Type, ImagePlus, TextQuote, GripVertical } from 'lucide-react';

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeTextBlock() {
  return { id: genId('blk'), type: 'text', content: '' };
}

function makeImageBlock() {
  return { id: genId('blk'), type: 'image', screenshotId: '' };
}

export default function BlockEditor({ blocks, screenshots, onChange }) {
  const fileRefs = useRef(new Map());

  function commit(nextBlocks, nextScreenshots) {
    onChange(nextBlocks, nextScreenshots);
  }

  function addBlock(afterId, type) {
    const newBlock = type === 'text' ? makeTextBlock() : makeImageBlock();
    const idx = blocks.findIndex((b) => b.id === afterId);
    const next = [...blocks];
    next.splice(idx + 1, 0, newBlock);
    commit(next, screenshots);
  }

  function removeBlock(id) {
    const block = blocks.find((b) => b.id === id);
    let nextScreenshots = screenshots;

    if (block && block.type === 'image' && block.screenshotId) {
      const shot = screenshots.find((s) => s.id === block.screenshotId);
      if (shot?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(shot.url);
      }
      nextScreenshots = screenshots.filter((s) => s.id !== block.screenshotId);
    }

    commit(blocks.filter((b) => b.id !== id), nextScreenshots);
  }

  function moveBlock(id, dir) {
    const idx = blocks.findIndex((b) => b.id === id);
    const target = idx + dir;
    if (idx === -1 || target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next, screenshots);
  }

  function updateContent(id, content) {
    commit(
      blocks.map((b) => (b.id === id ? { ...b, content } : b)),
      screenshots
    );
  }

  function setBlockImage(block, fileList) {
    const file = fileList && fileList[0];
    if (!file) return;

    const previous = screenshots.find((s) => s.id === block.screenshotId);
    if (previous?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(previous.url);
    }

    const shotId = genId('shot');
    const nextShot = {
      id: shotId,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      caption: previous?.caption || '',
    };

    const nextScreenshots = previous
      ? screenshots.map((s) => (s.id === block.screenshotId ? nextShot : s))
      : [...screenshots, nextShot];

    commit(
      blocks.map((b) =>
        b.id === block.id ? { ...b, screenshotId: shotId } : b
      ),
      nextScreenshots
    );
  }

  function updateCaption(screenshotId, caption) {
    commit(
      blocks,
      screenshots.map((s) => (s.id === screenshotId ? { ...s, caption } : s))
    );
  }

  function renderToolbar(block, index) {
    const canUp = index > 0;
    const canDown = index < blocks.length - 1;

    return (
      <div className="flex items-center gap-1 border-t border-card-border pt-2">
        <span className="text-[10px] font-mono text-text-secondary/60 uppercase tracking-wide mr-2">
          {block.type === 'text' ? 'Texte' : 'Image'}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => moveBlock(block.id, -1)}
            disabled={!canUp}
            className="w-7 h-7 flex items-center justify-center rounded-card text-text-secondary hover:bg-white/[0.05] hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Déplacer vers le haut"
            aria-label="Déplacer vers le haut"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => moveBlock(block.id, 1)}
            disabled={!canDown}
            className="w-7 h-7 flex items-center justify-center rounded-card text-text-secondary hover:bg-white/[0.05] hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Déplacer vers le bas"
            aria-label="Déplacer vers le bas"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => addBlock(block.id, 'text')}
            className="h-7 px-2 flex items-center gap-1.5 rounded-card text-xs font-mono text-text-secondary hover:text-accent hover:bg-white/[0.05] transition-colors"
            title="Insérer un bloc de texte en dessous"
          >
            <Type size={13} /> Texte
          </button>
          <button
            type="button"
            onClick={() => addBlock(block.id, 'image')}
            className="h-7 px-2 flex items-center gap-1.5 rounded-card text-xs font-mono text-text-secondary hover:text-accent hover:bg-white/[0.05] transition-colors"
            title="Insérer une image en dessous"
          >
            <ImagePlus size={13} /> Image
          </button>
          <button
            type="button"
            onClick={() => removeBlock(block.id)}
            className="w-7 h-7 flex items-center justify-center rounded-card text-text-secondary hover:text-danger hover:bg-white/[0.05] transition-colors"
            title="Supprimer ce bloc"
            aria-label="Supprimer ce bloc"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wide text-text-secondary font-mono">
          Contenu de l&apos;entrée
        </p>
        <p className="text-[10px] text-text-secondary/70 font-mono">
          {blocks.length} bloc{blocks.length > 1 ? 's' : ''}
        </p>
      </div>

      {blocks.length === 0 ? (
        <div className="flex items-center justify-center bg-bg border border-dashed border-card-border rounded-card py-6">
          <button
            type="button"
            onClick={() => addBlock(null, 'text')}
            className="h-8 px-3 flex items-center gap-2 rounded-card text-xs font-mono text-text-secondary hover:text-accent hover:bg-white/[0.05] transition-colors"
          >
            <TextQuote size={14} /> Démarrer avec un bloc de texte
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((block, index) => {
            if (block.type === 'text') {
              return (
                <div
                  key={block.id}
                  className="rounded-card border border-card-border bg-bg p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 text-text-secondary/60">
                    <TextQuote size={14} />
                    <span className="text-[10px] font-mono uppercase tracking-wide">Texte</span>
                  </div>
                  <textarea
                    rows={4}
                    value={block.content || ''}
                    onChange={(e) => updateContent(block.id, e.target.value)}
                    placeholder="Votre analyse, le contexte, les leçons…"
                    className="w-full bg-card border border-card-border rounded-card px-3 py-2 text-sm text-text-primary normal-case font-sans leading-relaxed focus:outline-none focus:border-accent/60 resize-y"
                  />
                  {renderToolbar(block, index)}
                </div>
              );
            }

            // Bloc image
            const shot = screenshots.find((s) => s.id === block.screenshotId);

            return (
              <div
                key={block.id}
                className="rounded-card border border-card-border bg-bg p-3 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-text-secondary/60">
                  <ImagePlus size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-wide">Image</span>
                </div>

                {shot ? (
                  <div className="rounded-card overflow-hidden border border-card-border bg-card group">
                    <div className="relative">
                      <img
                        src={shot.url}
                        alt={shot.caption || shot.name}
                        className="w-full h-auto max-h-[60vh] object-contain bg-bg"
                      />
                      <button
                        type="button"
                        onClick={() => fileRefs.current.get(block.id)?.click()}
                        className="absolute bottom-2 right-2 text-xs font-mono bg-bg/85 border border-card-border rounded-card px-2.5 py-1 text-text-secondary hover:text-accent transition-colors"
                      >
                        Remplacer
                      </button>
                    </div>
                    <input
                      type="text"
                      value={shot.caption || ''}
                      onChange={(e) => updateCaption(shot.id, e.target.value)}
                      placeholder="Légende de l'image (optionnel)…"
                      className="w-full bg-card border-t border-card-border px-3 py-2 text-xs text-text-primary normal-case font-sans placeholder:text-text-secondary focus:outline-none focus:bg-bg"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRefs.current.get(block.id)?.click()}
                    className="aspect-video max-h-[40vh] w-full rounded-card border border-dashed border-card-border text-text-secondary hover:text-accent hover:border-accent/50 flex flex-col items-center justify-center text-xs font-mono transition-colors"
                  >
                    <ImagePlus size={18} className="mb-1" />
                    Charger une image
                  </button>
                )}

                <input
                  ref={(el) => (el ? fileRefs.current.set(block.id, el) : fileRefs.current.delete(block.id))}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setBlockImage(block, e.target.files);
                    e.target.value = '';
                  }}
                />

                {renderToolbar(block, index)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

BlockEditor.propTypes = {
  blocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'image']).isRequired,
      content: PropTypes.string,
      screenshotId: PropTypes.string,
    })
  ).isRequired,
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