import { useEffect, useRef, useState } from 'react';
import { adminSettingsApi, adminCategoryApi, adminSkontoApi, announcementApi } from '../../services/api';
import toast from 'react-hot-toast';

interface CategoryRow {
  id: number;
  name: string;
  products_count: number;
}

interface SkontoTierRow {
  id: number;
  min_order_value: number;
  discount_percent: number;
}

interface SkontoGroupRow {
  id: number;
  name: string;
  users_count: number;
  tiers: SkontoTierRow[];
}

export default function AdminSettingsPage() {
  const [greenMin, setGreenMin] = useState(100);
  const [yellowMin, setYellowMin] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [notificationEmail, setNotificationEmail] = useState('');
  const [notifyOnOrder, setNotifyOnOrder] = useState(false);
  const [notifyOnMessage, setNotifyOnMessage] = useState(false);

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Skonto groups state
  const [skontoGroups, setSkontoGroups] = useState<SkontoGroupRow[]>([]);
  const [skontoLoading, setSkontoLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const editGroupRef = useRef<HTMLInputElement>(null);
  // Per-group new tier form: { [groupId]: { min: string, pct: string } }
  const [newTier, setNewTier] = useState<Record<number, { min: string; pct: string }>>({});
  // Per-tier editing: { [tierId]: { min: string, pct: string } }
  const [editingTier, setEditingTier] = useState<Record<number, { min: string; pct: string }>>({});

  // Announcement
  const [announcement, setAnnouncement] = useState({ enabled: false, title: '', text: '', image_url: null as string | null });
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementImage, setAnnouncementImage] = useState<File | null>(null);
  const [announcementPreview, setAnnouncementPreview] = useState<string | null>(null);
  const announcementImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminSettingsApi.get().then(({ data }) => {
      setGreenMin(data.data.stock_green_min);
      setYellowMin(data.data.stock_yellow_min);
      setNotificationEmail(data.data.notification_email ?? '');
      setNotifyOnOrder(data.data.notify_on_order ?? false);
      setNotifyOnMessage(data.data.notify_on_message ?? false);
    }).finally(() => setLoading(false));
  }, []);

  const loadCategories = () => {
    setCatLoading(true);
    adminCategoryApi.list()
      .then(({ data }) => setCategories(data.data))
      .finally(() => setCatLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const loadSkontoGroups = () => {
    setSkontoLoading(true);
    adminSkontoApi.list()
      .then(({ data }) => setSkontoGroups(data.data))
      .finally(() => setSkontoLoading(false));
  };

  useEffect(() => { loadSkontoGroups(); }, []);

  useEffect(() => {
    announcementApi.get()
      .then(({ data }) => setAnnouncement(data.data))
      .finally(() => setAnnouncementLoading(false));
  }, []);

  const handleAnnouncementImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAnnouncementImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAnnouncementPreview(url);
    }
  };

  const handleSaveAnnouncement = async () => {
    setAnnouncementSaving(true);
    try {
      const fd = new FormData();
      fd.append('enabled', announcement.enabled ? '1' : '0');
      fd.append('title', announcement.title);
      fd.append('text', announcement.text);
      if (announcementImage) fd.append('image', announcementImage);
      await announcementApi.adminUpdate(fd);
      // Refresh to get stored image_url
      const { data } = await announcementApi.get();
      setAnnouncement(data.data);
      setAnnouncementImage(null);
      setAnnouncementPreview(null);
      toast.success('Ankündigung gespeichert.');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.');
    } finally { setAnnouncementSaving(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSettingsApi.update({
        stock_green_min: greenMin,
        stock_yellow_min: yellowMin,
        notification_email: notificationEmail,
        notify_on_order: notifyOnOrder,
        notify_on_message: notifyOnMessage,
      });
      toast.success('Einstellungen gespeichert.');
    } catch {
      toast.error('Fehler beim Speichern.');
    } finally { setSaving(false); }
  };

  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    setAddingCat(true);
    try {
      await adminCategoryApi.create(name);
      setNewCatName('');
      loadCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Erstellen.');
    } finally { setAddingCat(false); }
  };

  const startEdit = (cat: CategoryRow) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const handleUpdateCategory = async (id: number) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await adminCategoryApi.update(id, name);
      setEditingId(null);
      loadCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.');
    }
  };

  const handleDeleteCategory = async (cat: CategoryRow) => {
    if (!confirm(`Kategorie "${cat.name}" wirklich löschen?`)) return;
    try {
      await adminCategoryApi.destroy(cat.id);
      loadCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.');
    }
  };

  // ── Skonto handlers ─────────────────────────────

  const handleAddGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    try {
      await adminSkontoApi.create(name);
      setNewGroupName('');
      loadSkontoGroups();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Erstellen.');
    }
  };

  const startEditGroup = (g: SkontoGroupRow) => {
    setEditingGroupId(g.id);
    setEditingGroupName(g.name);
    setTimeout(() => editGroupRef.current?.focus(), 50);
  };

  const handleUpdateGroup = async (id: number) => {
    const name = editingGroupName.trim();
    if (!name) return;
    try {
      await adminSkontoApi.update(id, name);
      setEditingGroupId(null);
      loadSkontoGroups();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.');
    }
  };

  const handleDeleteGroup = async (g: SkontoGroupRow) => {
    if (!confirm(`Gruppe "${g.name}" wirklich löschen?`)) return;
    try {
      await adminSkontoApi.destroy(g.id);
      loadSkontoGroups();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.');
    }
  };

  const handleAddTier = async (groupId: number) => {
    const t = newTier[groupId];
    if (!t?.min || !t?.pct) return;
    try {
      await adminSkontoApi.addTier(groupId, parseFloat(t.min), parseFloat(t.pct));
      setNewTier((prev) => ({ ...prev, [groupId]: { min: '', pct: '' } }));
      loadSkontoGroups();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Hinzufügen.');
    }
  };

  const handleUpdateTier = async (groupId: number, tierId: number) => {
    const t = editingTier[tierId];
    if (!t) return;
    try {
      await adminSkontoApi.updateTier(groupId, tierId, parseFloat(t.min), parseFloat(t.pct));
      setEditingTier((prev) => { const n = { ...prev }; delete n[tierId]; return n; });
      loadSkontoGroups();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.');
    }
  };

  const handleDeleteTier = async (groupId: number, tierId: number) => {
    try {
      await adminSkontoApi.destroyTier(groupId, tierId);
      loadSkontoGroups();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.');
    }
  };

  return (
    <div className="max-w-lg space-y-8">
      <div className="mb-2">
        <h1 className="text-4xl font-extrabold tracking-tighter text-ink font-headline">Einstellungen</h1>
        <p className="text-ink-variant mt-1">Systemweite Konfiguration</p>
      </div>

      {/* ── Lagerbestand-Ampel ─────────────────────── */}
      <div className="bg-white p-8">
        <h2 className="text-lg font-bold text-ink font-headline mb-1">Lagerbestand-Ampel</h2>
        <p className="text-sm text-ink-variant mb-6">Legt fest, ab welcher Stückzahl welche Farbe angezeigt wird.</p>

        {loading ? (
          <div className="space-y-4">
            <div className="h-16 bg-surface-low animate-pulse" />
            <div className="h-16 bg-surface-low animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-stretch gap-0 text-xs font-bold text-center overflow-hidden border border-surface-low">
              <div className="flex-1 bg-red-50 text-red-700 py-3 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-1" />
                Rot
                <div className="font-normal text-[10px] mt-0.5">0 – {yellowMin - 1} Stk.</div>
              </div>
              <div className="flex-1 bg-amber-50 text-amber-700 py-3 px-2 border-x border-surface-low">
                <div className="w-3 h-3 rounded-full bg-amber-400 mx-auto mb-1" />
                Gelb
                <div className="font-normal text-[10px] mt-0.5">{yellowMin} – {greenMin - 1} Stk.</div>
              </div>
              <div className="flex-1 bg-green-50 text-green-700 py-3 px-2">
                <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1" />
                Grün
                <div className="font-normal text-[10px] mt-0.5">≥ {greenMin} Stk.</div>
              </div>
            </div>

            <div>
              <label className="label-caps">Gelb ab (min. Stückzahl)</label>
              <div className="flex items-center gap-3">
                <input type="number" min={1} value={yellowMin}
                  onChange={(e) => setYellowMin(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-field w-32" />
                <span className="text-sm text-ink-variant">Stück → gelbe Ampel</span>
              </div>
            </div>

            <div>
              <label className="label-caps">Grün ab (min. Stückzahl)</label>
              <div className="flex items-center gap-3">
                <input type="number" min={yellowMin + 1} value={greenMin}
                  onChange={(e) => setGreenMin(Math.max(yellowMin + 1, parseInt(e.target.value) || yellowMin + 1))}
                  className="input-field w-32" />
                <span className="text-sm text-ink-variant">Stück → grüne Ampel</span>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-3 disabled:opacity-50">
              {saving ? 'Speichern...' : 'Einstellungen speichern'}
            </button>
          </div>
        )}
      </div>

      {/* ── E-Mail-Benachrichtigungen ──────────────── */}
      <div className="bg-white p-8">
        <h2 className="text-lg font-bold text-ink font-headline mb-1">E-Mail-Benachrichtigungen</h2>
        <p className="text-sm text-ink-variant mb-6">Empfänger-Adresse und Auslöser für automatische Mails.</p>

        {loading ? (
          <div className="space-y-3">
            <div className="h-10 bg-surface-low animate-pulse" />
            <div className="h-10 bg-surface-low animate-pulse" />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">
                Empfänger-E-Mail
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="admin@beispiel.de"
                className="input-field w-full"
              />
            </div>

            <div className="space-y-3 pt-1">
              {[
                { label: 'Bei neuer Bestellung', value: notifyOnOrder, set: setNotifyOnOrder },
                { label: 'Bei neuer Nachricht', value: notifyOnMessage, set: setNotifyOnMessage },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => set(!value)}
                    className={`w-10 h-5 flex items-center rounded-none transition-colors cursor-pointer ${value ? 'bg-brand-300' : 'bg-surface-low'}`}
                  >
                    <span className={`w-4 h-4 bg-white shadow transition-transform mx-0.5 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm text-ink font-medium">{label}</span>
                </label>
              ))}
            </div>

            <p className="text-[11px] text-ink-faint">
              Mails werden nur versendet wenn eine Empfänger-Adresse eingetragen und der jeweilige Toggle aktiv ist.
              Der Versand nutzt die in <code className="bg-surface-low px-1">.env</code> konfigurierte Mail-Verbindung.
            </p>
          </div>
        )}
      </div>

      {/* ── Skonto-Gruppen ─────────────────────────── */}
      <div className="bg-white p-8">
        <h2 className="text-lg font-bold text-ink font-headline mb-1">Skonto-Gruppen</h2>
        <p className="text-sm text-ink-variant mb-6">Rabattgruppen und Staffelkonditionen verwalten.</p>

        {/* New group */}
        <div className="flex gap-2 mb-6">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Neue Gruppe..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
          />
          <button
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
            className="btn-primary px-4 py-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        {skontoLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface-low animate-pulse" />)}
          </div>
        ) : skontoGroups.length === 0 ? (
          <p className="text-sm text-ink-faint py-4 text-center">Noch keine Gruppen.</p>
        ) : (
          <div className="space-y-4">
            {skontoGroups.map((group) => (
              <div key={group.id} className="border border-surface-low">
                {/* Group header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-surface/50">
                  {editingGroupId === group.id ? (
                    <input
                      ref={editGroupRef}
                      className="input-field flex-1 text-sm py-1"
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateGroup(group.id);
                        if (e.key === 'Escape') setEditingGroupId(null);
                      }}
                      onBlur={() => handleUpdateGroup(group.id)}
                    />
                  ) : (
                    <span className="flex-1 text-sm font-bold text-ink">{group.name}</span>
                  )}
                  <span className="text-[10px] text-ink-outline shrink-0">{group.users_count} Nutzer</span>
                  {editingGroupId === group.id ? (
                    <button onClick={() => setEditingGroupId(null)} className="p-1 text-ink-faint hover:text-ink">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  ) : (
                    <button onClick={() => startEditGroup(group)} className="p-1 text-ink-faint hover:text-ink">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  )}
                  <button onClick={() => handleDeleteGroup(group)} className="p-1 text-ink-faint hover:text-red-500">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>

                {/* Tiers */}
                <div className="px-4 py-3 space-y-2">
                  {/* Header row */}
                  <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline mb-1">
                    <span>Ab Bestellwert (€)</span>
                    <span>Rabatt (%)</span>
                    <span />
                    <span />
                  </div>

                  {group.tiers.length === 0 && (
                    <p className="text-xs text-ink-faint italic">Noch keine Staffeln.</p>
                  )}

                  {group.tiers.map((tier) => (
                    <div key={tier.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                      {editingTier[tier.id] ? (
                        <>
                          <input
                            type="number" min="0" step="0.01"
                            className="input-field text-sm py-1.5"
                            value={editingTier[tier.id].min}
                            onChange={(e) => setEditingTier((p) => ({ ...p, [tier.id]: { ...p[tier.id], min: e.target.value } }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTier(group.id, tier.id)}
                          />
                          <input
                            type="number" min="0.01" max="100" step="0.01"
                            className="input-field text-sm py-1.5"
                            value={editingTier[tier.id].pct}
                            onChange={(e) => setEditingTier((p) => ({ ...p, [tier.id]: { ...p[tier.id], pct: e.target.value } }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTier(group.id, tier.id)}
                          />
                          <button onClick={() => handleUpdateTier(group.id, tier.id)} className="p-1 text-brand-500 hover:text-brand-700">
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button onClick={() => setEditingTier((p) => { const n = { ...p }; delete n[tier.id]; return n; })} className="p-1 text-ink-faint hover:text-ink">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-ink">ab € {Number(tier.min_order_value).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                          <span className="text-sm font-semibold text-brand-700">{Number(tier.discount_percent).toFixed(2)} %</span>
                          <button
                            onClick={() => setEditingTier((p) => ({ ...p, [tier.id]: { min: String(tier.min_order_value), pct: String(tier.discount_percent) } }))}
                            className="p-1 text-ink-faint hover:text-ink"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => handleDeleteTier(group.id, tier.id)} className="p-1 text-ink-faint hover:text-red-500">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add tier row */}
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center pt-1 border-t border-surface-low mt-2">
                    <input
                      type="number" min="0" step="0.01"
                      className="input-field text-sm py-1.5"
                      placeholder="Ab € ..."
                      value={newTier[group.id]?.min ?? ''}
                      onChange={(e) => setNewTier((p) => ({ ...p, [group.id]: { ...p[group.id], min: e.target.value, pct: p[group.id]?.pct ?? '' } }))}
                    />
                    <input
                      type="number" min="0.01" max="100" step="0.01"
                      className="input-field text-sm py-1.5"
                      placeholder="Rabatt %"
                      value={newTier[group.id]?.pct ?? ''}
                      onChange={(e) => setNewTier((p) => ({ ...p, [group.id]: { ...p[group.id], pct: e.target.value, min: p[group.id]?.min ?? '' } }))}
                    />
                    <button
                      onClick={() => handleAddTier(group.id)}
                      disabled={!newTier[group.id]?.min || !newTier[group.id]?.pct}
                      className="p-1.5 text-brand-500 hover:text-brand-700 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Kategorien ─────────────────────────────── */}
      <div className="bg-white p-8">
        <h2 className="text-lg font-bold text-ink font-headline mb-1">Kategorien</h2>
        <p className="text-sm text-ink-variant mb-6">Material- und Produktkategorien verwalten.</p>

        {/* Add new */}
        <div className="flex gap-2 mb-4">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Neue Kategorie..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            disabled={addingCat || !newCatName.trim()}
            className="btn-primary px-4 py-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        {/* List */}
        {catLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-surface-low animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-ink-faint py-4 text-center">Noch keine Kategorien.</p>
        ) : (
          <div className="divide-y divide-surface-low">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 py-2.5">
                {editingId === cat.id ? (
                  <input
                    ref={editInputRef}
                    className="input-field flex-1 text-sm py-1.5"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateCategory(cat.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => handleUpdateCategory(cat.id)}
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-ink">{cat.name}</span>
                )}
                <span className="text-[10px] text-ink-outline shrink-0">{cat.products_count} Produkte</span>
                {editingId === cat.id ? (
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-ink-faint hover:text-ink transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                ) : (
                  <button onClick={() => startEdit(cat)} className="p-1.5 text-ink-faint hover:text-ink transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                )}
                <button onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-ink-faint hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Ankündigung / Hero-Banner ───────────────── */}
      <div className="bg-white p-8">
        <h2 className="text-lg font-bold text-ink font-headline mb-1">Ankündigung</h2>
        <p className="text-sm text-ink-variant mb-6">Wird als Hero-Banner oben auf der Startseite angezeigt.</p>

        {announcementLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-surface-low animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setAnnouncement((a) => ({ ...a, enabled: !a.enabled }))}
                className={`w-10 h-5 flex items-center rounded-none transition-colors cursor-pointer ${
                  announcement.enabled ? 'bg-brand-300' : 'bg-surface-low'
                }`}
              >
                <span className={`w-4 h-4 bg-white shadow transition-transform mx-0.5 ${
                  announcement.enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
              <span className="text-sm font-medium text-ink">
                {announcement.enabled ? 'Aktiv – wird auf der Startseite angezeigt' : 'Inaktiv – nicht sichtbar'}
              </span>
            </label>

            {/* Title */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">Titel</label>
              <input
                type="text"
                value={announcement.title}
                onChange={(e) => setAnnouncement((a) => ({ ...a, title: e.target.value }))}
                placeholder="Ankündigung Titel"
                className="input-field w-full"
              />
            </div>

            {/* Text */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">Text</label>
              <textarea
                rows={3}
                value={announcement.text}
                onChange={(e) => setAnnouncement((a) => ({ ...a, text: e.target.value }))}
                placeholder="Optionaler Beschreibungstext..."
                className="input-field w-full resize-none"
              />
            </div>

            {/* Image */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-2">Bild</label>
              {(announcementPreview ?? announcement.image_url) && (
                <img
                  src={announcementPreview ?? announcement.image_url!}
                  alt="Vorschau"
                  className="w-full max-h-48 object-cover mb-3"
                />
              )}
              <input
                ref={announcementImageRef}
                type="file"
                accept="image/*"
                onChange={handleAnnouncementImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => announcementImageRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-surface-low text-sm text-ink-variant hover:border-ink-outline hover:text-ink transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">upload</span>
                {announcement.image_url || announcementPreview ? 'Bild ersetzen' : 'Bild hochladen'}
              </button>
            </div>

            <button
              onClick={handleSaveAnnouncement}
              disabled={announcementSaving}
              className="btn-primary px-5 py-2.5 disabled:opacity-50"
            >
              {announcementSaving ? 'Speichern...' : 'Ankündigung speichern'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
