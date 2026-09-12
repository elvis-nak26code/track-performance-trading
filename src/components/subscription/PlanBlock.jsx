// Panneau "verrouillé" affiché à la place d'une section de statistiques quand
// le forfait a expiré. Usage :
//   {isExpired ? <PlanBlock /> : <Kpis/>}
// Le panneau est compact et redirige directement vers /tarifs.
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard } from 'lucide-react';
import Button from '../common/Button';

export default function PlanBlock({
  title = 'Souscrivez pour débloquer',
  message = 'Cette fonctionnalité nécessite un forfait actif.',
}) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-dashed border-card-border bg-bg/50 p-6 text-center flex flex-col items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
        <Lock className="w-4 h-4 text-accent" />
      </div>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary max-w-[320px]">{message}</p>
      <Button
        variant="primary"
        onClick={() => navigate('/tarifs')}
        iconLeft={<CreditCard className="w-3.5 h-3.5" />}
      >
        Voir les tarifs
      </Button>
    </div>
  );
}