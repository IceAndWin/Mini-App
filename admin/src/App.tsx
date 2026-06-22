import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AdminLayout } from './app/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import BookingsPage from './pages/BookingsPage'
import MastersPage from './pages/MastersPage'
import ServicesPage from './pages/ServicesPage'
import LoginPage from './pages/LoginPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem('admin_token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="masters" element={<MastersPage />} />
        <Route path="services" element={<ServicesPage />} />
      </Route>
    </Routes>
  )
}
