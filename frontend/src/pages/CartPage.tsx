import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { orderApi, shippingApi } from '../services/api';
import type { ShippingOption } from '../types';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, skonto, isLoading, fetchCart, updateItem, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'rechnung' | 'sepa'>('rechnung');
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const sepaEnabled = user?.sepa_enabled ?? false;

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    const qty = cart?.item_count ?? 0;
    if (qty > 0) {
      shippingApi.list(qty).then(({ data }) => {
        const opts: ShippingOption[] = data.data;
        setShippingOptions(opts);
        if (opts.length === 1) setSelectedShipping(opts[0]);
        else setSelectedShipping(prev => opts.find(o => o.id === prev?.id) ?? null);
      });
    } else {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  }, [cart?.item_count]);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const { data } = await orderApi.create(
        notes || undefined,
        selectedShipping?.id ?? null,
        sepaEnabled ? paymentMethod : 'rechnung',
      );
      toast.success('Bestellung erfolgreich aufgegeben!');
      await fetchCart();
      navigate(`/bestellungen/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bestellung fehlgeschlagen.');
    } finally {
      setPlacing(false);
      setShowConfirm(false);
    }
  };

  const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
  const items = cart?.items ?? [];

  // MwSt-Kalkulation: Netto → + MwSt → + Versand → − Skonto
  const MWST = 0.19;
  const nettoSum = skonto?.total_price ?? 0;
  const mwstAmount = nettoSum * MWST;
  const bruttoSum = nettoSum + mwstAmount;
  const shippingPrice = selectedShipping?.price ?? 0;
  const preSkonto = bruttoSum + shippingPrice;
  const discountPct = skonto?.discount_percent ?? 0;
  const skontoAmount = preSkonto * (discountPct / 100);
  const grandTotal = preSkonto - skontoAmount;

  if (isLoading && !cart) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-surface-low animate-pulse" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold tracking-tighter text-ink font-headline mb-2">Warenkorb</h1>
      <p className="text-sm text-ink-variant mb-10">{items.length === 0 ? 'Ihr Warenkorb ist leer.' : `${cart?.item_count} Artikel im Warenkorb`}</p>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white">
          <span className="material-symbols-outlined text-6xl text-ink-faint/20 mb-4">shopping_cart</span>
          <p className="text-ink-variant mb-6">Noch keine Produkte im Warenkorb.</p>
          <Link to="/produkte" className="btn-primary inline-flex py-3 px-8">Sortiment ansehen</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Items */}
          <div className="flex-1 space-y-1">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-outline">
              <div className="col-span-5">Produkt</div>
              <div className="col-span-2 text-right">Stückpreis</div>
              <div className="col-span-3 text-center">Menge</div>
              <div className="col-span-2 text-right">Summe</div>
            </div>

            {items.map((item) => {
              const colorObj = item.product.colors?.find((c) => c.id === item.product_color_id);
              const displayImage = colorObj?.image_url ?? item.product.image_url;
              return (
                <div key={item.id} className="bg-white p-5 grid grid-cols-12 gap-4 items-center group">
                  <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-low flex items-center justify-center shrink-0 overflow-hidden">
                      {displayImage
                        ? <img src={displayImage} alt={item.product.name} className="w-full h-full object-contain" />
                        : <span className="material-symbols-outlined text-2xl text-ink-faint/30">eyeglasses</span>
                      }
                    </div>
                    <div>
                      {item.product.sku && <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline">{item.product.sku}</div>}
                      <div className="text-sm font-bold text-ink font-headline">{item.product.name}</div>
                      {item.color_name && <div className="text-xs text-ink-variant mt-0.5">{item.color_name}</div>}
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-2 text-right">
                    <span className="text-sm font-semibold text-ink">{fmt(item.product.price!)}</span>
                  </div>
                  <div className="col-span-4 md:col-span-3 flex justify-center">
                    <div className="flex items-center bg-surface-low">
                      <button onClick={() => updateItem(item.product_id, item.quantity - 1, item.product_color_id ?? undefined)} className="w-9 h-9 flex items-center justify-center hover:bg-surface-high transition-colors">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <input type="number" min="1" value={item.quantity}
                        onChange={(e) => updateItem(item.product_id, parseInt(e.target.value) || 1, item.product_color_id ?? undefined)}
                        className="w-14 h-9 text-center bg-transparent border-none text-sm font-bold focus:ring-0" />
                      <button onClick={() => updateItem(item.product_id, item.quantity + 1, item.product_color_id ?? undefined)} className="w-9 h-9 flex items-center justify-center hover:bg-surface-high transition-colors">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-2 text-right flex items-center justify-end gap-3">
                    <span className="text-sm font-bold text-ink">{fmt(item.subtotal)}</span>
                    <button
                      onClick={() => {
                        if (confirm(`"${item.product.name}" aus dem Warenkorb entfernen?`)) {
                          removeItem(item.product_id, item.product_color_id ?? undefined);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-ink-faint hover:text-red-500 text-[18px] transition-colors">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white p-6 space-y-5 sticky top-20">
              <h3 className="text-lg font-extrabold tracking-tight text-ink font-headline">Bestellübersicht</h3>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-variant">Netto-Summe</span>
                  <span className="font-semibold text-ink">{fmt(nettoSum)}</span>
                </div>
                <div className="flex justify-between text-ink-variant">
                  <span>MwSt. 19 %</span>
                  <span className="font-semibold">{fmt(mwstAmount)}</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between text-ink-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">local_shipping</span>
                      {selectedShipping.name}
                    </span>
                    <span className="font-semibold text-ink">
                      {selectedShipping.price === 0 ? 'Kostenlos' : fmt(selectedShipping.price)}
                    </span>
                  </div>
                )}
                {discountPct > 0 && (
                  <div className="flex justify-between text-brand-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">percent</span>
                      Skonto ({discountPct} %)
                    </span>
                    <span className="font-semibold">-{fmt(skontoAmount)}</span>
                  </div>
                )}
                <div className="h-px bg-surface-low" />
                <div className="flex justify-between">
                  <span className="font-bold text-ink text-base">Gesamt</span>
                  <span className="font-extrabold text-ink text-xl font-headline">{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Shipping options */}
              {shippingOptions.length > 0 && (
                <div>
                  <label className="label-caps">Versandoption</label>
                  <div className="space-y-2 mt-1">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors ${
                          selectedShipping?.id === opt.id
                            ? 'border-brand-300 bg-brand-50'
                            : 'border-surface-low hover:border-ink-faint'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.id}
                          checked={selectedShipping?.id === opt.id}
                          onChange={() => setSelectedShipping(opt)}
                          className="sr-only"
                        />
                        {opt.image_url ? (
                          <img src={opt.image_url} alt={opt.name} className="w-8 h-8 object-contain shrink-0" />
                        ) : (
                          <span className="material-symbols-outlined text-[22px] text-ink-variant shrink-0">local_shipping</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-ink">{opt.name}</div>
                        </div>
                        <span className="text-sm font-bold text-ink shrink-0">
                          {opt.price === 0 ? 'Kostenlos' : fmt(opt.price)}
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          selectedShipping?.id === opt.id ? 'border-brand-300' : 'border-ink-faint'
                        }`}>
                          {selectedShipping?.id === opt.id && (
                            <div className="w-2 h-2 rounded-full bg-brand-300" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* SEPA / Zahlungsart (nur wenn vom Admin freigeschaltet) */}
              {sepaEnabled && (
                <div>
                  <label className="label-caps">Zahlungsart</label>
                  <div className="space-y-2 mt-1">
                    {(['rechnung', 'sepa'] as const).map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors ${
                          paymentMethod === method ? 'border-brand-300 bg-brand-50' : 'border-surface-low hover:border-ink-faint'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined text-[22px] text-ink-variant shrink-0">
                          {method === 'rechnung' ? 'receipt' : 'account_balance'}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-ink">
                          {method === 'rechnung' ? 'Rechnung' : 'SEPA-Lastschrift'}
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          paymentMethod === method ? 'border-brand-300' : 'border-ink-faint'
                        }`}>
                          {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-brand-300" />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="label-caps">Anmerkungen (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Lieferwünsche, Terminangaben..."
                  className="input-field text-sm resize-none" />
              </div>

              <button
                onClick={() => {
                  if (shippingOptions.length > 0 && !selectedShipping) {
                    toast.error('Bitte eine Versandoption wählen.');
                    return;
                  }
                  setShowConfirm(true);
                }}
                disabled={items.length === 0 || (shippingOptions.length > 0 && !selectedShipping)}
                className="btn-primary w-full py-4 disabled:opacity-50"
              >
                <span className="material-symbols-outlined filled text-base">shopping_bag</span>
                <span>Bestellung abschließen</span>
              </button>
              <p className="text-[10px] text-ink-faint text-center leading-relaxed">
                Im nächsten Schritt können Sie Ihre Bestellung prüfen und bestätigen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Bestellbestätigung Modal ──────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-8">
              <h2 className="text-2xl font-extrabold tracking-tighter text-ink font-headline mb-1">Bestellung bestätigen</h2>
              <p className="text-sm text-ink-variant mb-6">Bitte prüfen Sie Ihre Bestellung vor der finalen Aufgabe.</p>

              {/* Positionen */}
              <div className="space-y-2 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-ink">
                      {item.product.name}
                      {item.color_name && <span className="text-ink-outline"> · {item.color_name}</span>}
                      <span className="text-ink-outline ml-1">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-ink shrink-0 ml-4">{fmt(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Kostenübersicht */}
              <div className="border-t border-surface-low pt-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between text-ink-variant">
                  <span>Netto-Summe</span><span>{fmt(nettoSum)}</span>
                </div>
                <div className="flex justify-between text-ink-variant">
                  <span>MwSt. 19 %</span><span>{fmt(mwstAmount)}</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between text-ink-variant">
                    <span>Versand ({selectedShipping.name})</span>
                    <span>{selectedShipping.price === 0 ? 'Kostenlos' : fmt(selectedShipping.price)}</span>
                  </div>
                )}
                {discountPct > 0 && (
                  <div className="flex justify-between text-brand-500">
                    <span>Skonto ({discountPct} %)</span>
                    <span>-{fmt(skontoAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-ink text-base border-t border-surface-low pt-2 mt-2">
                  <span>Gesamtbetrag</span>
                  <span>{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Versand + Zahlung */}
              {(selectedShipping || notes || sepaEnabled) && (
                <div className="bg-surface-low p-4 text-xs space-y-1 mb-6">
                  {selectedShipping && (
                    <div className="flex gap-2">
                      <span className="text-ink-outline w-20 shrink-0">Versand</span>
                      <span className="text-ink font-medium">{selectedShipping.name}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-ink-outline w-20 shrink-0">Zahlung</span>
                    <span className="text-ink font-medium">
                      {sepaEnabled && paymentMethod === 'sepa' ? 'SEPA-Lastschrift' : 'Rechnung'}
                    </span>
                  </div>
                  {notes && (
                    <div className="flex gap-2">
                      <span className="text-ink-outline w-20 shrink-0">Anmerkung</span>
                      <span className="text-ink">{notes}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="btn-primary flex-1 py-3.5 disabled:opacity-50"
                >
                  {placing
                    ? <span className="animate-pulse">Wird aufgegeben...</span>
                    : <><span className="material-symbols-outlined filled text-base">check_circle</span><span>Jetzt verbindlich bestellen</span></>
                  }
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-5 py-3.5 border border-surface-low text-ink-variant hover:bg-surface-low transition-colors text-sm font-semibold"
                >
                  Zurück
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
