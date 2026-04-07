import { useEffect, useState } from 'react';
import { addressApi } from '../services/api';
import type { AddressData } from '../types';
import toast from 'react-hot-toast';

const EMPTY: AddressData = {
  delivery_company: '',
  delivery_street: '',
  delivery_zip: '',
  delivery_city: '',
  delivery_country: 'Deutschland',
  billing_same_as_delivery: true,
  billing_company: '',
  billing_street: '',
  billing_zip: '',
  billing_city: '',
  billing_country: 'Deutschland',
};

function AddressFields({
  prefix,
  values,
  onChange,
  required,
}: {
  prefix: 'delivery' | 'billing';
  values: AddressData;
  onChange: (key: keyof AddressData, value: string) => void;
  required: boolean;
}) {
  const f = (field: string) => `${prefix}_${field}` as keyof AddressData;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">Firma (optional)</label>
        <input
          type="text"
          value={values[f('company')] as string}
          onChange={(e) => onChange(f('company'), e.target.value)}
          placeholder="Firmenname"
          className="w-full border border-surface-low bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand-300"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">
          Straße und Hausnummer {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={values[f('street')] as string}
          onChange={(e) => onChange(f('street'), e.target.value)}
          placeholder="Musterstraße 12"
          required={required}
          className="w-full border border-surface-low bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand-300"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">
            PLZ {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={values[f('zip')] as string}
            onChange={(e) => onChange(f('zip'), e.target.value)}
            placeholder="12345"
            required={required}
            className="w-full border border-surface-low bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand-300"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">
            Stadt {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={values[f('city')] as string}
            onChange={(e) => onChange(f('city'), e.target.value)}
            placeholder="Berlin"
            required={required}
            className="w-full border border-surface-low bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand-300"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">
          Land {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={values[f('country')] as string}
          onChange={(e) => onChange(f('country'), e.target.value)}
          placeholder="Deutschland"
          required={required}
          className="w-full border border-surface-low bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand-300"
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState<AddressData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    addressApi.get().then(({ data }) => {
      const d = data.data;
      setForm({
        delivery_company: d.delivery_company ?? '',
        delivery_street: d.delivery_street ?? '',
        delivery_zip: d.delivery_zip ?? '',
        delivery_city: d.delivery_city ?? '',
        delivery_country: d.delivery_country ?? 'Deutschland',
        billing_same_as_delivery: d.billing_same_as_delivery ?? true,
        billing_company: d.billing_company ?? '',
        billing_street: d.billing_street ?? '',
        billing_zip: d.billing_zip ?? '',
        billing_city: d.billing_city ?? '',
        billing_country: d.billing_country ?? 'Deutschland',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof AddressData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addressApi.update(form);
      toast.success('Adressen gespeichert.');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-surface-low animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tighter text-ink font-headline">Mein Profil</h1>
        <p className="text-sm text-ink-variant mt-1">Lieferadresse und Rechnungsadresse verwalten</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Delivery address */}
        <div className="bg-white p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-[20px] text-brand-500">local_shipping</span>
            <h2 className="text-base font-extrabold tracking-tight text-ink font-headline">Lieferadresse</h2>
          </div>
          <AddressFields
            prefix="delivery"
            values={form}
            onChange={handleChange}
            required
          />
        </div>

        {/* Billing address toggle */}
        <div className="bg-white p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-[20px] text-brand-500">receipt_long</span>
            <h2 className="text-base font-extrabold tracking-tight text-ink font-headline">Rechnungsadresse</h2>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
            <div
              onClick={() => handleChange('billing_same_as_delivery', !form.billing_same_as_delivery)}
              className={`w-10 h-5 flex items-center rounded-none transition-colors cursor-pointer ${
                form.billing_same_as_delivery ? 'bg-brand-300' : 'bg-surface-low'
              }`}
            >
              <span className={`w-4 h-4 bg-white shadow transition-transform mx-0.5 ${
                form.billing_same_as_delivery ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-sm text-ink font-medium">Identisch mit Lieferadresse</span>
          </label>

          {!form.billing_same_as_delivery && (
            <AddressFields
              prefix="billing"
              values={form}
              onChange={handleChange}
              required={false}
            />
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-200 text-brand-800 text-xs font-black uppercase tracking-[0.15em] hover:bg-brand-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Speichern...' : 'Adressen speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
