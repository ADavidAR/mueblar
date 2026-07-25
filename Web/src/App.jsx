import { BrowserRouter, Routes, Route,Navigate } from 'react-router-dom'
import { AuthProvider,useAuth } from './context/AuthContext'
import SiteLayout from './components/layout/SiteLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import PartnersPage from './pages/PartnersPage'
import DownloadPage from './pages/DownloadPage'
import ProfilePage from './pages/ProfilePage'
import AdminInventoryPage from './pages/Admin/AdminInventoryPage'

import CreateAttributeTypePage from './pages/Admin/CreateAttributeTypePage'
import UpdateAttributeTypePage from './pages/Admin/UpdateAttributeTypePage'

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
