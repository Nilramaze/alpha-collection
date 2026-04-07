import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import type { Product, ProductColor } from '../../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Props {
  product: Product;
  onOpenModal?: (product: Product) => void;
}

const STOCK_CONFIG = {
  green:  { dot: 'bg-green-500',  text: 'text-green-700',  label: 'Auf Lager' },
  yellow: { dot: 'bg-amber-400',  text: 'text-amber-600',  label: 'Begrenzter Bestand' },
  red:    { dot: 'bg-red-500',    text: 'text-red-600',    label: 'Ausverkauft' },
};

function colorStockStatus(qty: number | null, greenMin = 100, yellowMin = 1) {
  const q = qty ?? 0;
  if (q >= greenMin) return 'green' as const;
  if (q >= yellowMin) return 'yellow' as const;
  return 'red' as const;
}

export default function ProductCard({ product, onOpenModal }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  const hasColors = product.colors && product.colors.length > 0;
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    hasColors ? product.colors[0] : null
  );

  // Active image: color image if set, otherwise product image
  const activeImage = selectedColor?.image_url ?? product.image_url;

  // Stock for currently selected color (or overall)
  const activeStock = selectedColor
    ? selectedColor.stock_quantity
    : product.stock_quantity;
  const activeStockStatus = selectedColor
    ? colorStockStatus(selectedColor.stock_quantity)
    : product.stock_status;
  const stock = activeStockStatus ? STOCK_CONFIG[activeStockStatus] : null;
  const inStock = (activeStock ?? 0) > 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem(product.id, qty, selectedColor?.id ?? null);
      toast.success(`${product.name} hinzugefügt`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler beim Hinzufügen');
    } finally { setAdding(false); }
  };

  return (
    <div
      className="bg-white group cursor-pointer transition-all hover:shadow-[0_12px_40px_rgba(45,47,47,0.06)] flex flex-col"
      onClick={() => onOpenModal?.(product)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-surface-low overflow-hidden flex items-center justify-center">
        {activeImage ? (
          <img src={activeImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        ) : (
          <span className="material-symbols-outlined text-6xl text-ink-faint/30">eyeglasses</span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold tracking-tight text-ink font-headline leading-snug mb-3">
          {product.name}
        </h3>

        {/* Spec table */}
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs mb-3">
          {product.model_number && (
            <>
              <span className="text-ink-outline font-semibold uppercase tracking-wider">Modell</span>
              <span className="text-ink font-bold">{product.model_number}</span>
            </>
          )}
          {product.size && (
            <>
              <span className="text-ink-outline font-semibold uppercase tracking-wider">Größe</span>
              <span className="text-ink">{product.size}</span>
            </>
          )}
          {product.height != null && (
            <>
              <span className="text-ink-outline font-semibold uppercase tracking-wider">Höhe</span>
              <span className="text-ink">{product.height} mm</span>
            </>
          )}
        </div>

        {/* Color dropdown */}
        {hasColors && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <select
              value={selectedColor?.id ?? ''}
              onChange={(e) => {
                const c = product.colors.find((c) => c.id === Number(e.target.value)) ?? null;
                setSelectedColor(c);
              }}
              className="w-full bg-surface-low border-none px-3 py-2 text-sm text-ink focus:ring-0 focus:outline-none"
            >
              {product.colors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-auto" />

        {/* Stock indicator */}
        {isAuthenticated && stock && (
          <div className="flex items-center gap-2 mb-3">
            <span className={clsx('w-2 h-2 rounded-full shrink-0', stock.dot)} />
            <span className={clsx('text-[11px] font-semibold', stock.text)}>
              {stock.label}
              {activeStock !== null && (
                <span className="text-ink-outline font-normal ml-1">({activeStock.toLocaleString('de-DE')} Stk.)</span>
              )}
            </span>
          </div>
        )}

        {/* Price & cart */}
        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-3 mt-1">
            {product.price !== null && (
              <div>
                <span className="text-lg font-bold tracking-tight text-ink">
                  {product.price.toFixed(2).replace('.', ',')} €
                </span>
                <span className="text-[10px] text-ink-variant ml-1">/ Stück</span>
              </div>
            )}
            {inStock && (
              <button
                onClick={handleAdd}
                disabled={adding}
                className="btn-primary px-4 py-2.5 text-xs disabled:opacity-50 shrink-0"
              >
                <span className="material-symbols-outlined text-base filled">shopping_bag</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-2 py-2.5 bg-surface-low text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              Anmelden für Preise
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
