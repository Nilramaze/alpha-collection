import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../services/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const q = searchParams.get('search') ?? '';
    setSearch(q);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await productApi.list(params);
      setProducts(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { productApi.categories().then(({ data }) => setCategories(data.data)); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, category]);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-brand-300 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">Live-Bestandsstatus</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-ink leading-[0.95] font-headline">
          Optische <span className="text-brand-300 italic">Präzision.</span>
        </h1>
        <p className="text-base text-ink-variant mt-3 max-w-xl leading-relaxed">
          Entdecken Sie unser kuratiertes Großhandelssortiment hochwertiger Fassungen.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchParams(e.target.value ? { search: e.target.value } : {});
            }}
            placeholder="SKU, Name..."
            className="input-field pl-10 py-2.5 text-sm w-56"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 text-xs font-bold transition-colors ${category === '' ? 'bg-brand-300 text-brand-800' : 'bg-white text-ink-variant hover:bg-surface-high'}`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`px-4 py-2 text-xs font-bold transition-colors ${category === cat.slug ? 'bg-brand-300 text-brand-800' : 'bg-white text-ink-variant hover:bg-surface-high'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-surface-low animate-pulse h-96" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-ink-faint/20 mb-4">search_off</span>
          <p className="text-ink-variant">Keine Produkte gefunden.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} onOpenModal={setSelectedProduct} />)}
          </div>
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between mt-10">
              <span className="text-xs text-ink-variant">
                Zeige {((page - 1) * meta.per_page) + 1}–{Math.min(page * meta.per_page, meta.total)} von {meta.total} Artikeln
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center bg-white hover:bg-surface-high disabled:opacity-30 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-bold transition-colors ${page === p ? 'bg-brand-300 text-brand-800' : 'bg-white hover:bg-surface-high text-ink'}`}>
                    {p}
                  </button>
                ))}
                {meta.last_page > 5 && <>
                  <span className="text-ink-faint text-xs px-1">...</span>
                  <button onClick={() => setPage(meta.last_page)}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-bold ${page === meta.last_page ? 'bg-brand-300 text-brand-800' : 'bg-white hover:bg-surface-high text-ink'}`}>
                    {meta.last_page}
                  </button>
                </>}
                <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page}
                  className="w-9 h-9 flex items-center justify-center bg-white hover:bg-surface-high disabled:opacity-30 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
