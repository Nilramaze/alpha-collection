import { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { adminSettingsApi, adminCategoryApi, adminSkontoApi, adminAnnouncementApi, adminShippingApi, adminCertificateApi } from '../../services/api';
import type { Announcement, Certificate, ShippingOption } from '../../types';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────
// Sortable card component for each announcement row
// ─────────────────────────────────────────────────────────────────
function SortableAnnouncementCard({
  ann, isEditing, onToggle, onEdit, onDelete,
}: {
  ann: Announcement;
  isEditing: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ann.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white border transition-colors ${
        isEditing ? 'border-brand-300' : 'border-surface-low'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-ink-faint hover:text-ink cursor-grab active:cursor-grabbing p-0.5 shrink-0"
        tabIndex={-1}
      >
        <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
      </button>

      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${ann.enabled ? 'bg-brand-300' : 'bg-surface-dim'}`} />

      {/* Title */}
      <span className="flex-1 text-sm font-semibold text-ink truncate min-w-0">
        {ann.title || <span className="text-ink-faint italic">Ohne Titel</span>}
      </span>

      {/* Enabled toggle */}
      <div
        onClick={() => onToggle(!ann.enabled)}
        className={`w-9 h-5 flex items-center rounded-none transition-colors cursor-pointer shrink-0 ${
          ann.enabled ? 'bg-brand-300' : 'bg-surface-low'
        }`}
      >
        <span className={`w-4 h-4 bg-white shadow transition-transform mx-0.5 ${
          ann.enabled ? 'translate-x-[14px]' : 'translate-x-0'
        }`} />
      </div>

      {/* Edit */}
      <button onClick={onEdit} className="p-1.5 text-ink-faint hover:text-ink transition-colors shrink-0">
        <span className="material-symbols-outlined text-[18px]">{isEditing ? 'expand_less' : 'edit'}</span>
      </button>

      {/* Delete */}
      <button onClick={onDelete} className="p-1.5 text-ink-faint hover:text-red-500 transition-colors shrink-0">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface CategoryRow { id: number; name: string; products_count: number; }
interface SkontoTierRow { id: number; min_order_value: number; discount_percent: number; }
interface SkontoGroupRow { id: number; name: string; users_count: number; tiers: SkontoTierRow[]; }

interface EditForm {
  title: string;
  text: string;
  title_size: string;
  text_size: string;
  background_color: string;
  image_url: string | null;
  gallery_images: (string | null)[];
}

const EMPTY_GALLERY: (string | null)[] = [null, null, null, null, null];
const EMPTY_FORM: EditForm = {
  title: '', text: '', title_size: '48', text_size: '18',
  background_color: '#0e0e0e', image_url: null,
  gallery_images: [...EMPTY_GALLERY],
};

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  // ── Settings ──────────────────────────────────────────────────
  const [greenMin, setGreenMin] = useState(100);
  const [yellowMin, setYellowMin] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notifyOnOrder, setNotifyOnOrder] = useState(false);
  const [notifyOnMessage, setNotifyOnMessage] = useState(false);

  // ── Categories ────────────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // ── Skonto groups ─────────────────────────────────────────────
  const [skontoGroups, setSkontoGroups] = useState<SkontoGroupRow[]>([]);
  const [skontoLoading, setSkontoLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const editGroupRef = useRef<HTMLInputElement>(null);
  const [newTier, setNewTier] = useState<Record<number, { min: string; pct: string }>>({});
  const [editingTier, setEditingTier] = useState<Record<number, { min: string; pct: string }>>({});

  // ── Announcements ─────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [editingAnnId, setEditingAnnId] = useState<number | 'new' | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editGalleryFiles, setEditGalleryFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [editGalleryPreviews, setEditGalleryPreviews] = useState<(string | null)[]>([...EMPTY_GALLERY]);
  const [editGalleryRemove, setEditGalleryRemove] = useState<boolean[]>([false, false, false, false, false]);
  const [editSaving, setEditSaving] = useState(false);
  const editImageRef = useRef<HTMLInputElement>(null);
  const editGalleryRef1 = useRef<HTMLInputElement>(null);
  const editGalleryRef2 = useRef<HTMLInputElement>(null);
  const editGalleryRef3 = useRef<HTMLInputElement>(null);
  const editGalleryRef4 = useRef<HTMLInputElement>(null);
  const editGalleryRef5 = useRef<HTMLInputElement>(null);
  const editGalleryRefs = [editGalleryRef1, editGalleryRef2, editGalleryRef3, editGalleryRef4, editGalleryRef5];

  // ── Shipping Options ──────────────────────────────────────────
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [editingShipId, setEditingShipId] = useState<number | 'new' | null>(null);
  const [shipForm, setShipForm] = useState({ name: '', price: '0', min_order_value: '0', max_order_value: '' });
  const [shipImageFile, setShipImageFile] = useState<File | null>(null);
  const [shipImagePreview, setShipImagePreview] = useState<string | null>(null);
  const [shipSaving, setShipSaving] = useState(false);
  const shipImageRef = useRef<HTMLInputElement>(null);

  // ── Certificates ──────────────────────────────────────────────
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certLoading, setCertLoading] = useState(true);
  const [certUploading, setCertUploading] = useState(false);
  const [certName, setCertName] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const certFileRef = useRef<HTMLInputElement>(null);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [editingCertName, setEditingCertName] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Data loading ───────────────────────────────────────────────
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
    adminCategoryApi.list().then(({ data }) => setCategories(data.data)).finally(() => setCatLoading(false));
  };
  useEffect(() => { loadCategories(); }, []);

  const loadSkontoGroups = () => {
    setSkontoLoading(true);
    adminSkontoApi.list().then(({ data }) => setSkontoGroups(data.data)).finally(() => setSkontoLoading(false));
  };
  useEffect(() => { loadSkontoGroups(); }, []);

  const loadAnnouncements = () => {
    setAnnLoading(true);
    adminAnnouncementApi.list().then(({ data }) => setAnnouncements(data.data)).finally(() => setAnnLoading(false));
  };
  useEffect(() => { loadAnnouncements(); }, []);

  const loadShippingOptions = () => {
    setShippingLoading(true);
    adminShippingApi.list().then(({ data }) => setShippingOptions(data.data)).finally(() => setShippingLoading(false));
  };
  useEffect(() => { loadShippingOptions(); }, []);

  const loadCertificates = () => {
    setCertLoading(true);
    adminCertificateApi.list().then(({ data }) => setCertificates(data.data)).finally(() => setCertLoading(false));
  };
  useEffect(() => { loadCertificates(); }, []);

  // ── Settings handlers ──────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSettingsApi.update({ stock_green_min: greenMin, stock_yellow_min: yellowMin,
        notification_email: notificationEmail, notify_on_order: notifyOnOrder, notify_on_message: notifyOnMessage });
      toast.success('Einstellungen gespeichert.');
    } catch { toast.error('Fehler beim Speichern.'); } finally { setSaving(false); }
  };

  // ── Category handlers ──────────────────────────────────────────
  const handleAddCategory = async () => {
    const name = newCatName.trim(); if (!name) return;
    setAddingCat(true);
    try { await adminCategoryApi.create(name); setNewCatName(''); loadCategories(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Erstellen.'); }
    finally { setAddingCat(false); }
  };
  const startEdit = (cat: CategoryRow) => { setEditingId(cat.id); setEditingName(cat.name); setTimeout(() => editInputRef.current?.focus(), 50); };
  const handleUpdateCategory = async (id: number) => {
    const name = editingName.trim(); if (!name) return;
    try { await adminCategoryApi.update(id, name); setEditingId(null); loadCategories(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.'); }
  };
  const handleDeleteCategory = async (cat: CategoryRow) => {
    if (!confirm(`Kategorie "${cat.name}" wirklich löschen?`)) return;
    try { await adminCategoryApi.destroy(cat.id); loadCategories(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.'); }
  };

  // ── Skonto handlers ────────────────────────────────────────────
  const handleAddGroup = async () => {
    const name = newGroupName.trim(); if (!name) return;
    try { await adminSkontoApi.create(name); setNewGroupName(''); loadSkontoGroups(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Erstellen.'); }
  };
  const startEditGroup = (g: SkontoGroupRow) => { setEditingGroupId(g.id); setEditingGroupName(g.name); setTimeout(() => editGroupRef.current?.focus(), 50); };
  const handleUpdateGroup = async (id: number) => {
    const name = editingGroupName.trim(); if (!name) return;
    try { await adminSkontoApi.update(id, name); setEditingGroupId(null); loadSkontoGroups(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.'); }
  };
  const handleDeleteGroup = async (g: SkontoGroupRow) => {
    if (!confirm(`Gruppe "${g.name}" wirklich löschen?`)) return;
    try { await adminSkontoApi.destroy(g.id); loadSkontoGroups(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.'); }
  };
  const handleAddTier = async (groupId: number) => {
    const t = newTier[groupId]; if (!t?.min || !t?.pct) return;
    try { await adminSkontoApi.addTier(groupId, parseFloat(t.min), parseFloat(t.pct)); setNewTier((p) => ({ ...p, [groupId]: { min: '', pct: '' } })); loadSkontoGroups(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Hinzufügen.'); }
  };
  const handleUpdateTier = async (groupId: number, tierId: number) => {
    const t = editingTier[tierId]; if (!t) return;
    try { await adminSkontoApi.updateTier(groupId, tierId, parseFloat(t.min), parseFloat(t.pct)); setEditingTier((p) => { const n = { ...p }; delete n[tierId]; return n; }); loadSkontoGroups(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.'); }
  };
  const handleDeleteTier = async (groupId: number, tierId: number) => {
    try { await adminSkontoApi.destroyTier(groupId, tierId); loadSkontoGroups(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.'); }
  };

  // ── Announcement handlers ──────────────────────────────────────
  const openEditAnn = (ann: Announcement | null) => {
    setEditImageFile(null); setEditImagePreview(null);
    setEditGalleryFiles([null, null, null, null, null]);
    setEditGalleryPreviews([...EMPTY_GALLERY]);
    setEditGalleryRemove([false, false, false, false, false]);
    if (ann) {
      setEditingAnnId(ann.id);
      const gallery = ann.gallery_images?.length === 5 ? ann.gallery_images : [...EMPTY_GALLERY];
      setEditForm({ title: ann.title, text: ann.text ?? '', title_size: ann.title_size, text_size: ann.text_size, background_color: ann.background_color, image_url: ann.image_url, gallery_images: gallery });
    } else {
      setEditingAnnId('new');
      setEditForm({ ...EMPTY_FORM, gallery_images: [...EMPTY_GALLERY] });
    }
  };

  const closeEditAnn = () => { setEditingAnnId(null); };

  const handleToggleAnn = async (ann: Announcement, enabled: boolean) => {
    setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, enabled } : a));
    try { await adminAnnouncementApi.toggle(ann.id, enabled); }
    catch { loadAnnouncements(); toast.error('Fehler beim Aktualisieren.'); }
  };

  const handleDeleteAnn = async (ann: Announcement) => {
    if (!confirm(`Ankündigung "${ann.title || 'Ohne Titel'}" wirklich löschen?`)) return;
    try {
      await adminAnnouncementApi.destroy(ann.id);
      setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
      if (editingAnnId === ann.id) setEditingAnnId(null);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.'); }
  };

  const handleSaveAnn = async () => {
    if (!editForm) return;
    setEditSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('text', editForm.text);
      fd.append('title_size', editForm.title_size);
      fd.append('text_size', editForm.text_size);
      fd.append('background_color', editForm.background_color);
      if (editImageFile) fd.append('image', editImageFile);
      editGalleryFiles.forEach((file, i) => { if (file) fd.append(`gallery_${i + 1}`, file); });
      editGalleryRemove.forEach((remove, i) => { if (remove) fd.append(`remove_gallery_${i + 1}`, '1'); });
      if (editingAnnId === 'new') {
        await adminAnnouncementApi.create(fd);
      } else {
        await adminAnnouncementApi.update(editingAnnId as number, fd);
      }
      await loadAnnouncements();
      setEditingAnnId(null);
      toast.success('Ankündigung gespeichert.');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.');
    } finally { setEditSaving(false); }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = announcements.findIndex(a => a.id === active.id);
    const newIdx = announcements.findIndex(a => a.id === over.id);
    const reordered = arrayMove(announcements, oldIdx, newIdx);
    setAnnouncements(reordered);
    try { await adminAnnouncementApi.reorder(reordered.map(a => a.id)); }
    catch { loadAnnouncements(); }
  };

  // ── Shipping handlers ──────────────────────────────────────────
  const EMPTY_SHIP = { name: '', price: '0', min_order_value: '0', max_order_value: '' };

  const openEditShip = (opt: ShippingOption | null) => {
    setShipImageFile(null); setShipImagePreview(null);
    if (opt) {
      setEditingShipId(opt.id);
      setShipForm({ name: opt.name, price: String(opt.price), min_order_value: String(opt.min_order_value), max_order_value: opt.max_order_value != null ? String(opt.max_order_value) : '' });
    } else {
      setEditingShipId('new');
      setShipForm(EMPTY_SHIP);
    }
  };

  const closeEditShip = () => setEditingShipId(null);

  const handleToggleShip = async (opt: ShippingOption, active: boolean) => {
    setShippingOptions(prev => prev.map(s => s.id === opt.id ? { ...s, active } : s));
    try { await adminShippingApi.toggle(opt.id, active); }
    catch { loadShippingOptions(); }
  };

  const handleDeleteShip = async (opt: ShippingOption) => {
    if (!confirm(`Versandoption "${opt.name}" wirklich löschen?`)) return;
    try { await adminShippingApi.destroy(opt.id); setShippingOptions(prev => prev.filter(s => s.id !== opt.id)); if (editingShipId === opt.id) setEditingShipId(null); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.'); }
  };

  const handleSaveShip = async () => {
    if (!shipForm.name.trim()) return;
    setShipSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', shipForm.name);
      fd.append('price', shipForm.price);
      fd.append('min_order_value', shipForm.min_order_value || '0');
      if (shipForm.max_order_value) fd.append('max_order_value', shipForm.max_order_value);
      if (shipImageFile) fd.append('image', shipImageFile);
      if (editingShipId === 'new') { await adminShippingApi.create(fd); }
      else { await adminShippingApi.update(editingShipId as number, fd); }
      await loadShippingOptions();
      setEditingShipId(null);
      toast.success('Versandoption gespeichert.');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Speichern.'); }
    finally { setShipSaving(false); }
  };

  // ── Certificate handlers ────────────────────────────────────────
  const handleUploadCert = async () => {
    if (!certName.trim() || !certFile) return;
    setCertUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', certName.trim());
      fd.append('file', certFile);
      await adminCertificateApi.create(fd);
      setCertName(''); setCertFile(null);
      if (certFileRef.current) certFileRef.current.value = '';
      await loadCertificates();
      toast.success('Zertifikat hochgeladen.');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Hochladen.'); }
    finally { setCertUploading(false); }
  };

  const handleUpdateCertName = async (id: number) => {
    const name = editingCertName.trim(); if (!name) return;
    try { await adminCertificateApi.update(id, name); setEditingCertId(null); await loadCertificates(); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler.'); }
  };

  const handleDeleteCert = async (cert: Certificate) => {
    if (!confirm(`"${cert.name}" wirklich löschen?`)) return;
    try { await adminCertificateApi.destroy(cert.id); setCertificates(prev => prev.filter(c => c.id !== cert.id)); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Fehler beim Löschen.'); }
  };

  // ── Announcement edit form helpers ─────────────────────────────
  const setEF = (patch: Partial<EditForm>) => setEditForm(f => ({ ...f, ...patch }));

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEditImageFile(file);
    setEditImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryFileChange = (i: number, file: File | null) => {
    if (!file) return;
    const f = [...editGalleryFiles]; f[i] = file; setEditGalleryFiles(f);
    const p = [...editGalleryPreviews]; p[i] = URL.createObjectURL(file); setEditGalleryPreviews(p);
    const r = [...editGalleryRemove]; r[i] = false; setEditGalleryRemove(r);
  };

  const handleGalleryRemove = (i: number) => {
    const r = [...editGalleryRemove]; r[i] = true; setEditGalleryRemove(r);
    const f = [...editGalleryFiles]; f[i] = null; setEditGalleryFiles(f);
    const p = [...editGalleryPreviews]; p[i] = null; setEditGalleryPreviews(p);
  };

  // ─────────────────────────────────────────────────────────────
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
          <div className="space-y-4"><div className="h-16 bg-surface-low animate-pulse" /><div className="h-16 bg-surface-low animate-pulse" /></div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-stretch gap-0 text-xs font-bold text-center overflow-hidden border border-surface-low">
              <div className="flex-1 bg-red-50 text-red-700 py-3 px-2"><div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-1" />Rot<div className="font-normal text-[10px] mt-0.5">0 – {yellowMin - 1} Stk.</div></div>
              <div className="flex-1 bg-amber-50 text-amber-700 py-3 px-2 border-x border-surface-low"><div className="w-3 h-3 rounded-full bg-amber-400 mx-auto mb-1" />Gelb<div className="font-normal text-[10px] mt-0.5">{yellowMin} – {greenMin - 1} Stk.</div></div>
              <div className="flex-1 bg-green-50 text-green-700 py-3 px-2"><div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1" />Grün<div className="font-normal text-[10px] mt-0.5">≥ {greenMin} Stk.</div></div>
            </div>
            <div><label className="label-caps">Gelb ab (min. Stückzahl)</label><div className="flex items-center gap-3"><input type="number" min={1} value={yellowMin} onChange={(e) => setYellowMin(Math.max(1, parseInt(e.target.value) || 1))} className="input-field w-32" /><span className="text-sm text-ink-variant">Stück → gelbe Ampel</span></div></div>
            <div><label className="label-caps">Grün ab (min. Stückzahl)</label><div className="flex items-center gap-3"><input type="number" min={yellowMin + 1} value={greenMin} onChange={(e) => setGreenMin(Math.max(yellowMin + 1, parseInt(e.target.value) || yellowMin + 1))} className="input-field w-32" /><span className="text-sm text-ink-variant">Stück → grüne Ampel</span></div></div>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-3 disabled:opacity-50">{saving ? 'Speichern...' : 'Einstellungen speichern'}</button>
          </div>
        )}
      </div>

      {/* ── E-Mail-Benachrichtigungen ──────────────── */}
      <div className="bg-white p-8">
        <h2 className="text-lg font-bold text-ink font-headline mb-1">E-Mail-Benachrichtigungen</h2>
        <p className="text-sm text-ink-variant mb-6">Empfänger-Adresse und Auslöser für automatische Mails.</p>
        {loading ? (
          <div className="space-y-3"><div className="h-10 bg-surface-low animate-pulse" /><div className="h-10 bg-surface-low animate-pulse" /></div>
        ) : (
          <div className="space-y-5">
            <div><label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">Empfänger-E-Mail</label><input type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} placeholder="admin@beispiel.de" className="input-field w-full" /></div>
            <div className="space-y-3 pt-1">
              {[{ label: 'Bei neuer Bestellung', value: notifyOnOrder, set: setNotifyOnOrder }, { label: 'Bei neuer Nachricht', value: notifyOnMessage, set: setNotifyOnMessage }].map(({ label, value, set }) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer select-none">
                  <div onClick={() => set(!value)} className={`w-10 h-5 flex items-center rounded-none transition-colors cursor-pointer ${value ? 'bg-brand-300' : 'bg-surface-low'}`}><span className={`w-4 h-4 bg-white shadow transition-transform mx-0.5 ${value ? 'translate-x-5' : 'translate-x-0'}`} /></div>
                  <span className="text-sm text-ink font-medium">{label}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-ink-faint">Mails werden nur versendet wenn eine Empfänger-Adresse eingetragen und der jeweilige Toggle aktiv ist. Der Versand nutzt die in <code className="bg-surface-low px-1">.env</code> konfigurierte Mail-Verbindung.</p>
          </div>
        )}
      </div>

      {/* ── Skonto-Gruppen ─────────────────────────── */}
      <div className="bg-white p-8">
        <h2 className="text-lg font-bold text-ink font-headline mb-1">Skonto-Gruppen</h2>
        <p className="text-sm text-ink-variant mb-6">Rabattgruppen und Staffelkonditionen verwalten.</p>
        <div className="flex gap-2 mb-6">
          <input className="input-field flex-1 text-sm" placeholder="Neue Gruppe..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()} />
          <button onClick={handleAddGroup} disabled={!newGroupName.trim()} className="btn-primary px-4 py-2 disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">add</span></button>
        </div>
        {skontoLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface-low animate-pulse" />)}</div>
        ) : skontoGroups.length === 0 ? (
          <p className="text-sm text-ink-faint py-4 text-center">Noch keine Gruppen.</p>
        ) : (
          <div className="space-y-4">
            {skontoGroups.map((group) => (
              <div key={group.id} className="border border-surface-low">
                <div className="flex items-center gap-2 px-4 py-3 bg-surface/50">
                  {editingGroupId === group.id ? (
                    <input ref={editGroupRef} className="input-field flex-1 text-sm py-1" value={editingGroupName} onChange={(e) => setEditingGroupName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateGroup(group.id); if (e.key === 'Escape') setEditingGroupId(null); }} onBlur={() => handleUpdateGroup(group.id)} />
                  ) : (
                    <span className="flex-1 text-sm font-bold text-ink">{group.name}</span>
                  )}
                  <span className="text-[10px] text-ink-outline shrink-0">{group.users_count} Nutzer</span>
                  {editingGroupId === group.id ? (
                    <button onClick={() => setEditingGroupId(null)} className="p-1 text-ink-faint hover:text-ink"><span className="material-symbols-outlined text-[16px]">close</span></button>
                  ) : (
                    <button onClick={() => startEditGroup(group)} className="p-1 text-ink-faint hover:text-ink"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                  )}
                  <button onClick={() => handleDeleteGroup(group)} className="p-1 text-ink-faint hover:text-red-500"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-outline mb-1"><span>Ab Bestellwert (€)</span><span>Rabatt (%)</span><span /><span /></div>
                  {group.tiers.length === 0 && <p className="text-xs text-ink-faint italic">Noch keine Staffeln.</p>}
                  {group.tiers.map((tier) => (
                    <div key={tier.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                      {editingTier[tier.id] ? (
                        <>
                          <input type="number" min="0" step="0.01" className="input-field text-sm py-1.5" value={editingTier[tier.id].min} onChange={(e) => setEditingTier((p) => ({ ...p, [tier.id]: { ...p[tier.id], min: e.target.value } }))} onKeyDown={(e) => e.key === 'Enter' && handleUpdateTier(group.id, tier.id)} />
                          <input type="number" min="0.01" max="100" step="0.01" className="input-field text-sm py-1.5" value={editingTier[tier.id].pct} onChange={(e) => setEditingTier((p) => ({ ...p, [tier.id]: { ...p[tier.id], pct: e.target.value } }))} onKeyDown={(e) => e.key === 'Enter' && handleUpdateTier(group.id, tier.id)} />
                          <button onClick={() => handleUpdateTier(group.id, tier.id)} className="p-1 text-brand-500 hover:text-brand-700"><span className="material-symbols-outlined text-[16px]">check</span></button>
                          <button onClick={() => setEditingTier((p) => { const n = { ...p }; delete n[tier.id]; return n; })} className="p-1 text-ink-faint hover:text-ink"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-ink">ab € {Number(tier.min_order_value).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                          <span className="text-sm font-semibold text-brand-700">{Number(tier.discount_percent).toFixed(2)} %</span>
                          <button onClick={() => setEditingTier((p) => ({ ...p, [tier.id]: { min: String(tier.min_order_value), pct: String(tier.discount_percent) } }))} className="p-1 text-ink-faint hover:text-ink"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                          <button onClick={() => handleDeleteTier(group.id, tier.id)} className="p-1 text-ink-faint hover:text-red-500"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center pt-1 border-t border-surface-low mt-2">
                    <input type="number" min="0" step="0.01" className="input-field text-sm py-1.5" placeholder="Ab € ..." value={newTier[group.id]?.min ?? ''} onChange={(e) => setNewTier((p) => ({ ...p, [group.id]: { ...p[group.id], min: e.target.value, pct: p[group.id]?.pct ?? '' } }))} />
                    <input type="number" min="0.01" max="100" step="0.01" className="input-field text-sm py-1.5" placeholder="Rabatt %" value={newTier[group.id]?.pct ?? ''} onChange={(e) => setNewTier((p) => ({ ...p, [group.id]: { ...p[group.id], pct: e.target.value, min: p[group.id]?.min ?? '' } }))} />
                    <button onClick={() => handleAddTier(group.id)} disabled={!newTier[group.id]?.min || !newTier[group.id]?.pct} className="p-1.5 text-brand-500 hover:text-brand-700 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">add</span></button>
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
        <div className="flex gap-2 mb-4">
          <input className="input-field flex-1 text-sm" placeholder="Neue Kategorie..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} />
          <button onClick={handleAddCategory} disabled={addingCat || !newCatName.trim()} className="btn-primary px-4 py-2 disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">add</span></button>
        </div>
        {catLoading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-surface-low animate-pulse" />)}</div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-ink-faint py-4 text-center">Noch keine Kategorien.</p>
        ) : (
          <div className="divide-y divide-surface-low">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 py-2.5">
                {editingId === cat.id ? (
                  <input ref={editInputRef} className="input-field flex-1 text-sm py-1.5" value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateCategory(cat.id); if (e.key === 'Escape') setEditingId(null); }} onBlur={() => handleUpdateCategory(cat.id)} />
                ) : (
                  <span className="flex-1 text-sm font-medium text-ink">{cat.name}</span>
                )}
                <span className="text-[10px] text-ink-outline shrink-0">{cat.products_count} Produkte</span>
                {editingId === cat.id ? (
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-ink-faint hover:text-ink transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
                ) : (
                  <button onClick={() => startEdit(cat)} className="p-1.5 text-ink-faint hover:text-ink transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                )}
                <button onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-ink-faint hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Versandoptionen ────────────────────────── */}
      <div className="bg-white p-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-ink font-headline">Versandoptionen</h2>
          <button
            onClick={() => editingShipId === 'new' ? closeEditShip() : openEditShip(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-500 hover:text-brand-700 transition-colors border border-brand-200 hover:border-brand-300"
          >
            <span className="material-symbols-outlined text-[16px]">{editingShipId === 'new' ? 'close' : 'add'}</span>
            {editingShipId === 'new' ? 'Abbrechen' : 'Neue Versandoption'}
          </button>
        </div>
        <p className="text-sm text-ink-variant mb-6">
          Versandoptionen werden dem Kunden im Warenkorb angezeigt. Verfügbarkeit basiert auf dem Bestellwert.
        </p>

        {/* New form */}
        {editingShipId === 'new' && (
          <div className="mb-4 border border-brand-300/40 bg-surface p-5">
            <ShippingEditFields form={shipForm} onChange={(p) => setShipForm(f => ({ ...f, ...p }))} imageRef={shipImageRef} imagePreview={shipImagePreview} onImageChange={(e) => { const f = e.target.files?.[0] ?? null; setShipImageFile(f); setShipImagePreview(f ? URL.createObjectURL(f) : null); }} />
            <div className="flex gap-3 mt-4">
              <button onClick={handleSaveShip} disabled={shipSaving || !shipForm.name.trim()} className="btn-primary px-5 py-2.5 disabled:opacity-50 text-sm">{shipSaving ? 'Speichern...' : 'Erstellen'}</button>
              <button onClick={closeEditShip} className="btn-outline px-5 py-2.5 text-sm">Abbrechen</button>
            </div>
          </div>
        )}

        {shippingLoading ? (
          <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-12 bg-surface-low animate-pulse" />)}</div>
        ) : shippingOptions.length === 0 ? (
          <p className="text-sm text-ink-faint py-4 text-center">Noch keine Versandoptionen angelegt.</p>
        ) : (
          <div className="space-y-2">
            {shippingOptions.map((opt) => (
              <div key={opt.id}>
                <div className={`flex items-center gap-3 px-4 py-3 bg-white border transition-colors ${editingShipId === opt.id ? 'border-brand-300' : 'border-surface-low'}`}>
                  {/* Image/Icon */}
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    {opt.image_url
                      ? <img src={opt.image_url} alt={opt.name} className="w-8 h-8 object-contain" />
                      : <span className="material-symbols-outlined text-[20px] text-ink-faint">local_shipping</span>
                    }
                  </div>
                  {/* Name + price */}
                  <span className="flex-1 text-sm font-semibold text-ink">{opt.name}</span>
                  <span className="text-sm text-ink-variant shrink-0">
                    {opt.price === 0 ? 'Kostenlos' : `${Number(opt.price).toFixed(2).replace('.', ',')} €`}
                  </span>
                  {/* Availability hint */}
                  <span className="text-[10px] text-ink-faint shrink-0 hidden sm:block">
                    ab {Number(opt.min_order_value).toFixed(0)} €{opt.max_order_value != null ? ` bis ${Number(opt.max_order_value).toFixed(0)} €` : ''}
                  </span>
                  {/* Toggle */}
                  <div onClick={() => handleToggleShip(opt, !opt.active)} className={`w-9 h-5 flex items-center rounded-none transition-colors cursor-pointer shrink-0 ${opt.active ? 'bg-brand-300' : 'bg-surface-low'}`}>
                    <span className={`w-4 h-4 bg-white shadow transition-transform mx-0.5 ${opt.active ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                  </div>
                  <button onClick={() => editingShipId === opt.id ? closeEditShip() : openEditShip(opt)} className="p-1.5 text-ink-faint hover:text-ink transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{editingShipId === opt.id ? 'expand_less' : 'edit'}</span>
                  </button>
                  <button onClick={() => handleDeleteShip(opt)} className="p-1.5 text-ink-faint hover:text-red-500 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                {editingShipId === opt.id && (
                  <div className="border border-brand-300/40 border-t-0 bg-surface p-5">
                    <ShippingEditFields form={shipForm} onChange={(p) => setShipForm(f => ({ ...f, ...p }))} imageRef={shipImageRef} imagePreview={shipImagePreview} onImageChange={(e) => { const f = e.target.files?.[0] ?? null; setShipImageFile(f); setShipImagePreview(f ? URL.createObjectURL(f) : null); }} />
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleSaveShip} disabled={shipSaving || !shipForm.name.trim()} className="btn-primary px-5 py-2.5 disabled:opacity-50 text-sm">{shipSaving ? 'Speichern...' : 'Speichern'}</button>
                      <button onClick={closeEditShip} className="btn-outline px-5 py-2.5 text-sm">Abbrechen</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Zertifikate ────────────────────────────── */}
      <div className="bg-white p-8">
        <h2 className="text-lg font-bold text-ink font-headline mb-1">Zertifikate</h2>
        <p className="text-sm text-ink-variant mb-6">PDFs werden auf der öffentlichen Zertifikate-Seite zum Download angeboten.</p>

        {/* Upload form */}
        <div className="border border-surface-low p-4 mb-6 space-y-3">
          <p className="text-xs font-bold text-ink uppercase tracking-widest">Neues Zertifikat hochladen</p>
          <div className="flex gap-3 items-start flex-wrap">
            <input
              type="text"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              placeholder="Bezeichnung, z. B. ISO 9001:2015"
              className="input-field flex-1 min-w-48 py-2.5 text-sm"
            />
            <div className="flex items-center gap-2">
              <input ref={certFileRef} type="file" accept=".pdf" className="hidden"
                onChange={(e) => setCertFile(e.target.files?.[0] ?? null)} />
              <button type="button" onClick={() => certFileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border border-surface-low text-sm text-ink-variant hover:border-ink-outline hover:text-ink transition-colors">
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                {certFile ? certFile.name : 'PDF auswählen'}
              </button>
              <button
                onClick={handleUploadCert}
                disabled={certUploading || !certName.trim() || !certFile}
                className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
              >
                {certUploading ? 'Hochladen...' : 'Hochladen'}
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        {certLoading ? (
          <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-12 bg-surface-low animate-pulse" />)}</div>
        ) : certificates.length === 0 ? (
          <p className="text-sm text-ink-faint py-4 text-center">Noch keine Zertifikate hochgeladen.</p>
        ) : (
          <div className="divide-y divide-surface-low">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-3 py-3">
                <span className="material-symbols-outlined text-[20px] text-brand-300 shrink-0">picture_as_pdf</span>
                {editingCertId === cert.id ? (
                  <input
                    autoFocus
                    className="input-field flex-1 text-sm py-1.5"
                    value={editingCertName}
                    onChange={(e) => setEditingCertName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateCertName(cert.id); if (e.key === 'Escape') setEditingCertId(null); }}
                    onBlur={() => handleUpdateCertName(cert.id)}
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-ink truncate">{cert.name}</span>
                )}
                <a href={cert.file_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 text-ink-faint hover:text-brand-500 transition-colors shrink-0" title="Vorschau">
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
                {editingCertId === cert.id ? (
                  <button onClick={() => setEditingCertId(null)} className="p-1.5 text-ink-faint hover:text-ink transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                ) : (
                  <button onClick={() => { setEditingCertId(cert.id); setEditingCertName(cert.name); }} className="p-1.5 text-ink-faint hover:text-ink transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                )}
                <button onClick={() => handleDeleteCert(cert)} className="p-1.5 text-ink-faint hover:text-red-500 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Ankündigungen ──────────────────────────── */}
      <div className="bg-white p-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-ink font-headline">Ankündigungen</h2>
          <button
            onClick={() => editingAnnId === 'new' ? closeEditAnn() : openEditAnn(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-500 hover:text-brand-700 transition-colors border border-brand-200 hover:border-brand-300"
          >
            <span className="material-symbols-outlined text-[16px]">{editingAnnId === 'new' ? 'close' : 'add'}</span>
            {editingAnnId === 'new' ? 'Abbrechen' : 'Neue Ankündigung'}
          </button>
        </div>
        <p className="text-sm text-ink-variant mb-6">
          Jede Ankündigung kann separat aktiviert werden. Reihenfolge per Drag & Drop ändern.
        </p>

        {/* New announcement form */}
        {editingAnnId === 'new' && (
          <div className="mb-4 border border-brand-300/40 bg-surface p-5 space-y-4">
            <p className="text-xs font-bold text-ink uppercase tracking-widest">Neue Ankündigung</p>
            <AnnouncementEditFields
              form={editForm} onFormChange={setEF}
              imageRef={editImageRef} imagePreview={editImagePreview}
              onImageChange={handleEditImageChange}
              galleryFiles={editGalleryFiles} galleryPreviews={editGalleryPreviews}
              galleryRemove={editGalleryRemove} galleryRefs={editGalleryRefs}
              onGalleryChange={handleGalleryFileChange} onGalleryRemove={handleGalleryRemove}
            />
            <div className="flex gap-3 pt-1">
              <button onClick={handleSaveAnn} disabled={editSaving || !editForm.title.trim()} className="btn-primary px-5 py-2.5 disabled:opacity-50 text-sm">{editSaving ? 'Speichern...' : 'Erstellen'}</button>
              <button onClick={closeEditAnn} className="btn-outline px-5 py-2.5 text-sm">Abbrechen</button>
            </div>
          </div>
        )}

        {/* Sortable list */}
        {annLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-surface-low animate-pulse" />)}</div>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-ink-faint py-4 text-center">Noch keine Ankündigungen. Oben eine neue erstellen.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={announcements.map(a => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {announcements.map((ann) => (
                  <div key={ann.id}>
                    <SortableAnnouncementCard
                      ann={ann}
                      isEditing={editingAnnId === ann.id}
                      onToggle={(enabled) => handleToggleAnn(ann, enabled)}
                      onEdit={() => editingAnnId === ann.id ? closeEditAnn() : openEditAnn(ann)}
                      onDelete={() => handleDeleteAnn(ann)}
                    />
                    {/* Inline edit panel */}
                    {editingAnnId === ann.id && (
                      <div className="border border-brand-300/40 border-t-0 bg-surface p-5 space-y-4">
                        <AnnouncementEditFields
                          form={editForm} onFormChange={setEF}
                          imageRef={editImageRef} imagePreview={editImagePreview}
                          onImageChange={handleEditImageChange}
                          galleryFiles={editGalleryFiles} galleryPreviews={editGalleryPreviews}
                          galleryRemove={editGalleryRemove} galleryRefs={editGalleryRefs}
                          onGalleryChange={handleGalleryFileChange} onGalleryRemove={handleGalleryRemove}
                        />
                        <div className="flex gap-3 pt-1">
                          <button onClick={handleSaveAnn} disabled={editSaving || !editForm.title.trim()} className="btn-primary px-5 py-2.5 disabled:opacity-50 text-sm">{editSaving ? 'Speichern...' : 'Speichern'}</button>
                          <button onClick={closeEditAnn} className="btn-outline px-5 py-2.5 text-sm">Abbrechen</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Shared edit form fields component
// ─────────────────────────────────────────────────────────────────
function AnnouncementEditFields({
  form, onFormChange,
  imageRef, imagePreview, onImageChange,
  galleryFiles, galleryPreviews, galleryRemove, galleryRefs,
  onGalleryChange, onGalleryRemove,
}: {
  form: EditForm;
  onFormChange: (patch: Partial<EditForm>) => void;
  imageRef: { current: HTMLInputElement | null };
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  galleryFiles: (File | null)[];
  galleryPreviews: (string | null)[];
  galleryRemove: boolean[];
  galleryRefs: { current: HTMLInputElement | null }[];
  onGalleryChange: (i: number, file: File | null) => void;
  onGalleryRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Hintergrundfarbe */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-2">Hintergrundfarbe</label>
        <div className="flex items-center gap-3">
          <input type="color" value={form.background_color} onChange={(e) => onFormChange({ background_color: e.target.value })} className="w-10 h-10 cursor-pointer border-none bg-transparent p-0" />
          <input type="text" value={form.background_color} onChange={(e) => onFormChange({ background_color: e.target.value })} placeholder="#0e0e0e" className="input-field w-36 text-sm font-mono py-2" />
        </div>
      </div>

      {/* Titel + Schriftgröße */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">
          Titel <span className="text-ink-faint normal-case tracking-normal">(Schriftgröße px)</span>
        </label>
        <div className="flex gap-2">
          <input type="text" value={form.title} onChange={(e) => onFormChange({ title: e.target.value })} placeholder="Ankündigung Titel" className="input-field flex-1" />
          <input type="number" min="16" max="120" value={form.title_size} onChange={(e) => onFormChange({ title_size: e.target.value })} className="input-field w-20 text-center text-sm" title="Schriftgröße Titel (px)" />
        </div>
      </div>

      {/* Text + Schriftgröße */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">
          Text <span className="text-ink-faint normal-case tracking-normal">(Schriftgröße px)</span>
        </label>
        <div className="flex gap-2 items-start">
          <textarea rows={3} value={form.text} onChange={(e) => onFormChange({ text: e.target.value })} placeholder="Optionaler Beschreibungstext..." className="input-field flex-1 resize-none" />
          <input type="number" min="10" max="48" value={form.text_size} onChange={(e) => onFormChange({ text_size: e.target.value })} className="input-field w-20 text-center text-sm" title="Schriftgröße Text (px)" />
        </div>
      </div>

      {/* Hauptbild */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-2">
          Hauptbild <span className="text-ink-faint normal-case tracking-normal">(rechts neben Titel/Text)</span>
        </label>
        {(imagePreview ?? form.image_url) && (
          <img src={imagePreview ?? form.image_url!} alt="Vorschau" className="w-full max-h-40 object-cover mb-2" />
        )}
        <input ref={imageRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
        <button type="button" onClick={() => imageRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-surface-low text-sm text-ink-variant hover:border-ink-outline hover:text-ink transition-colors">
          <span className="material-symbols-outlined text-[18px]">upload</span>
          {form.image_url || imagePreview ? 'Bild ersetzen' : 'Bild hochladen'}
        </button>
      </div>

      {/* Galeriebilder */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">
          Galeriebilder <span className="text-ink-faint normal-case tracking-normal">(bis zu 5, gleichmäßig unterhalb)</span>
        </label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {[0, 1, 2, 3, 4].map((i) => {
            const displayUrl = galleryRemove[i] ? null : (galleryPreviews[i] ?? form.gallery_images?.[i] ?? null);
            return (
              <div key={i} className="relative">
                {displayUrl ? (
                  <div className="relative">
                    <img src={displayUrl} alt="" className="w-full h-20 object-cover" />
                    <button type="button" onClick={() => onGalleryRemove(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => galleryRefs[i].current?.click()} className="w-full h-20 border border-dashed border-surface-low flex flex-col items-center justify-center gap-1 text-ink-faint hover:border-ink-outline hover:text-ink transition-colors text-xs">
                    <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                    {i + 1}
                  </button>
                )}
                <input ref={galleryRefs[i]} type="file" accept="image/*" className="hidden" onChange={(e) => onGalleryChange(i, e.target.files?.[0] ?? null)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Shipping option edit fields component
// ─────────────────────────────────────────────────────────────────
function ShippingEditFields({
  form, onChange, imageRef, imagePreview, onImageChange,
}: {
  form: { name: string; price: string; min_order_value: string; max_order_value: string };
  onChange: (patch: Partial<typeof form>) => void;
  imageRef: { current: HTMLInputElement | null };
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">Name</label>
        <input type="text" value={form.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="z. B. DHL Standard" className="input-field w-full" />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">Preis (€)</label>
        <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => onChange({ price: e.target.value })} className="input-field w-40" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">Mindestbestellwert (€)</label>
          <input type="number" min="0" step="0.01" value={form.min_order_value} onChange={(e) => onChange({ min_order_value: e.target.value })} placeholder="0" className="input-field w-full" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-1">Maximalbestellwert (€, leer = kein Max)</label>
          <input type="number" min="0" step="0.01" value={form.max_order_value} onChange={(e) => onChange({ max_order_value: e.target.value })} placeholder="kein Maximum" className="input-field w-full" />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-variant block mb-2">Icon / Bild (optional)</label>
        {imagePreview && <img src={imagePreview} alt="Vorschau" className="w-16 h-16 object-contain mb-2 border border-surface-low p-1" />}
        <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
        <button type="button" onClick={() => imageRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-surface-low text-sm text-ink-variant hover:border-ink-outline hover:text-ink transition-colors">
          <span className="material-symbols-outlined text-[18px]">upload</span>
          {imagePreview ? 'Bild ersetzen' : 'Bild hochladen'}
        </button>
      </div>
    </div>
  );
}
