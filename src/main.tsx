import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import SearchFilter from './pages/dashboard/SearchFilter'
import PromptSearch from './pages/dashboard/PromptSearch'
import DashboardLayout from './Layouts/DashboardLayout'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'

import { useAuthStore } from './store/authStore'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token || user?.role !== 'station_user') {
      navigate('/login', { replace: true })
    }
  }, [token, user?.role, navigate])

  if (!token || user?.role !== 'station_user') return null
  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    // Only redirect to dashboard if the user is fully authenticated AND authorized
    if (token && user?.role === 'station_user') {
      navigate('/dashboard', { replace: true })
    }
  }, [token, user?.role, navigate])

  // Don't render children if we are about to redirect (user is logged in)
  if (token && user?.role === 'station_user') return null
  return <>{children}</>
}

const App = () => {
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

// Guard against Vite HMR calling createRoot() twice on the same container
const container = document.getElementById('root')!
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const root = (window as any).__reactRoot ?? ((window as any).__reactRoot = createRoot(container))

root.render(
  <StrictMode>
    <App />
    <PWAUpdatePrompt />
  </StrictMode>,
)
