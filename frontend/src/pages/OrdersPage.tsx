import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import type { Order } from '../types';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
  eingegangen: 'bg-amber-100 text-amber-800',
  bearbeitet: 'bg-blue-100 text-blue-800',
  versendet: 'bg-green-100 text-green-800',
  bezahlt: 'bg-brand-100 text-brand-800',
};
const statusLabels: Record<string, string> = {
  eingegangen: 'Eingegangen', bearbeitet: 'Bearbeitet', versendet: 'Versendet', bezahlt: 'Bezahlt',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { orderApi.list().then(({ data }) => setOrders(data.data)).finally(() => setLoading(false)); }, []);

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;
  const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' \u20AC';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-ink font-headline">Bestellverwaltung</h1>
          <p className="text-sm text-ink-variant mt-1">Echtzeitübersicht Ihrer Großhandelsbestellungen und Logistik.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setFilter('')}
          className={clsx('text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 transition-colors shrink-0',
            filter === '' ? 'bg-ink text-white' : 'bg-white text-ink-variant hover:text-ink')}>Alle</button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={clsx('text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 transition-colors shrink-0',
              filter === key ? 'bg-ink text-white' : 'bg-white text-ink-variant hover:text-ink')}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-surface-low animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white">
          <span className="material-symbols-outlined text-6xl text-ink-faint/20 mb-4">receipt_long</span>
          <p className="text-ink-variant">Keine Bestellungen gefunden.</p>
        </div>
      ) : (
        <div className="bg-white">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-outline">
            <div className="col-span-2">Bestell-Nr.</div><div className="col-span-2">Datum</div><div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Gesamt</div><div className="col-span-2 text-right">Skonto</div><div className="col-span-2 text-right">Endpreis</div>
          </div>
          {filtered.map((order) => (
            <Link to={`/bestellungen/${order.id}`} key={order.id}
              className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-surface transition-colors group border-t border-surface-low first:border-t-0">
              <div className="col-span-6 md:col-span-2"><span className="text-sm font-bold text-ink font-headline">#AC-{String(order.id).padStart(5, '0')}</span></div>
              <div className="col-span-6 md:col-span-2 text-sm text-ink-variant">{new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div className="col-span-4 md:col-span-2"><span className={clsx('text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 inline-block', statusColors[order.status])}>{statusLabels[order.status]}</span></div>
              <div className="col-span-4 md:col-span-2 text-right text-sm text-ink-variant">{fmt(order.total_price)}</div>
              <div className="col-span-4 md:col-span-2 text-right text-sm text-brand-500 font-semibold">{order.skonto_discount > 0 ? `-${fmt(order.skonto_discount)}` : '\u2014'}</div>
              <div className="col-span-12 md:col-span-2 text-right">
                <span className="text-sm font-bold text-ink">{fmt(order.final_price)}</span>
                <span className="material-symbols-outlined text-sm text-ink-faint ml-2 opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
