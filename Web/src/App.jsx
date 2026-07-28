import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import SiteLayout from './components/layout/SiteLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PartnersPage from './pages/PartnersPage'
import DownloadPage from './pages/DownloadPage'
import ProfilePage from './pages/ProfilePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'
import AdminAttributeTypesPage from './pages/admin/AdminAttributeTypesPage'
import AdminAttributesPage from './pages/admin/AdminAttributesPage'
import AdminRolesPage from './pages/admin/AdminRolesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!['admin', 'gerente'].includes(user.role)) return <Navigate to="/view/main-view" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Navigate to="/view/main-view" replace />} />
            <Route path="/view/main-view" element={<HomePage />} />
            <Route path="/view/about-us" element={<PartnersPage />} />
            <Route path="/view/download" element={<DownloadPage />} />
            <Route path="/view/sign-up" element={<RegisterPage />} />
            <Route path="/view/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/view/reset-password/:token/:id" element={<ResetPasswordPage />} />
            {/* Alias sin el prefijo /view/: el correo de recuperación que arma el backend enlaza acá */}
            <Route path="/reset-password/:token/:id" element={<ResetPasswordPage />} />
            <Route path="/view/client-profile" element={<ProfilePage />} />
            <Route path="/view/catalog" element={<CatalogPage />} />
            <Route path="/view/catalog/:model" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route
            path="/view/dashboard"
            element={<AdminRoute><AdminDashboardPage /></AdminRoute>}
          />
          <Route
            path="/view/inventory"
            element={<AdminRoute><AdminInventoryPage /></AdminRoute>}
          />
          <Route
            path="/view/inventory/new"
            element={<AdminRoute><AdminProductFormPage /></AdminRoute>}
          />
          <Route
            path="/view/inventory/edit/:model"
            element={<AdminRoute><AdminProductFormPage /></AdminRoute>}
          />
          <Route
            path="/view/attribute-types"
            element={<AdminRoute><AdminAttributeTypesPage /></AdminRoute>}
          />
          <Route
            path="/view/attributes"
            element={<AdminRoute><AdminAttributesPage /></AdminRoute>}
          />
          <Route
            path="/view/roles-management"
            element={<AdminRoute><AdminRolesPage /></AdminRoute>}
          />
          <Route
            path="/view/users-management"
            element={<AdminRoute><AdminUsersPage /></AdminRoute>}
          />
          <Route
            path="/view/categories-management"
            element={<AdminRoute><AdminCategoriesPage /></AdminRoute>}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App