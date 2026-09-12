// Composant racine : met en place les providers de contexte globaux
// (thème, authentification, paramètres, trades, journal), le layout avec
// menu latéral, le routage, et l'écran de connexion lorsque
// VITE_AUTH_ENABLED=true et qu'aucun utilisateur n'est connecté.
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { TradesProvider } from './context/TradesContext';
import { JournalProvider } from './context/JournalContext';
import { MarketsProvider } from './context/MarketsContext';
import { useAuth } from './hooks/useAuth';
import { PlanProvider } from './context/PlanContext';
import { LoadingState } from './components/common/LoadingState';
import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import JournalEntryForm from './pages/JournalEntryForm';
import TrackRecord from './pages/TrackRecord';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Markets from './pages/Markets';
import Tools from './pages/Tools';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SIDEBAR_COLLAPSED_KEY = 'journal_trading_sidebar_collapsed';

// Transition douce entre les pages : l'élément est re-monté à chaque
// changement d'URL (key = pathname) et l'animation CSS "page-in" (voir
// index.css) joue une apparition légère et discrète. On remonte aussi la
// page en haut à chaque navigation vers une nouvelle URL.
function PageTransition({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
};

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  if (AUTH_ENABLED && isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <LoadingState label="Vérification de la session…" />
      </div>
    );
  }

  if (AUTH_ENABLED && !user) {
    // Visiteur non connecté : landing page à la racine, connexion sur
    // /connexion. Tout le reste renvoie vers la landing (il doit se connecter
    // avant d'accéder au tableau de bord).
    return (
      <PageTransition>
        <Routes>
          <Route path="/connexion" element={<Login />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </PageTransition>
    );
  }

  return (
    <SettingsProvider>
      <TradesProvider>
        <JournalProvider>
          <MarketsProvider>
            <PlanProvider>
              <div className="min-h-screen bg-bg text-text-primary font-sans">
            {/* Le menu latéral est en position fixe (voir Sidebar.jsx) : on réserve
                l'espace correspondant via une marge à gauche du contenu principal,
                uniquement à partir du breakpoint "lg" (sur mobile, le menu est un
                tiroir qui se superpose au contenu, sans réserver d'espace). */}
            <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
            <main
              className={`min-w-0 px-4 sm:px-6 lg:px-8 py-6 transition-[margin] duration-200 ${
                collapsed ? 'lg:ml-[76px]' : 'lg:ml-64'
              }`}
            >
              {/* Le contenu principal s'élargit quand le menu est réduit : les
                  éléments prennent toute la place libérée au centre. */}
              <div className={`w-full mx-auto transition-[max-width] duration-200 ${collapsed ? 'max-w-7xl' : 'max-w-6xl'}`}>
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/journal/nouveau" element={<JournalEntryForm />} />
                    <Route path="/journal/:id" element={<Journal />} />
                    <Route path="/journal/:id/modifier" element={<JournalEntryForm />} />
                    <Route path="/track-record" element={<TrackRecord />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/calendrier" element={<Calendar />} />
                    <Route path="/marches" element={<Markets />} />
                    <Route path="/outils" element={<Tools />} />
                    <Route path="/tarifs" element={<Pricing />} />
                    <Route path="/profil" element={<Profile />} />
                    <Route path="/connexion" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </PageTransition>
              </div>
            </main>
          </div>
            </PlanProvider>
          </MarketsProvider>
        </JournalProvider>
      </TradesProvider>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
