// Fonctions utilitaires de manipulation de dates, basées sur date-fns,
// avec un formatage adapté à l'interface en français.
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Formate une date ISO (yyyy-MM-dd) en format lisible français, ex: "5 juil. 2026"
export function formatDateFr(isoDate) {
  return format(parseISO(isoDate), 'd MMM yyyy', { locale: fr });
}

// Formate une date ISO en format court, ex: "05/07/2026"
export function formatDateShort(isoDate) {
  return format(parseISO(isoDate), 'dd/MM/yyyy');
}

// Retourne le nom du mois et l'année, ex: "Juin 2026"
export function formatMonthYear(date) {
  const label = format(date, 'MMMM yyyy', { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Construit la grille de jours à afficher pour un calendrier mensuel,
 * en incluant les jours de début/fin de semaine des mois adjacents
 * pour compléter les lignes de la grille.
 * @param {Date} monthDate n'importe quelle date du mois à afficher
 * @returns {Date[]}
 */
export function buildCalendarGrid(monthDate) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export { isSameMonth, addMonths, subMonths, isToday, format, parseISO };

// Convertit une Date en clé ISO yyyy-MM-dd (utilisée pour indexer les trades par jour)
export function toIsoDateKey(date) {
  return format(date, 'yyyy-MM-dd');
}

export const WEEKDAY_LABELS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Extrait la clé "yyyy-MM" d'une date ISO "yyyy-MM-dd" (utilisée pour grouper/filtrer par mois).
export function toMonthKey(isoDate) {
  return isoDate.slice(0, 7);
}

// Formate une clé "yyyy-MM" en libellé lisible français, ex: "2026-07" -> "Juillet 2026"
export function formatMonthKeyFr(monthKey) {
  const label = format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Liste triée (la plus récente en premier) des mois distincts présents dans
 * un tableau d'éléments possédant un champ `date` (ISO yyyy-MM-dd).
 * @param {Array<{date: string}>} items
 * @returns {string[]} tableau de clés "yyyy-MM"
 */
export function listAvailableMonths(items) {
  const months = new Set(items.map((item) => toMonthKey(item.date)));
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

/**
 * Filtre un tableau d'éléments (avec champ `date`) selon un objet de filtre
 * de période : { mode: 'all' | 'month' | 'range', month?: string, start?: string, end?: string }
 * @param {Array<{date: string}>} items
 * @param {{mode: string, month?: string, start?: string, end?: string}} periodFilter
 * @returns {Array}
 */
export function filterByPeriod(items, periodFilter) {
  if (!periodFilter || periodFilter.mode === 'all') return items;
  if (periodFilter.mode === 'month' && periodFilter.month) {
    return items.filter((item) => toMonthKey(item.date) === periodFilter.month);
  }
  if (periodFilter.mode === 'range' && periodFilter.start && periodFilter.end) {
    return items.filter((item) => item.date >= periodFilter.start && item.date <= periodFilter.end);
  }
  return items;
}
