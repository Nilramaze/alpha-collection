import { useEffect, useState } from 'react';
import { adminUserApi } from '../../services/api';
import toast from 'react-hot-toast';

interface SkontoGroup { id: number; name: string; }
interface User {
  id: number; name: string; email: string; role: string;
  is_active: boolean;
  skonto_group: { id: number; name: string } | null;
  delivery_company: string | null;
  delivery_street: string | null;
  delivery_zip: string | null;
  delivery_city: string | null;
  delivery_country: string | null;
  billing_same_as_delivery: boolean;
  billing_company: string | null;
  billing_street: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string | null;
  created_at: string;
}

function UserAddressBlock({ user }: { user: User }) {
  const hasDelivery = !!user.delivery_street;
  const hasBilling = !user.billing_same_as_delivery && !!user.billing_street;

  return (
    <div className="pt-4 border-t border-surface-low space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Adressen</p>
      {!hasDelivery ? (
        <p className="text-xs text-ink-faint italic">Keine Adresse hinterlegt</p>
      ) : (
        <>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-faint mb-1">Lieferadresse</p>
            <p className="text-sm text-ink">
              {[user.delivery_company, user.delivery_street, `${user.delivery_zip ?? ''} ${user.delivery_city ?? ''}`.trim(), user.delivery_country].filter(Boolean).join(', ')}
            </p>
          </div>
          {hasBilling ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-faint mb-1">Rechnungsadresse</p>
              <p className="text-sm text-ink">
                {[user.billing_company, user.billing_street, `${user.billing_zip ?? ''} ${user.billing_city ?? ''}`.trim(), user.billing_country].filter(Boolean).join(', ')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-ink-faint">Rechnungsadresse identisch mit Lieferadresse</p>
          )}
        </>
      )}
    </div>
  );
}

const emptyForm = { name: '', email: '', password: '', role: 'user', skonto_group_id: '' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [skontoGroups, setSkontoGroups] = useState<SkontoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminUserApi.list({ search });
      setUsers(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { adminUserApi.skontoGroups().then(({ data }) => setSkontoGroups(data.data)); }, []);
  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setForm(emptyForm); setModal({ open: true, user: null }); };
  const openEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, skonto_group_id: u.skonto_group?.id?.toString() ?? '' });
    setModal({ open: true, user: u });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = { ...form, skonto_group_id: form.skonto_group_id || null };
      if (!payload.password) delete payload.password;
      if (modal.user) {
        await adminUserApi.update(modal.user.id, payload);
        toast.success('Benutzer aktualisiert.');
      } else {
        await adminUserApi.create(payload);
        toast.success('Benutzer erstellt.');
      }
      setModal({ open: false, user: null });
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (u: User) => {
    try {
      await adminUserApi.update(u.id, { is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x));
      toast.success(u.is_active ? 'Benutzer deaktiviert.' : 'Benutzer aktiviert.');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler.');
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Benutzer "${u.name}" wirklich löschen?`)) return;
    await adminUserApi.destroy(u.id);
    toast.success('Benutzer gelöscht.');
    load();
  };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-ink font-headline">Benutzerverwaltung</h1>
          <p className="text-ink-variant mt-1">{users.length} Händler & Admins</p>
        </div>
        <button onClick={openCreate} className="btn-primary px-5 py-3">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Neu anlegen
        </button>
      </div>

      <div className="bg-white mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-[18px]">search</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Name oder E-Mail suchen..."
            className="input-field pl-10 py-3 text-sm w-full max-w-sm" />
        </div>
      </div>

      <div className="bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-low">
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Name</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">E-Mail</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Rolle</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Skonto-Gruppe</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Erstellt</th>
              <th className="text-center px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">Aktiv</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-surface-low">
                  {[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-low animate-pulse rounded" /></td>)}
                </tr>
              ))
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-surface-low hover:bg-surface/50 transition-colors">
                <td className="px-5 py-4 font-semibold text-ink">{u.name}</td>
                <td className="px-5 py-4 text-ink-variant">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${u.role === 'admin' ? 'bg-brand-200/20 text-brand-600' : 'bg-surface-low text-ink-outline'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Händler'}
                  </span>
                </td>
                <td className="px-5 py-4 text-ink-variant">{u.skonto_group?.name ?? '—'}</td>
                <td className="px-5 py-4 text-ink-outline">{new Date(u.created_at).toLocaleDateString('de-DE')}</td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleToggleActive(u)}
                    title={u.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    className="inline-flex items-center justify-center"
                  >
                    <div className={`w-9 h-5 flex items-center rounded-none transition-colors cursor-pointer ${u.is_active ? 'bg-brand-300' : 'bg-surface-low'}`}>
                      <span className={`w-4 h-4 bg-white shadow transition-transform mx-0.5 ${u.is_active ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                    </div>
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-surface-low transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-ink-variant">edit</span>
                    </button>
                    <button onClick={() => handleDelete(u)} className="p-1.5 hover:bg-surface-low transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-red-400">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8">
            <h2 className="text-2xl font-extrabold tracking-tighter text-ink font-headline mb-6">
              {modal.user ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label-caps">Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label-caps">E-Mail</label>
                <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label-caps">Passwort {modal.user && <span className="normal-case font-normal text-ink-outline">(leer lassen = unverändert)</span>}</label>
                <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div>
                <label className="label-caps">Rolle</label>
                <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="user">Händler</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="label-caps">Skonto-Gruppe</label>
                <select className="input-field" value={form.skonto_group_id} onChange={(e) => setForm({ ...form, skonto_group_id: e.target.value })}>
                  <option value="">Keine</option>
                  {skontoGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
            {modal.user && <UserAddressBlock user={modal.user} />}

            <div className="flex gap-3 mt-8">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
              <button onClick={() => setModal({ open: false, user: null })} className="flex-1 py-3 border border-surface-low text-ink-variant hover:bg-surface-low transition-colors text-sm font-semibold">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
