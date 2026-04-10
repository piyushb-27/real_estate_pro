import { Link } from 'react-router-dom'

const sections = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/properties', label: 'Properties' },
  { to: '/deals', label: 'Deals' },
  { to: '/payments', label: 'Payments' },
  { to: '/agents', label: 'Agents' },
  { to: '/analytics', label: 'Analytics' },
]

export default function Landing() {
  const [primarySection, ...secondarySections] = sections

  return (
    <section className="landing-page fade-in">
      <div className="landing-glow landing-glow-left" aria-hidden="true" />
      <div className="landing-glow landing-glow-right" aria-hidden="true" />

      <div className="landing-content">
        <p className="landing-kicker">Real Estate Intelligence</p>
        <h1>EstateFlow</h1>
        <p className="landing-description">A modern platform to manage listings, deals, payments, and analytics in one place.</p>

        <div className="landing-actions">
          <div className="landing-primary-action">
            <Link to={primarySection.to} className="landing-link-btn primary">
              {primarySection.label}
            </Link>
          </div>

          <div className="landing-secondary-actions">
            {secondarySections.map(section => (
              <Link key={section.to} to={section.to} className="landing-link-btn secondary">
                {section.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}