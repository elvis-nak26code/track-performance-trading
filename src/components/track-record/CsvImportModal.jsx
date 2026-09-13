// Import CSV de trades pour /track-record : lit le fichier, le parse,
// affiche une prévisualisation avant confirmation.
import { useState } from 'react';
import PropTypes from 'prop-types';
import { parseTradesCsv } from '../../utils/csvParser';
import Button from '../common/Button';

export default function CsvImportModal({ onImport, onClose }) {
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  async function handleImport() {
    setIsImporting(true);
    try {
      await onImport(preview);
    } finally {
      setIsImporting(false);
    }
  }

  function handleFile(file) {
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseTradesCsv(reader.result);
        setPreview(rows);
      } catch (err) {
        setError(err.message);
        setPreview([]);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <p className="text-sm text-text-secondary mb-3">
        Format attendu : <code className="font-mono text-xs">date,symbole,strategies,direction,prixEntree,prixSortie,quantite,r,pnl</code>
        <br />
        <span className="text-xs">
          La colonne <code className="font-mono">strategies</code> accepte une ou plusieurs valeurs séparées par
          «&nbsp;;&nbsp;», ex : <code className="font-mono">fondamentale;price-action</code>
        </span>
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="text-sm text-text-secondary file:mr-3 file:px-3 file:py-1.5 file:rounded-card file:border file:border-card-border file:bg-transparent file:text-text-primary file:cursor-pointer"
      />
      {fileName && <p className="text-xs font-mono text-text-secondary mt-2">Fichier : {fileName}</p>}
      {error && <p className="text-sm text-danger mt-2">{error}</p>}
      {preview.length > 0 && (
        <div className="mt-4 max-h-56 overflow-y-auto border border-card-border rounded-card">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-left text-text-secondary border-b border-card-border">
                <th className="p-2">Date</th>
                <th className="p-2">Symbole</th>
                <th className="p-2">Sens</th>
                <th className="p-2">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-card-border/60 last:border-0">
                  <td className="p-2">{row.date}</td>
                  <td className="p-2">{row.symbol}</td>
                  <td className="p-2">{row.direction}</td>
                  <td className={`p-2 ${row.pnl >= 0 ? 'text-accent' : 'text-danger'}`}>{row.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose} disabled={isImporting} className="w-full sm:w-auto">
          Annuler
        </Button>
        <Button variant="primary" disabled={preview.length === 0 || isImporting} onClick={handleImport} className="w-full sm:w-auto">
          {isImporting ? 'Importation…' : `Importer ${preview.length > 0 ? `(${preview.length})` : ''}`}
        </Button>
      </div>
    </div>
  );
}

CsvImportModal.propTypes = {
  onImport: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
