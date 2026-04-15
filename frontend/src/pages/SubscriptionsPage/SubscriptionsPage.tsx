import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { billingService } from '../../services/billingService';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { StatCard } from '../../components/molecules/StatCard';

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

export function SubscriptionsPage() {
  const { user } = useAuth();
  const { subscription, isActive, loadStatus } = useSubscription();
  const loadStatusRef = useRef(loadStatus);
  loadStatusRef.current = loadStatus;

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const load = async () => {
      setIsLoading(true);
      try {
        await loadStatusRef.current(userId);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateInvoice = async () => {
    if (!subscription || !user) return;
    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await billingService.generate({
        subscriptionId: subscription.id,
        userId: user.id,
        planType: 'BRONZE',
        planPrice: 0,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        dueDate: new Date().toISOString().split('T')[0],
      });
      setSuccessMsg('Factura generada correctamente. Ve a Facturas para pagarla.');
    } catch {
      setError('No se pudo generar la factura.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Mi Suscripción</h1>
        <p className="text-sm font-body text-text-secondary mt-1">
          Estado actual de tu suscripción
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded border border-status-overdue/30 bg-status-overdue-bg px-4 py-3 text-sm font-body text-status-overdue">
          {error}
        </div>
      )}

      {successMsg && (
        <div role="status" className="rounded border border-status-paid/30 bg-status-paid-bg px-4 py-3 text-sm font-body text-status-paid">
          {successMsg}
        </div>
      )}

      {!subscription ? (
        <div className="bg-bg-surface rounded border border-border shadow-card p-8 text-center flex flex-col gap-4 items-center">
          <p className="text-text-secondary font-body text-sm">No tienes una suscripción activa.</p>
          <Link to="/plans">
            <Button variant="primary">Ver planes disponibles</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="bg-bg-surface rounded border border-border shadow-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-display font-semibold text-text-primary uppercase tracking-wide">
                Detalle de suscripción
              </h2>
              <Badge variant={subscription.status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <StatCard
                title="Inicio"
                value={formatDate(subscription.startDate)}
              />
              <StatCard
                title="Vencimiento"
                value={formatDate(subscription.endDate)}
                trend={isActive ? 'up' : 'down'}
                trendLabel={isActive ? 'Activa' : 'Expirada'}
              />
            </div>
          </div>

          {isActive && (
            <Button
              variant="secondary"
              isLoading={isGenerating}
              onClick={() => void handleGenerateInvoice()}
              className="self-start"
            >
              Generar factura
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
