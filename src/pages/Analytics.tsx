import { useEffect, useState } from 'react'
import { MapPin, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LocationStat { city: string; locality: string; count: number }
interface ClientStat { first_name: string; last_name: string; count: number }

export default function Analytics() {
  const [locations, setLocations] = useState<LocationStat[]>([])
  const [clients, setClients] = useState<ClientStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAnalytics() }, [])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      // Top locations by closed deals (direct property join)
      const { data: deals } = await supabase
        .from('deals')
        .select('deal_id, properties (city, locality)')
        .eq('deal_status', 'closed')

      const locMap: Record<string, LocationStat> = {}
      for (const d of (deals || [])) {
        const p = (d as any).properties as any
        if (!p?.city) continue
        const key = `${p.city}|${p.locality || 'N/A'}`
        if (!locMap[key]) locMap[key] = { city: p.city, locality: p.locality || 'N/A', count: 0 }
        locMap[key].count++
      }
      setLocations(Object.values(locMap).sort((a, b) => b.count - a.count).slice(0, 10))

      // Most active clients
      const { data: clientDeals } = await supabase
        .from('deals')
        .select('deal_id, clients (first_name, last_name)')

      const cMap: Record<string, ClientStat> = {}
      for (const d of (clientDeals || [])) {
        const c = (d as any).clients as any
        if (!c?.first_name) continue
        const key = `${c.first_name} ${c.last_name}`
        if (!cMap[key]) cMap[key] = { first_name: c.first_name, last_name: c.last_name, count: 0 }
        cMap[key].count++
      }
      setClients(Object.values(cMap).sort((a, b) => b.count - a.count).slice(0, 10))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  const maxLoc = locations[0]?.count || 1
  const maxCli = clients[0]?.count || 1

  return (
    <div className="fade-in">
      <div className="page-header"><h2>Analytics</h2><p>Insights into top locations and most active clients</p></div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} /> Top Locations by Closed Deals</h3>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>Based on successfully closed deals</p>
          {locations.length === 0 ? (
            <div className="empty-state"><h4>No data yet</h4><p>Close deals to see analytics</p></div>
          ) : (
            <div className="bar-chart">
              {locations.map((l, i) => (
                <div key={i} className="bar-chart-row">
                  <span className="bar-label">{l.city}, {l.locality}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max((l.count / maxLoc) * 100, 8)}%` }}>{l.count}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Most Active Clients</h3>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>Clients with most deals</p>
          {clients.length === 0 ? (
            <div className="empty-state"><h4>No data yet</h4><p>Create deals to see activity</p></div>
          ) : (
            <div className="bar-chart">
              {clients.map((c, i) => (
                <div key={i} className="bar-chart-row">
                  <span className="bar-label">#{i + 1} {c.first_name} {c.last_name}</span>
                  <div className="bar-track"><div className="bar-fill" style={{
                    width: `${Math.max((c.count / maxCli) * 100, 8)}%`,
                    background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : i === 1 ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' : i === 2 ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'var(--accent-gradient)',
                  }}>{c.count}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
