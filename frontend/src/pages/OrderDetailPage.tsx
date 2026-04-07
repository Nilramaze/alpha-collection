import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import type { Order } from '../types';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
  eingegangen: 'bg-amber-100 text-amber-800',
  bearbeitet:  'bg-blue-100 text-blue-800',
  versendet:   'bg-green-100 text-green-800',
  bezahlt:     'bg-brand-100 text-brand-800',
  geschlossen: 'bg-surface-low text-ink-outline',
  storniert:   'bg-red-100 text-red-700',
};
const statusSteps = ['eingegangen', 'bearbeitet', 'versendet', 'bezahlt', 'geschlossen'];
const statusLabels: Record<string, string> = {
  eingegangen: 'Eingegangen', bearbeitet: 'Bearbeitet', versendet: 'Versendet',
  bezahlt: 'Bezahlt', geschlossen: 'Geschlossen', storniert: 'Storniert',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) orderApi.get(Number(id)).then(({ data }) => setOrder(data.data)).finally(() => setLoading(false));
  }, [id]);

  const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' \u20AC';

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-surface-low animate-pulse" />)}</div>;
  if (!order) return <div className="text-center py-20"><p className="text-ink-variant">Bestellung nicht gefunden.</p></div>;

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div>
      <Link to="/bestellungen" className="inline-flex items-center gap-1 text-xs font-bold text-ink-variant hover:text-ink mb-6 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span> Zurück zu Bestellungen
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-ink font-headline">
            Bestellung #AC-{String(order.id).padStart(5, '0')}
          </h1>
          <p className="text-sm text-ink-variant mt-1">
            Aufgegeben am {new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={clsx('text-[10px] font-bold uppercase tracking-[0.1em] px-4 py-2', statusColors[order.status])}>
          {statusLabels[order.status]}
        </span>
      </div>

      {/* Status Progress – nicht bei Storno */}
      {order.status === 'storniert' && (
        <div className="bg-red-50 border border-red-200 px-6 py-4 mb-8 flex items-center gap-3 text-red-700">
          <span className="material-symbols-outlined text-[20px]">cancel</span>
          <span className="font-semibold text-sm">Diese Bestellung wurde storniert. Der Lagerbestand wurde wiederhergestellt.</span>
        </div>
      )}
      {order.status !== 'storniert' && (
      <div className="bg-white p-6 mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={clsx('w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors',
                  i <= currentStep ? 'bg-brand-300 text-brand-800' : 'bg-surface-low text-ink-faint')}>
                  {i < currentStep ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                </div>
                <span className={clsx('text-[9px] font-bold uppercase tracking-wider mt-2',
                  i <= currentStep ? 'text-ink' : 'text-ink-faint')}>{statusLabels[step]}</span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={clsx('h-0.5 flex-1 mx-2 mt-[-1.2rem]', i < currentStep ? 'bg-brand-300' : 'bg-surface-low')} />
              )}
            </div>
          ))}
        </div>
      </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Order Items */}
        <div className="flex-1">
          <h3 className="text-lg font-extrabold tracking-tight text-ink font-headline mb-4">Bestellpositionen</h3>
          <div className="bg-white">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-outline">
              <div className="col-span-5">Produkt</div><div className="col-span-2 text-right">Stückpreis</div>
              <div className="col-span-2 text-center">Menge</div><div className="col-span-3 text-right">Summe</div>
            </div>
            {order.items.map((item) => {
              const colorObj = item.product?.colors?.find((c) => c.id === item.product_color_id);
              const displayImage = colorObj?.image_url ?? item.product?.image_url;
              return (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-t border-surface-low">
                <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                  <div className="w-12 h-12 bg-surface-low flex items-center justify-center shrink-0 overflow-hidden">
                    {displayImage
                      ? <img src={displayImage} alt={item.product?.name} className="w-full h-full object-cover" />
                      : <span className="material-symbols-outlined text-xl text-ink-faint/30">eyeglasses</span>
                    }
                  </div>
                  <div>
                    {item.product?.sku && <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline">{item.product.sku}</div>}
                    <div className="text-sm font-bold text-ink font-headline">{item.product?.name}</div>
                    {item.color_name && <div className="text-xs text-ink-variant mt-0.5">{item.color_name}</div>}
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2 text-right text-sm text-ink-variant">{fmt(item.price_snapshot)}</div>
                <div className="col-span-4 md:col-span-2 text-center text-sm font-semibold text-ink">{item.quantity}</div>
                <div className="col-span-4 md:col-span-3 text-right text-sm font-bold text-ink">{fmt(item.subtotal)}</div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white p-6 space-y-4 sticky top-20">
            <h3 className="text-lg font-extrabold tracking-tight text-ink font-headline">Zusammenfassung</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-variant">Zwischensumme</span><span className="font-semibold text-ink">{fmt(order.total_price)}</span></div>
              {order.skonto_discount > 0 && (
                <div className="flex justify-between text-brand-500">
                  <span>Skonto-Rabatt</span><span className="font-semibold">-{fmt(order.skonto_discount)}</span>
                </div>
              )}
              <div className="h-px bg-surface-low" />
              <div className="flex justify-between">
                <span className="font-bold text-ink text-base">Endpreis</span>
                <span className="font-extrabold text-ink text-xl font-headline">{fmt(order.final_price)}</span>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-surface-low">
                <div className="label-caps">Anmerkungen</div>
                <p className="text-sm text-ink-variant">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
