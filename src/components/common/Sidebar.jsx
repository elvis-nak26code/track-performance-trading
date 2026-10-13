// Menu latéral gauche principal. Toujours en position fixe (position: fixed),
// y compris sur grand écran, et rétractable en mode "icônes seules" via le
// bouton en haut du menu. Sur mobile/tablette (< breakpoint lg), il se
// comporte en plus comme un tiroir qui s'ouvre par-dessus le contenu via le
// bouton hamburger de MobileTopBar (le mode rétracté ne s'applique qu'au
// grand écran : sur mobile, le tiroir affiche toujours les libellés complets).
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  NotebookPen,
  Table2,
  BarChart3,
  CalendarDays,
  Globe2,
  GraduationCap,
  Crosshair,
  UserCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  RotateCw,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import MobileTopBar from './MobileTopBar';

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';
const IS_DESKTOP = import.meta.env.VITE_DESKTOP === 'true';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const LINKS = [
  { to: '/', label: 'Tableau de bord', end: true, icon: LayoutDashboard },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/track-record', label: 'Track record', icon: Table2 },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/calendrier', label: 'Calendrier', icon: CalendarDays },
  { to: '/strategies', label: 'Stratégie', icon: Crosshair },
  { to: '/marches', label: 'Marchés', icon: Globe2 },
  { to: '/outils', label: "Outils d'analyse", icon: GraduationCap },
  // Lien Tarifs en commentaire : accès gratuit (voir PlanContext FREE_ACCESS).
  // { to: '/tarifs', label: 'Tarifs', icon: Tag },
];

