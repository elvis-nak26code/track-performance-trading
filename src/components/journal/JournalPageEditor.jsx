// Page de saisie du journal façon "feuille PDF" : l'utilisateur écrit
// directement où il veut, met en forme (gras / italique / souligné), dépose
// ou insère des captures d'écran à n'importe quel endroit, les redimensionne
// via la poignée, puis les sélectionne d'un clic pour les supprimer.
// Une pastille de suppression suit l'image (scroll + redimensionnement), et
// chaque image est toujours suivie d'un paragraphe pour écrire dessous.
// Le contenu (HTML) et les captures utilisées sont transmis au parent via
// onChange, puis resérialisés en blocs à la sauvegarde (utils/journalPage.js).
import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Bold, Italic, Underline, ImagePlus, Trash2, FileText, Move } from 'lucide-react';
import { blocksToHtml } from '../../utils/journalPage';

const FORMAT_COMMANDS = [
  { command: 'bold', label: 'Gras', icon: Bold, shortcut: 'Ctrl+B' },
  { command: 'italic', label: 'Italique', icon: Italic, shortcut: 'Ctrl+I' },
  { command: 'underline', label: 'Souligné', icon: Underline, shortcut: 'Ctrl+U' },
];

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function rangeFromPoint(clientX, clientY) {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(clientX, clientY);
  }
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(clientX, clientY);
    if (!pos) return null;
    const range = document.createRange();
    range.setStart(pos.offsetNode, pos.offset);
    range.collapse(true);
    return range;
  }
  return null;
}

function parseShotId(img) {
  const id = img.getAttribute('data-shot-id');
  // La poignée de redimensionnement du navigateur peut dupliquer l'attribut.
  return id ? id.split(' ')[0] : '';
}

