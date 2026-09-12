// Champ de saisie de symbole "façon myfxbook" : un input libre (on peut
// taper n'importe quel symbole même hors catalogue) avec un panneau de
// suggestions couvrant toutes les paires de devises, futures, indices,
// indices synthétiques, matières premières, crypto, actions et ETF.
// Le contenu du panneau est filtré au fur et à mesure de la saisie.
import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import { searchSymbols } from '../../constants/symbols';

const MAX_ITEMS_PER_GROUP = 80;

export default function SearchableSymbolInput({
  value,
  onChange,
  placeholder = 'Rechercher un symbole…',
  required,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const groups = useMemo(() => searchSymbols(query), [query]);
  const firstOption = groups[0]?.items[0];

  function select(valueToSelect) {
    onChange(valueToSelect);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'Enter') {
      if (open && firstOption) {
        e.preventDefault();
        select(firstOption.value);
      } else {
        setOpen(true);
      }
    }
  }

  return (
    <div className="relative flex-1">
      <div className="relative">
        <input
          type="text"
          required={required}
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onChange(e.target.value);
          }}
          onFocus={() => {
            setQuery('');
            setOpen(true);
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-bg border border-card-border rounded-card pl-3 pr-8 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
        />
        <ChevronDown
          size={15}
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary/60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && (
        <ul className="absolute z-30 mt-1 w-full max-h-64 overflow-auto bg-card border border-card-border rounded-card shadow-xl text-sm">
          {groups.length === 0 ? (
            <li className="px-3 py-2 text-text-secondary/70 font-mono">
              Aucun résultat. Votre valeur sera gardée telle quelle.
            </li>
          ) : (
            groups.map((g) => (
              <li key={g.key}>
                <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-text-secondary/70 font-mono sticky top-0 bg-card">
                  {g.label}
                </p>
                <ul>
                  {g.items.slice(0, MAX_ITEMS_PER_GROUP).map((entry) => (
                    <li key={entry.value}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => select(entry.value)}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between gap-2 transition-colors ${
                          entry.value === value
                            ? 'bg-accent/10 text-accent'
                            : 'text-text-primary hover:bg-accent/5'
                        }`}
                      >
                        <span className="font-mono truncate">{entry.value}</span>
                        {entry.name && (
                          <span className="text-[10px] text-text-secondary/70 truncate">{entry.name}</span>
                        )}
                      </button>
                    </li>
                  ))}
                  {g.items.length > MAX_ITEMS_PER_GROUP && (
                    <li className="px-3 py-1 text-[10px] text-text-secondary/60 font-mono">
                      + {g.items.length - MAX_ITEMS_PER_GROUP} autres — affinez votre recherche.
                    </li>
                  )}
                </ul>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

SearchableSymbolInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};