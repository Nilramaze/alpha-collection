import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { orderApi, shippingApi } from '../services/api';
import type { ShippingOption } from '../types';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, skonto, isLoading, fetchCart, updateItem, removeItem } = useCartStore();
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    const total = skonto?.final_price ?? 0;
    if (total > 0) {
      shippingApi.list(total).then(({ data }) => {
        const opts: ShippingOption[] = data.data;
        setShippingOptions(opts);
        if (opts.length === 1) setSelectedShipping(opts[0]);
        else setSelectedShipping(null);
      });
    } else {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  }, [skonto?.final_price]);

  const handlePlaceOrder = async () => {
    if (shippingOptions.length > 0 && !selectedShipping) {
      toast.error('Bitte eine Versandoption wählen.');
      return;
    }
    setPlacing(true);
    try {
      const { data } = await orderApi.create(notes || undefined, selectedShipping?.id ?? null);
      toast.success('Bestellung erfolgreich aufgegeben!');
      await fetchCart();
      navigate(`/bestellungen/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bestellung fehlgeschlagen.');
    } finally { setPlacing(false); }
  };

  const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
  const items = cart?.items ?? [];
  const shippingPrice = selectedShipping?.price ?? 0;
  const cartFinal = skonto?.final_price ?? 0;
  const grandTotal = cartFinal + shippingPrice;

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
                        ? <img src={displayImage} alt={item.product.name} className="w-full h-full object-cover" />
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
                    <button onClick={() => removeItem(item.product_id, item.product_color_id ?? undefined)} className="opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-variant">Zwischensumme</span>
                  <span className="font-semibold text-ink">{fmt(skonto?.total_price ?? 0)}</span>
                </div>
                {skonto && skonto.discount_percent > 0 && (
                  <div className="flex justify-between text-brand-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">percent</span>
                      Skonto ({skonto.discount_percent}%)
                    </span>
                    <span className="font-semibold">-{fmt(skonto.skonto_discount)}</span>
                  </div>
                )}
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

              {/* Notes */}
              <div>
                <label className="label-caps">Anmerkungen (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Lieferwünsche, Terminangaben..."
                  className="input-field text-sm resize-none" />
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0 || (shippingOptions.length > 0 && !selectedShipping)}
                className="btn-primary w-full py-4 disabled:opacity-50"
              >
                {placing
                  ? <span className="animate-pulse">Bestellung wird aufgegeben...</span>
                  : <><span className="material-symbols-outlined filled text-base">shopping_bag</span><span>Bestellung aufgeben</span></>
                }
              </button>
              <p className="text-[10px] text-ink-faint text-center leading-relaxed">
                Mit der Bestellung senden Sie eine verbindliche Anfrage. Die Zahlung erfolgt auf Rechnung.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