export default function JournalPageEditor({ initialBlocks, initialScreenshots, onChange }) {
  const pageRef = useRef(null);
  const fileRef = useRef(null);
  const lastRangeRef = useRef(null);
  const screenshotsRef = useRef(initialScreenshots || []);
  const selectedElRef = useRef(null);

  const [screenshots, setScreenshots] = useState(initialScreenshots || []);
  const [selectedShot, setSelectedShot] = useState(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });

  const notify = useCallback(
    (nextScreenshots) => {
      const page = pageRef.current;
      if (!page) return;
      const shotsUsed = new Set();
      page.querySelectorAll('img[data-shot-id]').forEach((img) => {
        const id = parseShotId(img);
        if (id) shotsUsed.add(id);
      });
      onChange({
        html: page.innerHTML,
        screenshots: nextScreenshots,
        shotsUsed: [...shotsUsed],
      });
    },
    [onChange]
  );

  useEffect(() => {
    screenshotsRef.current = screenshots;
  }, [screenshots]);

  // Remplit la page une seule fois (contenu existant ou page vide), puis
  // garantit un paragraphe vide sous la dernière image éventuelle.
  useEffect(() => {
    if (!pageRef.current) return;
    pageRef.current.innerHTML = blocksToHtml(initialBlocks, initialScreenshots);
    ensureTrailingParagraph();
    notify(screenshotsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La pastille de suppression suit l'image au scroll / redimensionnement.
  const hasSelection = selectedShot !== null;
  useEffect(() => {
    if (!hasSelection) return undefined;
    function updateSelectedRect() {
      const img = selectedElRef.current;
      if (!img || !pageRef.current?.contains(img)) return;
      const rect = img.getBoundingClientRect();
      setSelectedShot((prev) => (prev ? { top: rect.top, right: rect.right } : prev));
    }
    window.addEventListener('scroll', updateSelectedRect, true);
    window.addEventListener('resize', updateSelectedRect);
    return () => {
      window.removeEventListener('scroll', updateSelectedRect, true);
      window.removeEventListener('resize', updateSelectedRect);
    };
  }, [hasSelection]);

  function ensureTrailingParagraph() {
    const page = pageRef.current;
    if (!page) return;
    const last = page.lastElementChild;
    const endsWithImage =
      last &&
      (last.tagName === 'IMG' ||
        (last.tagName === 'P' && last.querySelector('img[data-shot-id]')));
    if (!endsWithImage) return;
    const blank = document.createElement('p');
    blank.innerHTML = '<br>';
    last.after(blank);
  }

  function getCurrentRange() {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      pageRef.current &&
      pageRef.current.contains(sel.anchorNode)
    ) {
      return sel.getRangeAt(0).cloneRange();
    }
    return lastRangeRef.current ? lastRangeRef.current.cloneRange() : null;
  }

  function saveSelection() {
    lastRangeRef.current = getCurrentRange();
  }

  function refreshFormatState() {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  }

  // Applique une mise en forme au texte sélectionné sur la page.
  function applyFormat(command) {
    const page = pageRef.current;
    if (!page) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      const range = lastRangeRef.current;
      if (range) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    page.focus();
    document.execCommand(command, false, null);
    saveSelection();
    refreshFormatState();
    notify(screenshotsRef.current);
  }

  function insertImage(file, range) {
    if (!file) return;

    const shotId = genId('shot');
    const url = URL.createObjectURL(file);

    const img = document.createElement('img');
    img.src = url;
    img.setAttribute('data-shot-id', shotId);
    img.style.width = '100%';
    img.style.height = 'auto';

    const p = document.createElement('p');
    p.appendChild(img);

    if (range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      range.deleteContents();
      range.insertNode(p);
      range.setStartAfter(p);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      pageRef.current.appendChild(p);
    }

    // Toujours laisser un paragraphe sous l'image pour écrire dessous.
    if (!p.nextElementSibling && p.parentNode === pageRef.current) {
      const blank = document.createElement('p');
      blank.innerHTML = '<br>';
      p.after(blank);
    }

    const shot = { id: shotId, file, url, name: file.name, caption: '' };
    const next = [...screenshotsRef.current, shot];
    screenshotsRef.current = next;
    setScreenshots(next);
    saveSelection();
    notify(next);
  }

  function handlePick(file) {
    if (!file) return;
    insertImage(file, getCurrentRange());
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (!files.length) return;

    // Désélectionne une image avant d'en insérer une autre à l'endroit visé.
    deselectImage();

    const range = rangeFromPoint(e.clientX, e.clientY);
    if (range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    files.forEach((file) => insertImage(file, range));
  }

  function handlePaste(e) {
    const files = Array.from(e.clipboardData?.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length) {
      e.preventDefault();
      files.forEach((file) => insertImage(file, getCurrentRange()));
    }
  }

  // --- Sélection / suppression d'une image ---------------------------------

  function deselectImage() {
    if (selectedElRef.current) {
      selectedElRef.current.classList.remove('journal-img-selected');
      selectedElRef.current = null;
    }
    setSelectedShot(null);
  }

  function handlePageMouseDown(e) {
    saveSelection();
    const img = e.target.closest?.('img[data-shot-id]') || null;

    if (img) {
      if (selectedElRef.current === img) {
        deselectImage();
      } else {
        deselectImage();
        selectedElRef.current = img;
        img.classList.add('journal-img-selected');
        const rect = img.getBoundingClientRect();
        setSelectedShot({ top: rect.top, right: rect.right });
      }
    } else {
      deselectImage();
    }
  }

  function handlePaperInput() {
    const img = selectedElRef.current;
    if (img && !pageRef.current?.contains(img)) {
      deselectImage();
    }
    notify(screenshotsRef.current);
  }

  function handlePaperKeyDown(e) {
    if (e.key === 'Escape' && selectedElRef.current) {
      e.preventDefault();
      deselectImage();
      return;
    }

    // Entrée sous une image sélectionnée : on crée un nouveau paragraphe
    // juste en dessous pour écrire directement.
    if (e.key === 'Enter' && selectedElRef.current) {
      e.preventDefault();
      const img = selectedElRef.current;
      const imgP = img.closest('p') || img.parentElement;
      const blank = document.createElement('p');
      blank.innerHTML = '<br>';
      if (imgP && imgP.parentNode === pageRef.current) {
        imgP.after(blank);
      } else {
        pageRef.current.appendChild(blank);
      }
      deselectImage();
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(blank, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      saveSelection();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
      // Le navigateur applique déjà la mise en forme : on rafraîchit juste l'état.
      setTimeout(refreshFormatState, 0);
    }
  }

  function handlePaperSelection() {
    saveSelection();
    refreshFormatState();
    // Garde la pastille à jour si l'image vient d'être redimensionnée.
    if (selectedElRef.current && pageRef.current?.contains(selectedElRef.current)) {
      const rect = selectedElRef.current.getBoundingClientRect();
      setSelectedShot((prev) => (prev ? { top: rect.top, right: rect.right } : prev));
    }
  }

  function deleteSelectedImage() {
    const img = selectedElRef.current;
    if (!img || !pageRef.current || !pageRef.current.contains(img)) return;

    const parent = img.parentElement;

    // On supprime aussi la ligne vide ajoutée sous l'image, le cas échéant.
    const blankAfter = parent && parent.nextElementSibling;
    const blankIsEmpty =
      blankAfter &&
      blankAfter.tagName === 'P' &&
      !blankAfter.textContent.trim() &&
      blankAfter.querySelectorAll('img').length === 0;

    img.remove();
    if (parent && parent.tagName === 'P' && !parent.textContent.trim() && !parent.querySelector('img')) {
      parent.remove();
    }
    if (blankAfter && blankIsEmpty) {
      blankAfter.remove();
    }

    deselectImage();
    notify(screenshotsRef.current);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
        <p className="flex items-center gap-2 text-xs font-mono text-text-secondary uppercase tracking-wide">
          <FileText size={14} />
          Analyse libre
        </p>
        <div className="flex items-center gap-2 sm:ml-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 h-8 px-3 rounded-card border border-card-border bg-card text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
            title="Insérer une image à l'endroit du curseur"
          >
            <ImagePlus size={14} />
            Ajouter une image
          </button>
          <span className="hidden lg:flex items-center gap-1.5 text-[11px] text-text-secondary/70">
            <Move size={12} />
            Glissez vos captures sur la page
          </span>
        </div>
      </div>

      {/* Barre de mise en forme : s'applique au texte sélectionné */}
      <div className="flex items-center gap-1.5 mb-2 bg-card border border-card-border rounded-lg p-1.5 max-w-4xl mx-auto text-xs font-mono">
        <span className="px-2 text-text-secondary/70 uppercase tracking-wide hidden sm:inline">Mise en forme</span>
        {FORMAT_COMMANDS.map(({ command, label, icon: Icon, shortcut }) => (
          <button
            key={command}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onMouseUp={() => refreshFormatState()}
            onClick={() => applyFormat(command)}
            title={`${label} (${shortcut})`}
            aria-label={label}
            aria-pressed={activeFormats[command]}
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md border transition-colors ${
              activeFormats[command]
                ? 'bg-accent/10 text-accent border-accent/50'
                : 'border-transparent text-text-secondary hover:bg-bg hover:text-text-primary'
            }`}
          >
            <Icon size={15} />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      <div
        className="journal-paper rounded-lg w-full max-w-4xl mx-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div
          ref={pageRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Décrivez votre session à froid, vos lectures du marché, vos leçons… Cliquez pour écrire, glissez une capture d'écran où vous voulez, redimensionnez-la avec la poignée, puis cliquez dessus pour la supprimer."
          className="journal-editable px-6 sm:px-12 py-8 sm:py-12 text-base leading-relaxed"
          onInput={handlePaperInput}
          onKeyDown={handlePaperKeyDown}
          onKeyUp={handlePaperSelection}
          onMouseUp={handlePaperSelection}
          onMouseDown={handlePageMouseDown}
          onFocus={refreshFormatState}
        />
      </div>

      {/* Pastille de suppression de l'image sélectionnée (suit l'image) */}
      {selectedShot && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteSelectedImage}
          title="Supprimer cette image"
          aria-label="Supprimer l'image sélectionnée"
          className="journal-img-delete no-print"
          style={{
            top: selectedShot.top - 46,
            left: selectedShot.right,
            transform: 'translate(calc(-100% - 8px), 0)',
          }}
        >
          <Trash2 size={14} />
          Supprimer
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handlePick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

JournalPageEditor.propTypes = {
  initialBlocks: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['text', 'image']),
      content: PropTypes.string,
      screenshotId: PropTypes.string,
      width: PropTypes.number,
    })
  ),
  initialScreenshots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      file: PropTypes.instanceOf(File),
      url: PropTypes.string,
      name: PropTypes.string,
      caption: PropTypes.string,
    })
  ),
  onChange: PropTypes.func.isRequired,
};