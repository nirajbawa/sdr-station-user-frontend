import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import SearchFilter from './pages/dashboard/SearchFilter'
import PromptSearch from './pages/dashboard/PromptSearch'
import DashboardLayout from './Layouts/DashboardLayout'

import { useTheme } from './hooks/useTheme'
import { useAuthStore } from './store/authStore'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)
  if (!token || user?.role !== 'station_user') return <Navigate to="/login" replace />
  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token)
  if (token) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const App = () => {
  useTheme()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="search" element={<SearchFilter />} />
                  <Route path="prompt-search" element={<PromptSearch />} />
                  <Route path="districts" element={<div>Districts Management (Coming Soon)</div>} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
