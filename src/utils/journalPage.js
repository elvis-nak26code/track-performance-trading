// Conversion entre le modèle "blocks" d'une entrée de journal et la page
// HTML éditable affichée comme une feuille (type PDF). Le contenu de la page
// est un simple HTML avec des paragraphes et des <img data-shot-id> ; la
// sauvegarde le resérialise en blocs { type: 'text' | 'image' }.
// Les images continuent de référencer une capture du tableau "screenshots".

export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Interprète une largeur CSS ou un attribut : "200px" -> 200, "100%" / "auto" /
// vide -> null (pleine largeur). Le historique parseInt('100%') = 100 rétrécissait
// les images pleine largeur à 100px au rechargement : il faut laisser "null".
export function parseImageWidth(value = '') {
  const str = String(value).trim();
  if (!str || str === 'auto' || str.endsWith('%')) return null;
  const px = parseInt(str, 10);
  return Number.isFinite(px) && px > 0 ? px : null;
}

// Blocs -> HTML pré-rempli de la page éditable.
export function blocksToHtml(blocks = [], screenshots = []) {
  return blocks
    .map((block) => {
      if (block.type === 'text') {
        const text = escapeHtml(block.content || '');
        return text
          .split(/\n{2,}/)
          .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
          .join('');
      }

      const shot = screenshots.find((s) => s.id === block.screenshotId);
      if (!shot) return '';
      const widthStyle = block.width ? ` style="width:${block.width}px"` : '';
      return `<p><img data-shot-id="${escapeHtml(block.screenshotId)}" src="${escapeHtml(shot.url)}"${widthStyle}></p>`;
    })
    .join('');
}

// HTML de la page éditable -> blocs (texte / image) + ids de captures utilisés.
export function htmlToBlocks(html) {
  if (typeof document === 'undefined') return { blocks: [], shotsUsed: [] };

  const root = document.createElement('div');
  root.innerHTML = html || '';

  const blocks = [];
  const shotsUsed = new Set();

  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) blocks.push({ type: 'text', content: text });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const isDirectImg = node.tagName === 'IMG' && node.getAttribute('data-shot-id');
    const imgs = isDirectImg ? [node] : [...node.querySelectorAll('img[data-shot-id]')];

    if (imgs.length) {
      // Texte éventuel dans le même paragraphe que l'image (hors images).
      const clone = node.cloneNode(true);
      clone.querySelectorAll('img').forEach((img) => img.remove());
      const text = clone.innerText?.trim() || '';
      if (text) blocks.push({ type: 'text', content: text });

      imgs.forEach((img) => {
        const screenshotId = img.getAttribute('data-shot-id');
        if (!screenshotId) return;
        const parsed = parseImageWidth(img.getAttribute('width') || img.style.width);
        blocks.push({
          type: 'image',
          screenshotId,
          ...(parsed ? { width: parsed } : {}),
        });
        shotsUsed.add(screenshotId);
      });
      return;
    }

    const text = node.innerText?.trim() || '';
    if (text) blocks.push({ type: 'text', content: text });
  });

  return { blocks, shotsUsed: [...shotsUsed] };
}