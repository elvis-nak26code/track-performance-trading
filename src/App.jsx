// Composant racine : met en place les providers de contexte globaux
// (thème, authentification, paramètres, trades, journal), le layout avec
// menu latéral, le routage, et l'écran de connexion lorsque
// VITE_AUTH_ENABLED=true et qu'aucun utilisateur n'est connecté.
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { TradesProvider } from './context/TradesContext';
import { JournalProvider } from './context/JournalContext';
import { useAuth } from './hooks/useAuth';
import { LoadingState } from './components/common/LoadingState';
import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
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
    return <Login />;
  }

  return (
    <SettingsProvider>
      <TradesProvider>
        <JournalProvider>
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
              <div className="max-w-6xl mx-auto w-full">
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
              </div>
            </main>
          </div>
        </JournalProvider>
      </TradesProvider>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <BrowserRouter>
            <AuthenticatedApp />
          </BrowserRouter>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
