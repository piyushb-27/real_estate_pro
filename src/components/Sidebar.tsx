import { NavLink } from 'react-router-dom'
import { BarChart3, Building2, Handshake, LayoutDashboard, LineChart, PanelLeftClose, PanelLeftOpen, Users, Wallet } from 'lucide-react'

const navItems = [
  { section: 'Overview', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Management', items: [
    { to: '/properties', icon: Building2, label: 'Properties' },
    { to: '/deals', icon: Handshake, label: 'Deals' },
    { to: '/payments', icon: Wallet, label: 'Payments' },
    { to: '/agents', icon: Users, label: 'Agents' },
  ]},
  { section: 'Reports', items: [
    { to: '/analytics', icon: LineChart, label: 'Analytics' },
  ]},
]

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onNavigate: () => void
}

export default function Sidebar({ collapsed, mobileOpen, onToggle, onNavigate }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon"><BarChart3 size={20} /></div>
        <div className="sidebar-brand-copy">
          <h1>RealEstate Pro</h1>
          <p>Management System</p>
        </div>
        <button className="sidebar-toggle" type="button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={onNavigate}
              >
                <span className="nav-link-icon"><item.icon size={17} strokeWidth={2} /></span>
                <span className="nav-link-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
