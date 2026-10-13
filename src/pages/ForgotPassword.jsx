// Page "Mot de passe oublié" (/mot-de-passe-oublie) : permet de réinitialiser
// son mot de passe sans être connecté.
//  - Étape 1 : saisir son e-mail → l'API génère un code à 6 chiffres valable
//    30 min et l'envoie par e-mail (tant que le SMTP n'est pas configuré, le
//    code est aussi affiché à l'écran pour rester utilisable).
//  - Étape 2 : saisir le code + le nouveau mot de passe → retour à la connexion.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiForgotPassword, apiResetPassword } from '../services/api/authApi';
import Button from '../components/common/Button';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = e-mail, 2 = code + nouveau mot de passe
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [info, setInfo] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const data = await apiForgotPassword(email);
      setInfo({
        message: data?.code
          ? `Un code de vérification a été envoyé à ${email}.`
          : `Si un compte existe avec ${email}, un e-mail a été envoyé.`,
        code: data?.code || null,
      });
      setStep(2);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (password !== confirm) {
      setFormError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiResetPassword(email, code, password);
      navigate('/connexion', { state: { resetDone: true } });
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
        <h1 className="text-xl font-semibold text-text-primary mb-1">Mot de passe oublié</h1>
        <p className="text-sm text-text-secondary mb-5">
          {step === 1
            ? 'Entrez votre e-mail pour recevoir un code de vérification.'
            : `Entrez le code reçu (${email}) et choisissez un nouveau mot de passe.`}
        </p>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
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

            {formError && <p className="text-sm text-danger">{formError}</p>}

            <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full mt-1">
              {isSubmitting ? 'Envoi…' : 'Recevoir un code'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-3">
            {info?.code && (
              <div className="rounded-card border border-accent/30 bg-accent/5 px-3 py-2">
                <p className="text-[11px] text-text-secondary mb-1">
                  E-mail non configuré : votre code s&apos;affiche ici (à recopier) :
                </p>
                <p className="font-mono text-accent text-lg tracking-[0.25em]">{info.code}</p>
              </div>
            )}

            <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
              Code de vérification
              <input
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 chiffres"
                className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
              Nouveau mot de passe
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-sans focus:outline-none focus:border-accent/60"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
              Confirmer le mot de passe
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-sans focus:outline-none focus:border-accent/60"
              />
            </label>

            {formError && <p className="text-sm text-danger">{formError}</p>}

            <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full mt-1">
              {isSubmitting ? 'Réinitialisation…' : 'Réinitialiser mon mot de passe'}
            </Button>
          </form>
        )}

        <p className="text-xs text-text-secondary text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/connexion')}
            className="text-accent hover:text-accent-soft"
          >
            Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
}