import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, announcementApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Announcement, Product } from '../types';
import ProductCard from '../components/products/ProductCard';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    productApi.featured()
      .then(({ data }) => setFeatured(data.data))
      .finally(() => setLoading(false));
    announcementApi.list().then(({ data }) => setAnnouncements(data.data));
  }, []);

  return (
    <div className="space-y-16">
      {/* ── Announcement Banners ─────────────────── */}
      {announcements.map((ann) => (
        <section
          key={ann.id}
          className="overflow-hidden"
          style={{ backgroundColor: ann.background_color || '#0e0e0e' }}
        >
          {/* Titel + Text links, Bild rechts */}
          <div className="p-8 md:p-14 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-brand-300 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">Ankündigung</span>
              </div>
              <h2
                className="font-extrabold tracking-tighter leading-[0.95] text-white"
                style={{ fontSize: ann.title_size ? `${ann.title_size}px` : '3rem' }}
              >
                {ann.title}
              </h2>
              {ann.text && (
                <p
                  className="mt-4 max-w-2xl leading-relaxed text-white/70"
                  style={{ fontSize: ann.text_size ? `${ann.text_size}px` : '1.125rem' }}
                >
                  {ann.text}
                </p>
              )}
            </div>

            {ann.image_url && (
              <div className="w-full md:w-80 lg:w-96 shrink-0">
                <img src={ann.image_url} alt="" className="w-full h-64 md:h-72 object-cover" />
              </div>
            )}
          </div>

          {/* Galeriebilder */}
          {ann.gallery_images?.some(url => url) && (
            <div className="px-8 md:px-14 pb-8 md:pb-14 flex gap-4">
              {ann.gallery_images
                .filter((url): url is string => Boolean(url))
                .map((url, i) => (
                  <div key={i} className="flex-1">
                    <img src={url} alt="" className="w-full h-40 object-cover" />
                  </div>
                ))}
            </div>
          )}
        </section>
      ))}

      {/* ── Hero Section ──────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-brand-300 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
            Live-Bestandsstatus
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-ink leading-[0.95] font-headline">
          Optische <span className="text-brand-300 italic">Präzision.</span>
        </h1>
        <p className="text-lg text-ink-variant mt-4 max-w-xl leading-relaxed">
          Entdecken Sie unser kuratiertes Großhandelssortiment hochwertiger Fassungen.
          Entwickelt für Komfort, gestaltet für die moderne Ästhetik.
        </p>

        {!isAuthenticated && (
          <div className="mt-8 p-6 bg-surface-low max-w-lg">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-brand-500 mt-0.5">lock</span>
              <div>
                <p className="text-sm font-semibold text-ink">Preise nur für registrierte Händler</p>
                <p className="text-xs text-ink-variant mt-1">
                  Melden Sie sich an, um Preise, Lagerbestände und die Bestellfunktion zu sehen.
                </p>
                <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 mt-3 hover:underline">
                  Jetzt anmelden <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
            <Link to="/produkte" className="btn-primary text-center justify-center py-4">
              <span className="material-symbols-outlined text-lg">eyeglasses</span>
              <span>Sortiment ansehen</span>
            </Link>
            <Link to="/bestellungen" className="btn-secondary text-center justify-center py-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              <span>Bestellungen</span>
            </Link>
            <Link to="/kontakt" className="btn-outline text-center justify-center py-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">mail</span>
              <span>Kontakt</span>
            </Link>
          </div>
        )}
      </section>

      {/* ── Featured Products ────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink font-headline">
            Neuheiten im Sortiment
          </h2>
          <Link to="/produkte" className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-500 hover:underline flex items-center gap-1">
            Alle anzeigen ({featured.length}+)
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-low animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Info Cards ────────────────────────────── */}
      {isAuthenticated && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500 mb-2 block">Skonto-Rabatt</span>
            <h3 className="text-xl font-bold tracking-tight text-ink font-headline">Partner Status</h3>
            <p className="text-sm text-ink-variant mt-2">
              Ihre Rabattgruppe wird automatisch bei der Bestellung angewendet.
            </p>
          </div>
          <div className="bg-white p-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-outline mb-2 block">Aktive Sendungen</span>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-4xl font-bold tracking-tight text-ink font-headline">—</span>
              <span className="material-symbols-outlined text-ink-outline mb-1">local_shipping</span>
            </div>
          </div>
          <div className="bg-white p-8 border-l-4 border-brand-300">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-outline mb-2 block">Bestand-Alarme</span>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-4xl font-bold tracking-tight text-ink font-headline">—</span>
              <span className="material-symbols-outlined text-brand-500 mb-1">warning</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
