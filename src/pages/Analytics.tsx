import { useEffect, useState } from 'react'
import { Building2, CalendarRange, Landmark, UserRound } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface AreaStat {
  label: string
  count: number
}

interface AgentStat {
  name: string
  total: number
}

interface MonthStat {
  month: string
  total: number
}

export default function Analytics() {
  const [areas, setAreas] = useState<AreaStat[]>([])
  const [monthlyCommission, setMonthlyCommission] = useState<MonthStat[]>([])
  const [topAgents, setTopAgents] = useState<AgentStat[]>([])
  const [commissionSplit, setCommissionSplit] = useState({ sale: 0, rent: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAnalytics() }, [])

  function commissionOf(deal: any) {
    const rate = Number(deal.commission_rate_pct || 2)
    return Number(deal.commission_amount || (Number(deal.agreed_price) * rate) / 100)
  }

  function monthLabel(key: string) {
    const [year, month] = key.split('-')
    const dt = new Date(Number(year), Number(month) - 1, 1)
    return dt.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
  }

  function fmt(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
    return `₹${Math.round(n).toLocaleString('en-IN')}`
  }

  function initial(name: string) {
    return (name || 'A').charAt(0).toUpperCase()
  }

  function linePoints(values: number[]) {
    const cleaned = values.map(v => Math.max(0, Number(v) || 0))
    const maxValue = Math.max(1, ...cleaned)
    const steps = Math.max(cleaned.length - 1, 1)
    return cleaned
      .map((value, index) => {
        const x = (index / steps) * 100
        const y = 74 - Math.round((value / maxValue) * 54)
        return `${x},${y}`
      })
      .join(' ')
  }

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const [propertiesRes, dealsRes] = await Promise.all([
        supabase.from('properties').select('city, locality'),
        supabase.from('deals').select(`
          deal_type, deal_date, agreed_price, commission_amount, commission_rate_pct,
          properties (agent_id, agents (first_name, last_name))
        `).eq('deal_status', 'closed'),
      ])

      const properties = propertiesRes.data || []
      const closedDeals = dealsRes.data || []

      const areaMap: Record<string, number> = {}
      for (const p of properties) {
        const city = (p as any).city || 'Unknown city'
        const locality = (p as any).locality || 'N/A'
        const key = `${city} - ${locality}`
        areaMap[key] = (areaMap[key] || 0) + 1
      }
      setAreas(
        Object.entries(areaMap)
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6),
      )

      const split = { sale: 0, rent: 0 }
      const monthMap: Record<string, number> = {}
      const agentMap: Record<string, number> = {}

      for (const deal of closedDeals as any[]) {
        const commission = commissionOf(deal)
        if ((deal.deal_type || '').toLowerCase() === 'rent') split.rent += commission
        else split.sale += commission

        const dealDate = deal.deal_date ? new Date(deal.deal_date) : null
        if (dealDate && !Number.isNaN(dealDate.getTime())) {
          const key = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`
          monthMap[key] = (monthMap[key] || 0) + commission
        }

        const property = Array.isArray(deal.properties) ? deal.properties[0] : deal.properties
        const agent = property?.agents
        const agentName = agent?.first_name
          ? `${agent.first_name} ${agent.last_name || ''}`.trim()
          : `Agent #${property?.agent_id || 'N/A'}`
        agentMap[agentName] = (agentMap[agentName] || 0) + commission
      }

      setCommissionSplit(split)

      setMonthlyCommission(
        Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([month, total]) => ({ month: monthLabel(month), total })),
      )

      setTopAgents(
        Object.entries(agentMap)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5),
      )
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  const maxArea = Math.max(1, ...areas.map(a => a.count))
  const maxAgent = Math.max(1, ...topAgents.map(a => a.total))
  const totalCommission = commissionSplit.sale + commissionSplit.rent
  const salePct = totalCommission ? Math.round((commissionSplit.sale / totalCommission) * 100) : 0
  const rentPct = totalCommission ? Math.round((commissionSplit.rent / totalCommission) * 100) : 0

  const monthSeries = monthlyCommission.map(m => m.total)
  const monthLine = linePoints(monthSeries.length ? monthSeries : [0, 0, 0, 0])
  const monthArea = `0,74 ${monthLine} 100,74`

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Market depth, commission structure, temporal momentum, and top performers</p>
      </div>

      <div className="grid-2">
        <div className="card analytics-card">
          <h3 className="analytics-card-title"><Building2 size={18} /> Areas with Maximum Property Listings</h3>
          {areas.length === 0 ? (
            <div className="empty-state"><h4>No listing data</h4><p>Add properties to view area concentration</p></div>
          ) : (
            <div className="analytics-rank-list">
              {areas.map((area, index) => (
                <div key={area.label} className="analytics-rank-item">
                  <span className="analytics-rank-index">#{index + 1}</span>
                  <div className="analytics-rank-content">
                    <div className="analytics-rank-head">
                      <span>{area.label}</span>
                      <strong>{area.count}</strong>
                    </div>
                    <div className="analytics-rank-bar">
                      <i style={{ width: `${Math.max((area.count / maxArea) * 100, 10)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card analytics-card">
          <h3 className="analytics-card-title"><Landmark size={18} /> Sale vs Rent Commission</h3>
          <div className="analytics-split-wrap">
            <div className="analytics-donut" style={{ ['--sale-angle' as any]: `${salePct * 3.6}deg` }}>
              <div className="analytics-donut-core">
                <span>{salePct}%</span>
                <small>Sale</small>
              </div>
            </div>
            <div className="analytics-split-legend">
              <div className="analytics-legend-row"><i className="sale" /> Sale <strong>{fmt(commissionSplit.sale)}</strong></div>
              <div className="analytics-legend-row"><i className="rent" /> Rent <strong>{fmt(commissionSplit.rent)}</strong></div>
              <p>Total recognized: {fmt(totalCommission)} ({rentPct}% rent)</p>
            </div>
          </div>
        </div>

        <div className="card analytics-card">
          <h3 className="analytics-card-title"><CalendarRange size={18} /> Commission Month by Month</h3>
          {monthlyCommission.length === 0 ? (
            <div className="empty-state"><h4>No monthly trend yet</h4><p>Close deals to start seeing month-by-month movement</p></div>
          ) : (
            <>
              <div className="analytics-line-chart" aria-hidden="true">
                <svg viewBox="0 0 100 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(193, 232, 255, 0.38)" />
                      <stop offset="100%" stopColor="rgba(193, 232, 255, 0)" />
                    </linearGradient>
                  </defs>
                  <polygon className="analytics-line-area" points={monthArea} />
                  <polyline className="analytics-line-path" points={monthLine} />
                </svg>
              </div>
              <div className="analytics-month-row">
                {monthlyCommission.map(month => (
                  <div key={month.month} className="analytics-month-pill">
                    <span>{month.month}</span>
                    <strong>{fmt(month.total)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card analytics-card">
          <h3 className="analytics-card-title"><UserRound size={18} /> Top Agents by Commission</h3>
          {topAgents.length === 0 ? (
            <div className="empty-state"><h4>No agent ranking yet</h4><p>Agent performance will appear after closed deals</p></div>
          ) : (
            <div className="analytics-agent-list">
              {topAgents.map(agent => (
                <div key={agent.name} className="analytics-agent-item">
                  <div className="analytics-agent-id">{initial(agent.name)}</div>
                  <div className="analytics-agent-main">
                    <div className="analytics-agent-head">
                      <span>{agent.name}</span>
                      <strong>{fmt(agent.total)}</strong>
                    </div>
                    <div className="analytics-rank-bar">
                      <i style={{ width: `${Math.max((agent.total / maxAgent) * 100, 10)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
