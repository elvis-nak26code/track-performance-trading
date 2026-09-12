// Page de connexion / création de compte (/connexion).
// - Email + mot de passe : compte simulé en localStorage (voir AuthContext).
// - "Continuer avec Google" : vrai flux OAuth2 côté client via Google
//   Identity Services (@react-oauth/google). Le bouton n'apparaît que si
//   VITE_GOOGLE_CLIENT_ID est renseigné dans .env.
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const { login, register, loginWithGoogleCredential } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-card-border rounded-card p-6">
        <p className="font-mono text-accent text-xs tracking-wide mb-1">// BLACKTRACKER</p>
        <h1 className="text-xl font-semibold text-text-primary mb-1">
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h1>
        <p className="text-sm text-text-secondary mb-5">
          {mode === 'login'
            ? 'Connectez-vous pour retrouver votre journal et votre track record.'
            : 'Créez un compte pour commencer à suivre vos trades.'}
        </p>

        {GOOGLE_CLIENT_ID ? (
          <div className="mb-4">
            <GoogleLogin
             onSuccess={(credentialResponse) => {
  if (credentialResponse.credential) {
    loginWithGoogleCredential(credentialResponse.credential).catch((err) => {
      setFormError(err.message || 'La connexion Google a échoué. Réessayez.');
    });
  }
}}
              onError={() => setFormError('La connexion Google a échoué. Réessayez.')}
              theme="filled_black"
              shape="pill"
              width="100%"
            />
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-card-border" />
              <span className="text-[11px] text-text-secondary font-mono uppercase">ou</span>
              <div className="flex-1 h-px bg-card-border" />
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-text-secondary/70 mb-4 leading-relaxed">
            Connexion avec Google désactivée : ajoutez votre <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code>{' '}
            dans <code className="font-mono">.env</code> pour l&apos;activer (voir <code className="font-mono">.env.example</code>).
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
              Nom
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary normal-case font-sans focus:outline-none focus:border-accent/60"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary normal-case font-sans focus:outline-none focus:border-accent/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
            Mot de passe
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary normal-case font-sans focus:outline-none focus:border-accent/60"
            />
          </label>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full mt-1">
            {isSubmitting ? (
              <>
                <span className="w-2 h-2 rounded-full bg-bg animate-pulse" />
                {mode === 'login' ? 'Connexion…' : 'Création du compte…'}
              </>
            ) : mode === 'login' ? (
              'Se connecter'
            ) : (
              'Créer mon compte'
            )}
          </Button>
        </form>

        <p className="text-xs text-text-secondary text-center mt-4">
          {mode === 'login' ? "Pas encore de compte ? " : 'Déjà un compte ? '}
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'signup' : 'login'));
              setFormError(null);
            }}
            className="text-accent hover:text-accent-soft"
          >
            {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  );
}
