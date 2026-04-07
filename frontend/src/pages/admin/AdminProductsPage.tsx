import { useEffect, useState } from 'react';
import { adminProductApi, productApi } from '../../services/api';
import type { Product, Category, ProductColor } from '../../types';
import toast from 'react-hot-toast';

const STOCK_DOT: Record<string, string> = {
  green: 'bg-green-500', yellow: 'bg-amber-400', red: 'bg-red-500',
};

interface ColorEntry {
  name: string;
  stock_quantity: string;
  keep_image: string | null;   // existing image URL to preserve
  newImage: File | null;       // newly selected file
  preview: string | null;      // preview URL for display
}

const emptyForm = {
  name: '', sku: '', model_number: '', size: '', height: '',
  description: '', price: '', is_active: true,
  category_ids: [] as number[], colors: [] as ColorEntry[], image: null as File | null,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [form, setForm] = useState(emptyForm);
  const [newColor, setNewColor] = useState('');
  const [newColorStock, setNewColorStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminProductApi.list({ search, page });
      setProducts(data.data);
      setMeta(data.meta);
    } finally { setLoading(false); }
  };

  useEffect(() => { productApi.categories().then(({ data }) => setCategories(data.data)); }, []);
  useEffect(() => { load(); }, [search, page]);

  const openCreate = () => {
    setForm(emptyForm); setNewColor(''); setNewColorStock('');
    setModal({ open: true, product: null });
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, sku: p.sku ?? '', model_number: p.model_number ?? '',
      size: p.size ?? '', height: p.height != null ? String(p.height) : '',
      description: p.description ?? '', price: String(p.price ?? ''),
      is_active: p.is_active,
      category_ids: p.categories.map((c) => c.id),
      colors: (p.colors ?? []).map((c: ProductColor) => ({
        name: c.name,
        stock_quantity: String(c.stock_quantity ?? 0),
        keep_image: c.image_url ?? null,
        newImage: null,
        preview: c.image_url ?? null,
      })),
      image: null,
    });
    setNewColor(''); setNewColorStock('');
    setModal({ open: true, product: p });
  };

  const addColor = () => {
    const name = newColor.trim();
    if (!name) return;
    setForm({
      ...form,
      colors: [...form.colors, { name, stock_quantity: newColorStock || '0', keep_image: null, newImage: null, preview: null }],
    });
    setNewColor(''); setNewColorStock('');
  };

  const removeColor = (i: number) =>
    setForm({ ...form, colors: form.colors.filter((_, idx) => idx !== i) });

  const updateColor = (i: number, patch: Partial<ColorEntry>) => {
    setForm({ ...form, colors: form.colors.map((c, idx) => idx === i ? { ...c, ...patch } : c) });
  };

  const handleColorImage = (i: number, file: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    updateColor(i, { newImage: file, preview, keep_image: null });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.sku) fd.append('sku', form.sku);
      if (form.model_number) fd.append('model_number', form.model_number);
      if (form.size) fd.append('size', form.size);
      if (form.height) fd.append('height', form.height);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('is_active', form.is_active ? '1' : '0');
      form.category_ids.forEach((id) => fd.append('category_ids[]', String(id)));
      form.colors.forEach((c, i) => {
        fd.append(`colors[${i}][name]`, c.name);
        fd.append(`colors[${i}][stock_quantity]`, c.stock_quantity || '0');
        if (c.keep_image) fd.append(`colors[${i}][keep_image]`, c.keep_image);
        if (c.newImage) fd.append(`color_images[${i}]`, c.newImage);
      });
      if (form.image) fd.append('image', form.image);

      if (modal.product) {
        fd.append('_method', 'PUT');
        await adminProductApi.update(modal.product.id, fd);
        toast.success('Produkt aktualisiert.');
      } else {
        await adminProductApi.create(fd);
        toast.success('Produkt erstellt.');
      }
      setModal({ open: false, product: null });
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Produkt "${p.name}" wirklich löschen?`)) return;
    await adminProductApi.destroy(p.id);
    toast.success('Produkt gelöscht.');
    load();
  };

  const toggleCategory = (id: number) => {
    setForm((f) => ({
      ...f,
      category_ids: f.category_ids.includes(id) ? f.category_ids.filter((c) => c !== id) : [...f.category_ids, id],
    }));
  };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-ink font-headline">Produktpflege</h1>
          <p className="text-ink-variant mt-1">{meta?.total ?? '–'} Produkte</p>
        </div>
        <button onClick={openCreate} className="btn-primary px-5 py-3">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Neues Produkt
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-[18px]">search</span>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Name oder SKU..." className="input-field pl-10 py-3 text-sm w-full max-w-sm" />
        </div>
      </div>

      <div className="bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-low">
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Produkt</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Modell</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Größe</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Höhe</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Preis</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Bestand</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-surface-low">
                  {[...Array(8)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-low animate-pulse rounded" /></td>)}
                </tr>
              ))
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-surface-low hover:bg-surface/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover bg-surface-low" />
                      : <div className="w-10 h-10 bg-surface-low flex items-center justify-center"><span className="material-symbols-outlined text-ink-faint text-sm">image</span></div>
                    }
                    <div>
                      <div className="font-semibold text-ink">{p.name}</div>
                      {p.colors?.length > 0 && (
                        <div className="text-[10px] text-ink-outline">
                          {p.colors.map((c) => c.name).join(' · ')}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-ink-variant">{p.model_number ?? '—'}</td>
                <td className="px-5 py-4 text-ink-variant">{p.size ?? '—'}</td>
                <td className="px-5 py-4 text-ink-variant">{p.height != null ? `${p.height} mm` : '—'}</td>
                <td className="px-5 py-4 font-semibold">{p.price != null ? `€ ${Number(p.price).toFixed(2)}` : '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    {p.stock_status && <span className={`w-2 h-2 rounded-full ${STOCK_DOT[p.stock_status]}`} />}
                    <span className="text-ink-variant">{p.stock_quantity}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-surface-low text-ink-outline'}`}>
                    {p.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-surface-low transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-ink-variant">edit</span>
                    </button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 hover:bg-surface-low transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-red-400">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-xs text-ink-variant">Seite {page} von {meta.last_page}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-surface-high disabled:opacity-30">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page}
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-surface-high disabled:opacity-30">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl p-8 my-8">
            <h2 className="text-2xl font-extrabold tracking-tighter text-ink font-headline mb-6">
              {modal.product ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label-caps">Name / Titel</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-caps">Modell</label>
                  <input className="input-field" value={form.model_number} onChange={(e) => setForm({ ...form, model_number: e.target.value })} placeholder="z.B. TT541" />
                </div>
                <div>
                  <label className="label-caps">SKU</label>
                  <input className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="ALP-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-caps">Größe</label>
                  <input className="input-field" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="44□20 130" />
                </div>
                <div>
                  <label className="label-caps">Höhe (mm)</label>
                  <input type="number" className="input-field" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="33" />
                </div>
              </div>
              <div>
                <label className="label-caps">Beschreibung</label>
                <textarea className="input-field resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label-caps">Preis (€)</label>
                <input type="number" step="0.01" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>

              {/* Colors with per-color stock + image */}
              <div>
                <label className="label-caps">Farben, Bestand & Bild</label>

                {form.colors.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {form.colors.map((c, i) => (
                      <div key={i} className="border border-surface-low p-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex-1 bg-surface-low px-3 py-2 text-sm text-ink truncate">{c.name}</span>
                          <input
                            type="number" min="0"
                            value={c.stock_quantity}
                            onChange={(e) => updateColor(i, { stock_quantity: e.target.value })}
                            className="input-field w-24 text-sm py-2"
                            placeholder="Menge"
                          />
                          <button type="button" onClick={() => removeColor(i)}
                            className="p-2 text-ink-faint hover:text-red-500 transition-colors shrink-0">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                        {/* Color image */}
                        <div className="flex items-center gap-2 pl-1">
                          {c.preview && (
                            <img src={c.preview} alt="" className="w-10 h-10 object-cover bg-surface-low shrink-0" />
                          )}
                          <label className="flex-1 cursor-pointer">
                            <span className="text-[10px] text-ink-outline uppercase tracking-wider font-semibold">
                              {c.preview ? 'Bild ersetzen' : 'Bild hochladen'}
                            </span>
                            <input
                              type="file" accept="image/*" className="hidden"
                              onChange={(e) => handleColorImage(i, e.target.files?.[0] ?? null)}
                            />
                          </label>
                          {c.preview && (
                            <button type="button"
                              onClick={() => updateColor(i, { preview: null, newImage: null, keep_image: null })}
                              className="p-1 text-ink-faint hover:text-red-500">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new color row */}
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1 text-sm"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                    placeholder="z.B. M. Silber-Schwarz C24"
                  />
                  <input
                    type="number" min="0"
                    className="input-field w-24 text-sm"
                    value={newColorStock}
                    onChange={(e) => setNewColorStock(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                    placeholder="Menge"
                  />
                  <button type="button" onClick={addColor} className="btn-primary px-4 py-2 text-xs">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="label-caps">Kategorien</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categories.map((c) => (
                    <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                      className={`px-3 py-1.5 text-xs font-bold border transition-colors ${form.category_ids.includes(c.id) ? 'bg-brand-200 border-brand-200 text-brand-800' : 'border-surface-low text-ink-variant hover:border-ink-outline'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product image */}
              <div>
                <label className="label-caps">Produktbild (allgemein)</label>
                <input type="file" accept="image/*" className="input-field py-2 text-sm text-ink-variant file:mr-3 file:border-0 file:bg-surface-low file:px-3 file:py-1 file:text-xs file:font-bold file:text-ink cursor-pointer"
                  onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })} />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-brand-500" />
                <label htmlFor="is_active" className="text-sm font-medium text-ink cursor-pointer">Produkt aktiv (sichtbar im Shop)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
              <button onClick={() => setModal({ open: false, product: null })} className="flex-1 py-3 border border-surface-low text-ink-variant hover:bg-surface-low transition-colors text-sm font-semibold">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