export default function Sidebar({ collapsed, onToggleCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sync, setSync] = useState(null);

  useEffect(() => {
    if (!IS_DESKTOP) return undefined;

    let mounted = true;
    async function refresh() {
      try {
        const res = await fetch(`${API_BASE}/sync/status`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (mounted && res.ok) setSync(json.data || null);
      } catch {
        if (mounted) setSync({ online: false });
      }
    }
    refresh();
    const id = setInterval(refresh, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [token]);

  async function syncNow() {
    if (!IS_DESKTOP) return;
    setSync((s) => ({ ...s, syncing: true }));
    try {
      const res = await fetch(`${API_BASE}/sync/now`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (res.ok) setSync({ ...(json.data || {}), syncing: false });
    } catch {
      setSync((s) => ({ ...s, syncing: false }));
    }
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  const syncLabel = !IS_DESKTOP
    ? null
    : !sync || sync.syncing
      ? 'Synchronisation…'
      : !sync.online
        ? 'Hors ligne · données locales'
        : sync.pending > 0
          ? `En attente (${sync.pending})`
          : 'Synchronisé';

  return (
    <>
      <MobileTopBar onOpen={() => setMobileOpen(true)} />

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={closeMobile} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-card border-r border-card-border flex flex-col transform transition-[transform,width] duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}`}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-card-border shrink-0">
          {(!collapsed || mobileOpen) && (
            <span className="font-mono text-accent font-semibold tracking-wide text-xs pl-1">
              // BLACKTRACKER
            </span>
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-card text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors shrink-0"
            aria-label={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
            title={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Navigation desktop : flèche retour + actualiser, en remplacement de la
            barre de menus du navigateur (Electron : Menu supprimé). */}
        {IS_DESKTOP && (
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-card-border shrink-0">
            <button
              type="button"
              onClick={() => window.history.back()}
              title="Retour"
              aria-label="Retour"
              className="w-8 h-8 flex items-center justify-center rounded-card text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
            >
              <ArrowLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              title="Actualiser"
              aria-label="Actualiser"
              className="w-8 h-8 flex items-center justify-center rounded-card text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
            >
              <RotateCw size={17} />
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 flex flex-col gap-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMobile}
                title={collapsed && !mobileOpen ? link.label : undefined}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-colors ${
                    collapsed && !mobileOpen ? 'lg:justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-accent/15 via-accent/5 to-transparent text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-1 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-accent shadow-[0_0_8px_rgba(0,170,68,0.8)]"
                        aria-hidden="true"
                      />
                    )}
                    <Icon size={18} className="shrink-0" />
                    <span className={collapsed && !mobileOpen ? 'lg:hidden' : 'truncate'}>
                      {link.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-card-border p-2 flex flex-col gap-1 shrink-0">
          {/* Bascule de thème, bien visible : sombre par défaut, clair en option.
              Le bouton indique le thème vers lequel on bascule. */}
          <button
            type="button"
            onClick={toggleTheme}
            title={collapsed && !mobileOpen ? (theme === 'light' ? 'Passer au thème sombre' : 'Passer au thème clair') : undefined}
            aria-label={theme === 'light' ? 'Passer au thème sombre' : 'Passer au thème clair'}
            className={`flex items-center gap-3 px-3 py-2 mb-1 rounded-card text-sm font-medium border transition-colors ${
              theme === 'light'
                ? 'border-accent/60 bg-accent/10 text-accent hover:bg-accent/20'
                : 'border-accent/40 bg-accent/[0.07] text-accent hover:bg-accent/15'
            } ${collapsed && !mobileOpen ? 'lg:justify-center' : ''}`}
          >
            {theme === 'light' ? <Moon size={18} className="shrink-0" /> : <Sun size={18} className="shrink-0" />}
            <span className={`truncate ${collapsed && !mobileOpen ? 'lg:hidden' : ''}`}>
              {theme === 'light' ? 'Thème sombre' : 'Thème clair'}
            </span>
          </button>

          {AUTH_ENABLED && user && (
            <button
              type="button"
              onClick={() => {
                closeMobile();
                navigate('/profil');
              }}
              title={collapsed && !mobileOpen ? user.name || user.email : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-card text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors ${
                collapsed && !mobileOpen ? 'lg:justify-center' : ''
              }`}
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full shrink-0" />
              ) : (
                <UserCircle size={18} className="shrink-0" />
              )}
              <span className={`truncate ${collapsed && !mobileOpen ? 'lg:hidden' : ''}`}>
                {user.name || user.email}
              </span>
            </button>
          )}

          {AUTH_ENABLED && user && (
            <button
              type="button"
              onClick={logout}
              title={collapsed && !mobileOpen ? 'Déconnexion' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-card text-sm text-text-secondary hover:text-danger transition-colors ${
                collapsed && !mobileOpen ? 'lg:justify-center' : ''
              }`}
            >
              <LogOut size={18} className="shrink-0" />
              <span className={collapsed && !mobileOpen ? 'lg:hidden' : ''}>Déconnexion</span>
            </button>
          )}

          {IS_DESKTOP && (
            <div className="px-3 py-2 border-t border-card-border mt-1">
              <button
                type="button"
                onClick={syncNow}
                disabled={!sync?.online && sync?.pending === undefined}
                title={collapsed && !mobileOpen ? syncLabel : 'Synchroniser les données'}
                className={`flex items-center gap-3 w-full text-xs text-text-secondary hover:text-text-primary transition-colors ${
                  collapsed && !mobileOpen ? 'lg:justify-center' : ''
                }`}
              >
                {sync?.online ? (
                  <Wifi size={14} className="shrink-0 text-accent" />
                ) : sync ? (
                  <WifiOff size={14} className="shrink-0 text-danger" />
                ) : (
                  <Wifi size={14} className="shrink-0 text-text-secondary" />
                )}
                <span className={`truncate ${collapsed && !mobileOpen ? 'lg:hidden' : ''}`}>{syncLabel}</span>
                {sync?.pending > 0 || sync?.syncing ? (
                  <RefreshCw size={12} className={`shrink-0 ml-auto ${sync?.syncing ? 'animate-spin' : ''} text-text-secondary`} />
                ) : null}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggleCollapsed: PropTypes.func.isRequired,
};
