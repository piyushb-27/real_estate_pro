import { NavLink } from 'react-router-dom'
import { BarChart3, Building2, Handshake, LayoutDashboard, LineChart, Wallet } from 'lucide-react'

const navItems = [
  { section: 'Overview', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Management', items: [
    { to: '/properties', icon: Building2, label: 'Properties' },
    { to: '/deals', icon: Handshake, label: 'Deals' },
    { to: '/payments', icon: Wallet, label: 'Payments' },
  ]},
  { section: 'Reports', items: [
    { to: '/analytics', icon: LineChart, label: 'Analytics' },
  ]},
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon"><BarChart3 size={20} /></div>
        <div>
          <h1>RealEstate Pro</h1>
          <p>Management System</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-link-icon"><item.icon size={17} strokeWidth={2} /></span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
