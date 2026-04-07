import { useEffect, useState } from 'react';
import { adminOrderApi } from '../../services/api';
import type { Order, OrderUser } from '../../types';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['eingegangen', 'bearbeitet', 'versendet', 'bezahlt', 'geschlossen'] as const;
const ALL_STATUSES   = [...STATUS_OPTIONS, 'storniert'] as const;

const STATUS_LABELS: Record<string, string> = {
  eingegangen: 'Eingegangen',
  bearbeitet:  'Bearbeitet',
  versendet:   'Versendet',
  bezahlt:     'Bezahlt',
  geschlossen: 'Geschlossen',
  storniert:   'Storniert',
};

const STATUS_COLORS: Record<string, string> = {
  eingegangen: 'bg-yellow-100 text-yellow-700',
  bearbeitet:  'bg-blue-100 text-blue-700',
  versendet:   'bg-purple-100 text-purple-700',
  bezahlt:     'bg-green-100 text-green-700',
  geschlossen: 'bg-surface-low text-ink-outline',
  storniert:   'bg-red-100 text-red-700',
};

interface AdminOrder extends Order {
  user?: OrderUser;
}

function AddressBlock({ user }: { user: OrderUser }) {
  const hasDelivery = user.delivery_street;
  const hasBilling = !user.billing_same_as_delivery && user.billing_street;

  if (!hasDelivery) return <p className="text-xs text-ink-faint italic">Keine Adresse hinterlegt</p>;

  const fmt = (u: OrderUser, p: 'delivery' | 'billing') => [
    u[`${p}_company` as keyof OrderUser],
    u[`${p}_street` as keyof OrderUser],
    `${u[`${p}_zip` as keyof OrderUser] ?? ''} ${u[`${p}_city` as keyof OrderUser] ?? ''}`.trim(),
    u[`${p}_country` as keyof OrderUser],
  ].filter(Boolean).join(', ');

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant mb-1">Lieferadresse</p>
        <p className="text-xs text-ink">{fmt(user, 'delivery')}</p>
      </div>
      {hasBilling && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant mb-1">Rechnungsadresse</p>
          <p className="text-xs text-ink">{fmt(user, 'billing')}</p>
        </div>
      )}
      {user.billing_same_as_delivery && hasDelivery && (
        <p className="text-[10px] text-ink-faint">Rechnungsadresse = Lieferadresse</p>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminOrderApi.list({ status: filterStatus || undefined });
      setOrders(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const updateStatus = async (order: AdminOrder, status: string) => {
    try {
      await adminOrderApi.updateStatus(order.id, status);
      toast.success('Status aktualisiert.');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Aktualisieren.');
    }
  };

  const handleCancel = async (order: AdminOrder) => {
    if (!confirm(`Bestellung #AC-${String(order.id).padStart(5, '0')} wirklich stornieren?\nDer Lagerbestand wird wiederhergestellt.`)) return;
    try {
      await adminOrderApi.cancel(order.id);
      toast.success('Bestellung storniert. Lagerbestand wurde wiederhergestellt.');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Stornieren.');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-ink font-headline">Bestellungen</h1>
          <p className="text-ink-variant mt-1">{orders.length} Bestellungen</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 text-xs font-bold border transition-colors ${!filterStatus ? 'bg-brand-200 border-brand-200 text-brand-800' : 'border-surface-low text-ink-variant hover:border-ink-outline'}`}>
            Alle
          </button>
          {ALL_STATUSES.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${filterStatus === s ? 'bg-brand-200 border-brand-200 text-brand-800' : 'border-surface-low text-ink-variant hover:border-ink-outline'}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white animate-pulse" />)
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-ink-variant">Keine Bestellungen gefunden.</div>
        ) : orders.map((order) => (
          <div key={order.id} className="bg-white">
            <button
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface/50 transition-colors"
            >
              <span className="text-xs font-mono text-ink-outline w-8">#{order.id}</span>
              <span className="font-semibold text-ink flex-1">{order.user?.name ?? '—'}</span>
              <span className="text-xs text-ink-variant hidden sm:block">{order.user?.email}</span>
              <span className="font-bold text-ink">€ {order.final_price.toFixed(2)}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${STATUS_COLORS[order.status] ?? 'bg-surface-low text-ink-outline'}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="text-xs text-ink-outline">{new Date(order.created_at).toLocaleDateString('de-DE')}</span>
              <span className="material-symbols-outlined text-ink-faint text-[18px]">
                {expanded === order.id ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {expanded === order.id && (
              <div className="border-t border-surface-low px-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Positions */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant mb-2">Positionen</p>
                    <div className="space-y-1">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-ink-variant">
                            {item.product?.name ?? `Produkt #${item.product_id}`}
                            {item.color_name && <span className="text-ink-outline"> · {item.color_name}</span>}
                            {' '}× {item.quantity}
                          </span>
                          <span className="text-ink font-semibold">€ {item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && <p className="text-xs text-ink-variant mt-3 italic">„{order.notes}"</p>}
                  </div>

                  {/* Address */}
                  <div>
                    {order.user && <AddressBlock user={order.user} />}
                  </div>

                  {/* Status + Storno */}
                  <div className="space-y-4">
                    {order.status !== 'storniert' && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant mb-2">Status ändern</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map((s) => (
                            <button key={s} onClick={() => updateStatus(order, s)}
                              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                                order.status === s
                                  ? 'bg-brand-200 border-brand-200 text-brand-800'
                                  : 'border-surface-low text-ink-variant hover:border-ink-outline'
                              }`}>
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.status !== 'storniert' && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant mb-2">Storno</p>
                        <button
                          onClick={() => handleCancel(order)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          Bestellung stornieren
                        </button>
                        <p className="text-[10px] text-ink-faint mt-1">Lagerbestand wird wiederhergestellt.</p>
                      </div>
                    )}

                    {order.status === 'storniert' && (
                      <div className="flex items-center gap-2 text-sm text-red-600 font-semibold">
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        Storniert – Lagerbestand wurde wiederhergestellt
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
