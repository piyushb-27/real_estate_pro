import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import Deals from './pages/Deals'
import Payments from './pages/Payments'
import Analytics from './pages/Analytics'
import Agents from './pages/Agents'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="app-layout">
      {!isLandingPage && (
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onToggle={() => setSidebarCollapsed(prev => !prev)}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      )}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isLandingPage ? 'landing-main' : ''}`}>
        {!isLandingPage && (
          <button className="mobile-sidebar-trigger" type="button" aria-label="Open navigation" onClick={() => setMobileSidebarOpen(true)}>
            <Menu size={18} />
          </button>
        )}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="site-footer">Made by Piyush (24BIT181) and Aagam (24BIT194)</footer>
      </main>
      {!isLandingPage && (
        <button
          type="button"
          aria-label="Close navigation"
          className={`sidebar-backdrop ${mobileSidebarOpen ? 'open' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  )
}
