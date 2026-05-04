import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ContactPage from './pages/ContactPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import ProfilePage from './pages/ProfilePage';
import ImpressumPage from './pages/ImpressumPage';
import ZertifikatePage from './pages/ZertifikatePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  if (isLoading) return <LoadingScreen />;
  // Eingeloggt aber noch nicht freigeschaltet → zur Startseite mit Banner
  if (user && !isAuthenticated) return <Navigate to="/" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  if (isLoading) return <LoadingScreen />;
  if (user && !isAuthenticated) return <Navigate to="/" replace />;
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 bg-brand-200 flex items-center justify-center">
          <span className="material-symbols-outlined filled text-brand-800">architecture</span>
        </div>
        <div className="w-32 h-1 bg-surface-low overflow-hidden">
          <div className="h-full bg-brand-300 animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="produkte" element={<ProductsPage />} />
        <Route path="warenkorb" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="bestellungen" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="bestellungen/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="kontakt" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
        <Route path="profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="impressum" element={<ImpressumPage />} />
        <Route path="zertifikate" element={<ZertifikatePage />} />
        <Route path="admin/benutzer" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="admin/produkte" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        <Route path="admin/bestellungen" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="admin/nachrichten" element={<AdminRoute><AdminMessagesPage /></AdminRoute>} />
        <Route path="admin/einstellungen" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
