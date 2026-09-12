// Fenêtre d'invitation au paiement affichée quand l'utilisateur tente une
// action interdite par l'expiration de son forfait. Le fond (overlay) suit le
// même style que Modal.jsx : fond noir 70%, panneau centré, close on click.
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, FileText, BarChart3 } from 'lucide-react';
import Button from '../common/Button';

export default function SubscriptionModal({ open, action, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-card border border-card-border rounded-card w-full max-w-lg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Abonnement requis</h2>
            <p className="text-sm text-text-secondary mt-1">
              Votre essai gratuit de 7 jours est terminé.
            </p>
          </div>
        </div>

        {action && (
          <p className="text-sm text-text-secondary mb-4">
            Pour <strong className="text-text-primary">{action}</strong>, souscrivez à un forfait payant.
          </p>
        )}

        <div className="rounded-lg border border-card-border bg-bg p-3 mb-4 text-sm text-text-secondary flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-0.5 text-accent" />
            <span><strong className="text-text-primary">Accessible :</strong> vos trades, votre journal et les données enregistrées restent visibles.</span>
          </div>
          <div className="flex items-start gap-2">
            <BarChart3 className="w-4 h-4 mt-0.5 text-danger" />
            <span><strong className="text-text-primary">Verrouillé :</strong> statistiques / analytics, création de nouvelles entrées.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => { onClose(); navigate('/tarifs'); }}
            iconLeft={<CreditCard className="w-4 h-4" />}
          >
            Voir les tarifs
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
}

SubscriptionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  action: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

SubscriptionModal.defaultProps = { action: '' };