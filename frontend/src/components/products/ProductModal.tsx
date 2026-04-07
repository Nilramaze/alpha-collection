import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import type { Product, ProductColor } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  onClose: () => void;
}

function colorStockStatus(qty: number | null, greenMin = 100, yellowMin = 1) {
  const q = qty ?? 0;
  if (q >= greenMin) return 'green' as const;
  if (q >= yellowMin) return 'yellow' as const;
  return 'red' as const;
}

const STOCK_DOT = { green: 'bg-green-500', yellow: 'bg-amber-400', red: 'bg-red-500' };

export default function ProductModal({ product, onClose }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const hasColors = product.colors && product.colors.length > 0;
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    hasColors ? product.colors[0] : null
  );

  const activeImage = selectedColor?.image_url ?? product.image_url;
  const activeStock = selectedColor ? selectedColor.stock_quantity : product.stock_quantity;
  const activeStockStatus = selectedColor
    ? colorStockStatus(selectedColor.stock_quantity)
    : product.stock_status;
  const inStock = (activeStock ?? 0) > 0;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addItem(product.id, qty, selectedColor?.id ?? null);
      toast.success(`${qty}x ${product.name} hinzugefügt`);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-surface-low flex items-center justify-center hover:bg-surface-high transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/2 aspect-square bg-surface-low flex items-center justify-center">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-all duration-200" />
            ) : (
              <span className="material-symbols-outlined text-8xl text-ink-faint/20">eyeglasses</span>
            )}
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-8 flex flex-col">
            {product.sku && (
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-outline mb-2">
                SKU: {product.sku}
              </div>
            )}

            <h2 className="text-3xl font-extrabold tracking-tighter text-ink font-headline">
              {product.name}
            </h2>

            {product.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {product.categories.map((cat) => (
                  <span key={cat.id} className="text-[10px] font-semibold uppercase tracking-wider text-ink-variant bg-surface-low px-3 py-1">
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {product.description && (
              <p className="text-sm text-ink-variant mt-6 leading-relaxed">{product.description}</p>
            )}

            <div className="mt-auto pt-8 space-y-5">
              {/* Color selector */}
              {hasColors && (
                <div>
                  <label className="label-caps">Farbe</label>
                  <div className="space-y-1.5">
                    {product.colors.map((c) => {
                      const st = colorStockStatus(c.stock_quantity);
                      const isSelected = selectedColor?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left border ${
                            isSelected ? 'border-ink bg-surface-low' : 'border-surface-low hover:border-ink-outline'
                          }`}
                        >
                          {c.image_url && (
                            <img src={c.image_url} alt={c.name} className="w-8 h-8 object-cover shrink-0" />
                          )}
                          <span className="flex-1 font-medium text-ink">{c.name}</span>
                          {isAuthenticated && (
                            <span className="flex items-center gap-1.5 shrink-0">
                              <span className={`w-1.5 h-1.5 rounded-full ${STOCK_DOT[st]}`} />
                              <span className="text-[11px] text-ink-outline">
                                {c.stock_quantity?.toLocaleString('de-DE') ?? 0} Stk.
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isAuthenticated && product.price !== null ? (
                <>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold tracking-tight text-ink font-headline">
                        {product.price.toFixed(2).replace('.', ',')} €
                      </span>
                      <span className="text-xs text-ink-variant ml-1">/ Stück</span>
                    </div>
                    {activeStockStatus && (
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline">Verfügbar</div>
                        <div className="text-sm font-bold text-ink">{activeStock?.toLocaleString('de-DE') ?? 0} Stk.</div>
                      </div>
                    )}
                  </div>

                  {inStock && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="label-caps mb-0 shrink-0">Menge</label>
                        <div className="flex items-center bg-surface-low">
                          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-surface-high transition-colors">
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <input
                            type="number" min="1"
                            max={activeStock ?? 999}
                            value={qty}
                            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 h-10 text-center bg-transparent border-none text-sm font-bold focus:ring-0"
                          />
                          <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-surface-high transition-colors">
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <div className="text-sm font-bold text-ink ml-auto">
                          {(product.price * qty).toFixed(2).replace('.', ',')} €
                        </div>
                      </div>

                      <button onClick={handleAdd} disabled={adding} className="btn-primary w-full py-4 disabled:opacity-50">
                        <span className="material-symbols-outlined filled text-base">shopping_bag</span>
                        <span>{adding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}</span>
                      </button>
                    </div>
                  )}

                  {!inStock && (
                    <div className="py-3 bg-red-50 text-center text-sm font-semibold text-red-600">
                      Ausverkauft
                    </div>
                  )}
                </>
              ) : !isAuthenticated ? (
                <div className="py-4 bg-surface-low text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Anmelden für Preise & Bestellung
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
