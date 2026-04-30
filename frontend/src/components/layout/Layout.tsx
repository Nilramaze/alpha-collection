import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { productApi } from '../../services/api';
import type { Category } from '../../types';

const navLinkCls = ({ isActive }: { isActive: boolean }) => clsx(
  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all',
  isActive
    ? 'text-brand-200 bg-brand-200/5 border-l-[3px] border-brand-200 -ml-px'
    : 'text-[#9c9d9d] hover:text-white hover:bg-white/[0.03]'
);

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortimentOpen, setSortimentOpen] = useState(false);
  const sortimentRef = useRef<HTMLDivElement>(null);

  const isSortimentActive = location.pathname.startsWith('/produkte');

  useEffect(() => {
    productApi.categories().then(({ data }) => setCategories(data.data));
  }, []);

  useEffect(() => {
    setSortimentOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortimentRef.current && !sortimentRef.current.contains(e.target as Node)) {
        setSortimentOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim()) {
      searchTimer.current = setTimeout(() => {
        navigate(`/produkte?search=${encodeURIComponent(value.trim())}`);
      }, 400);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      navigate(`/produkte?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className={clsx(
        'fixed lg:sticky top-0 left-0 z-40 h-screen w-[220px] bg-[#0e0e0e] flex flex-col transition-transform lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Brand */}
        <div className="p-6 pb-2">
          <img src="/alpha_White_1.png" alt="Alpha Collection" className="h-12 w-auto" />
          <div className="text-sm text-white font-bold mt-3">Alpha Collection</div>
          <div className="text-[11px] text-[#757777] leading-relaxed mt-1">Glarner Strasse 3<br />12205 Berlin, Germany</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <NavLink to="/" end onClick={() => setMobileOpen(false)} className={navLinkCls}>
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard
          </NavLink>

          {/* Sortiment mit Dropdown */}
          <div className="relative" ref={sortimentRef}>
            <button
              onClick={() => setSortimentOpen(!sortimentOpen)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all w-full text-left',
                isSortimentActive
                  ? 'text-brand-200 bg-brand-200/5 border-l-[3px] border-brand-200 -ml-px'
                  : 'text-[#9c9d9d] hover:text-white hover:bg-white/[0.03]'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">eyeglasses</span>
              Sortiment
              <span
                className="material-symbols-outlined text-[16px] ml-auto transition-transform duration-200"
                style={{ transform: sortimentOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_more
              </span>
            </button>
            {sortimentOpen && (
              <div className="bg-[#171717] py-1 mx-1 mt-0.5">
                <button
                  onClick={() => { navigate('/produkte'); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-5 py-2 text-xs font-medium text-[#9c9d9d] hover:text-white hover:bg-white/[0.03] transition-all text-left"
                >
                  <span className="material-symbols-outlined text-[14px]">grid_view</span>
                  Alle Kategorien
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { navigate(`/produkte?category=${cat.slug}`); setMobileOpen(false); }}
                    className="flex items-center gap-2 w-full px-5 py-2 text-xs font-medium text-[#9c9d9d] hover:text-white hover:bg-white/[0.03] transition-all text-left"
                  >
                    <span className="material-symbols-outlined text-[14px]">label</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bestellungen */}
          {isAuthenticated && (
            <NavLink to="/bestellungen" onClick={() => setMobileOpen(false)} className={navLinkCls}>
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              Bestellungen
            </NavLink>
          )}

          {/* Mein Profil (nur für Nicht-Admins) */}
          {isAuthenticated && user?.role !== 'admin' && (
            <NavLink to="/profil" onClick={() => setMobileOpen(false)} className={navLinkCls}>
              <span className="material-symbols-outlined text-[20px]">person</span>
              Mein Profil
            </NavLink>
          )}

          {/* Kontakt */}
          {isAuthenticated && (
            <NavLink to="/kontakt" onClick={() => setMobileOpen(false)} className={navLinkCls}>
              <span className="material-symbols-outlined text-[20px]">group</span>
              Kontakt
            </NavLink>
          )}

          {/* Administration */}
          {user?.role === 'admin' && (
            <>
              <div className="px-4 pt-5 pb-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#555]">Administration</span>
              </div>
              {[
                { path: '/admin/benutzer', icon: 'manage_accounts', label: 'Benutzer' },
                { path: '/admin/produkte', icon: 'inventory_2', label: 'Produkte' },
                { path: '/admin/bestellungen', icon: 'receipt_long', label: 'Bestellungen' },
                { path: '/admin/nachrichten', icon: 'mark_unread_chat_alt', label: 'Nachrichten' },
                { path: '/admin/einstellungen', icon: 'settings', label: 'Einstellungen' },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={navLinkCls}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Bottom – Login-Button + Impressum/Zertifikate */}
        <div className="p-3 mt-auto space-y-2">
          {!isAuthenticated && (
            <NavLink
              to="/login"
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#0e0e0e] bg-brand-200 hover:bg-brand-300 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Anmelden
            </NavLink>
          )}
          <div className="flex items-center gap-1 px-2 py-1">
            <NavLink to="/impressum" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `text-[10px] font-medium transition-colors ${isActive ? 'text-brand-200' : 'text-[#555] hover:text-[#9c9d9d]'}`}>
              Impressum
            </NavLink>
            <span className="text-[#333] text-[10px]">·</span>
            <NavLink to="/zertifikate" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `text-[10px] font-medium transition-colors ${isActive ? 'text-brand-200' : 'text-[#555] hover:text-[#9c9d9d]'}`}>
              Zertifikate
            </NavLink>
          </div>
        </div>
      </aside>

      {/* ── Mobile overlay ──────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main Content ────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0e0e0e] h-20 flex items-center justify-between px-6 lg:px-10 border-l-2 border-[#888888]">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <span className="material-symbols-outlined text-white">menu</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-lg">
            <span className="material-symbols-outlined text-[#757777] text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Produkt, SKU oder Material suchen..."
              className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-[#555] flex-1 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Warenkorb + Abmelden oben rechts */}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/warenkorb"
                  title="Warenkorb"
                  className={({ isActive }) => clsx(
                    'relative flex items-center justify-center w-9 h-9 transition-colors',
                    isActive ? 'text-brand-200' : 'text-[#757777] hover:text-white'
                  )}
                >
                  <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                  {(cart?.item_count ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-black bg-brand-300 text-white flex items-center justify-center">
                      {cart?.item_count}
                    </span>
                  )}
                </NavLink>
                <button
                  onClick={handleLogout}
                  title="Abmelden"
                  className="flex items-center justify-center w-9 h-9 text-[#757777] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
                <div className="w-px h-5 bg-[#2a2a2a] mx-1" />
              </>
            )}

            {/* Benutzer-Info */}
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white">{user?.name}</div>
                  <div className="text-[10px] text-[#757777] uppercase tracking-wider">
                    {user?.role === 'admin' ? 'Administrator' : 'Händler'}
                  </div>
                </div>
                <div className="w-8 h-8 bg-brand-200 flex items-center justify-center">
                  <span className="material-symbols-outlined filled text-brand-800 text-sm">person</span>
                </div>
              </div>
            )}

            {/* Anmelden-Button wenn nicht eingeloggt */}
            {!isAuthenticated && (
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0e0e0e] bg-brand-200 hover:bg-brand-300 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Anmelden
              </NavLink>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 lg:px-10 py-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
