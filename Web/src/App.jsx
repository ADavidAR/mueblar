import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SiteLayout from './components/layout/SiteLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import PartnersPage from './pages/PartnersPage'
import DownloadPage from './pages/DownloadPage'
import ProfilePage from './pages/ProfilePage'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/view/main-view" replace />
  return children
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Layout público compartido: Navbar + Footer en todas las vistas */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/nosotros" element={<PartnersPage />} />
            <Route path="/descargar" element={<DownloadPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>

          
          {/*-----------------------------------------------------------------*/}
          <Route
            path="/view/inventory"
            element={<AdminRoute><AdminInventoryPage /></AdminRoute>}
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
          <Route
            path="/view/product-creation"
            element={<AdminRoute><CreateProductPage /></AdminRoute>}
          />
          <Route
            path="/view/attribute-type-add"
            element={<AdminRoute><CreateAttributeTypePage /></AdminRoute>}
          />
          <Route
            path="/view/attribute-type-update"
            element={<AdminRoute> <UpdateAttributeTypePage /></AdminRoute>}
          />




        </Routes>



      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
