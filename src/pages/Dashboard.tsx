import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowUpRight, BadgeCheck, Building2, CalendarDays, Hourglass, IndianRupee, KeyRound, Mailbox, MapPin, TrendingUp, UserRound, Users } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0, available: 0, sold: 0, rented: 0,
    pendingDeals: 0, closedDeals: 0, cancelledDeals: 0, totalRevenue: 0,
    totalCommission: 0, monthlyCommission: 0, pendingCommission: 0, avgCommissionRate: 0,
    totalClients: 0, totalAgents: 0,
  })
  const [recentDeals, setRecentDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard() }, [])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const [propRes, availRes, soldRes, rentedRes, pendingRes, cancelledRes, closedRes, paymentRes, clientRes, agentRes, recentRes] = await Promise.all([
        supabase.from('properties').select('property_id', { count: 'exact', head: true }),
        supabase.from('properties').select('property_id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('properties').select('property_id', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('properties').select('property_id', { count: 'exact', head: true }).eq('status', 'rented'),
        supabase.from('deals').select('deal_id', { count: 'exact', head: true }).eq('deal_status', 'pending'),
        supabase.from('deals').select('deal_id', { count: 'exact', head: true }).eq('deal_status', 'cancelled'),
        supabase.from('deals').select('deal_id, agreed_price, commission_amount, commission_rate_pct').eq('deal_status', 'closed'),
        supabase.from('payments').select(`
          status,
          deals (deal_id, agreed_price, commission_amount, commission_rate_pct, deal_date)
        `).in('status', ['pending', 'completed']),
        supabase.from('clients').select('client_id', { count: 'exact', head: true }),
        supabase.from('agents').select('agent_id', { count: 'exact', head: true }),
        supabase.from('deals').select(`
          deal_id, deal_status, agreed_price, commission_amount, commission_rate_pct, deal_date,
          clients (first_name, last_name),
          properties (title, city)
        `).order('deal_date', { ascending: false }).limit(5),
      ])

      const closed = closedRes.data || []
      const paymentRows = paymentRes.data || []
      const completedPayments = paymentRows.filter((p: any) => p.status === 'completed')
      const pendingPayments = paymentRows.filter((p: any) => p.status === 'pending')

      const commissionForPayment = (payment: any) => {
        const deal = Array.isArray(payment.deals) ? payment.deals[0] : payment.deals
        if (!deal) return { commission: 0, rate: 0 }
        const rate = Number(deal.commission_rate_pct || 2)
        const commission = Number(deal.commission_amount || (Number(deal.agreed_price) * rate) / 100)
        return { commission, rate }
      }

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const isCurrentMonth = (dateString?: string) => {
        if (!dateString) return false
        const d = new Date(dateString)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      }

      const totalCommission = completedPayments.reduce((s: number, p: any) => s + commissionForPayment(p).commission, 0)
      const monthlyCommission = completedPayments.reduce((s: number, p: any) => {
        const deal = Array.isArray(p.deals) ? p.deals[0] : p.deals
        return deal && isCurrentMonth(deal.deal_date) ? s + commissionForPayment(p).commission : s
      }, 0)
      const pendingCommission = pendingPayments.reduce((s: number, p: any) => s + commissionForPayment(p).commission, 0)
      const avgCommissionRate = completedPayments.length
        ? completedPayments.reduce((s: number, p: any) => s + commissionForPayment(p).rate, 0) / completedPayments.length
        : 0

      setStats({
        totalProperties: propRes.count || 0,
        available: availRes.count || 0,
        sold: soldRes.count || 0,
        rented: rentedRes.count || 0,
        pendingDeals: pendingRes.count || 0,
        cancelledDeals: cancelledRes.count || 0,
        closedDeals: closed.length,
        totalRevenue: closed.reduce((s: number, d: any) => s + Number(d.agreed_price), 0),
        totalCommission,
        monthlyCommission,
        pendingCommission,
        avgCommissionRate,
        totalClients: clientRes.count || 0,
        totalAgents: agentRes.count || 0,
      })
      setRecentDeals(recentRes.data || [])
    } catch (err) {
      console.error('Dashboard error:', err)
    }
    setLoading(false)
  }

  function fmt(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
    return `₹${n.toLocaleString('en-IN')}`
  }

  function pct(value: number, total: number) {
    if (!total) return 0
    return Math.round((value / total) * 100)
  }

  function fmtDate(value?: string) {
    if (!value) return 'No date'
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function spark(values: number[]) {
    const cleaned = values.map(v => Math.max(0, Number(v) || 0))
    const maxValue = Math.max(1, ...cleaned)
    return cleaned.map(v => Math.max(20, Math.min(90, Math.round((v / maxValue) * 90))))
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  const occupied = stats.sold + stats.rented
  const totalDealFlow = stats.closedDeals + stats.pendingDeals + stats.cancelledDeals
  const closeRate = pct(stats.closedDeals, totalDealFlow)
  const inventoryHealth = pct(stats.available, stats.totalProperties)
  const occupancyRate = pct(occupied, stats.totalProperties)
  const avgCommission = stats.closedDeals ? stats.totalCommission / stats.closedDeals : 0

  const cards = [
    {
      label: 'Revenue (Closed)',
      value: fmt(stats.totalRevenue),
      insight: 'Gross transacted value (secondary)',
      icon: IndianRupee,
      color: 'rose',
      trend: `${pct(stats.totalCommission, stats.totalRevenue || 1)}% commission yield`,
      spark: spark([
        stats.totalRevenue,
        stats.totalCommission,
        stats.pendingCommission,
        stats.totalRevenue,
        stats.totalCommission + stats.pendingCommission,
        stats.totalRevenue,
        stats.totalCommission,
        stats.pendingCommission,
      ]),
    },
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      insight: `${inventoryHealth}% currently available`,
      icon: Building2,
      color: 'indigo',
      trend: `${occupancyRate}% occupied`,
      spark: spark([
        stats.available,
        stats.sold,
        stats.rented,
        stats.totalProperties,
        stats.available,
        occupied,
        stats.totalProperties,
        stats.available,
      ]),
    },
    {
      label: 'Available Listings',
      value: stats.available,
      insight: `${stats.totalProperties - stats.available} in occupied pipeline`,
      icon: BadgeCheck,
      color: 'emerald',
      trend: `${inventoryHealth}% of inventory`,
      spark: spark([
        stats.available,
        stats.totalProperties - stats.available,
        stats.available,
        stats.pendingDeals,
        stats.available,
        stats.totalProperties,
        stats.available,
        stats.pendingDeals,
      ]),
    },
    {
      label: 'Sold / Rented',
      value: occupied,
      insight: `${pct(occupied, stats.totalProperties)}% portfolio utilization`,
      icon: KeyRound,
      color: 'cyan',
      trend: `${occupancyRate}% utilization`,
      spark: spark([
        stats.sold,
        stats.rented,
        occupied,
        stats.sold,
        stats.rented,
        occupied,
        stats.totalProperties,
        occupied,
      ]),
    },
    {
      label: 'Pending Deals',
      value: stats.pendingDeals,
      insight: `${closeRate}% close ratio in current flow`,
      icon: Hourglass,
      color: 'amber',
      trend: `${stats.pendingCommission ? fmt(stats.pendingCommission) : '₹0'} pending commission`,
      spark: spark([
        stats.pendingDeals,
        stats.closedDeals,
        stats.pendingDeals,
        stats.closedDeals,
        stats.pendingDeals,
        totalDealFlow,
        stats.pendingDeals,
        stats.closedDeals,
      ]),
    },
    {
      label: 'Clients / Agents',
      value: `${stats.totalClients} / ${stats.totalAgents}`,
      insight: `${stats.totalAgents ? Math.round(stats.totalClients / stats.totalAgents) : 0} clients per agent`,
      icon: Users,
      color: 'blue',
      trend: `${stats.totalAgents ? Math.round((stats.totalClients / stats.totalAgents) * 10) / 10 : 0} ratio`,
      spark: spark([
        stats.totalClients,
        stats.totalAgents,
        stats.totalClients,
        stats.totalAgents,
        stats.totalClients + stats.totalAgents,
        stats.totalClients,
        stats.totalAgents,
        stats.totalClients,
      ]),
    },
  ]

  return (
    <div className="fade-in dashboard-pulse">
      <div className="page-header">
        <h2>Portfolio Intelligence</h2>
        <p>Live overview of property health, deal momentum, and commission performance</p>
      </div>

      <section className="pulse-hero">
        <div className="pulse-hero-main commission-highlight">
          <div className="pulse-hero-top">
            <span className="pulse-chip"><TrendingUp size={14} /> Performance Overview</span>
            <span className="pulse-growth"><ArrowUpRight size={14} /> {closeRate}% close rate</span>
          </div>
          <p className="pulse-label">Monthly Commission</p>
          <h3>{fmt(stats.monthlyCommission)}</h3>
          <p className="pulse-subtext">Average per closed deal: {fmt(Math.round(avgCommission || 0))}</p>
          <div className="pulse-track" role="presentation">
            <span style={{ width: `${Math.max(12, Math.round(stats.avgCommissionRate * 10))}%` }} />
          </div>
        </div>

        <div className="pulse-hero-stats">
          <div className="pulse-side-card">
            <span>Average Commission Rate</span>
            <strong>{stats.avgCommissionRate.toFixed(2)}%</strong>
            <small>Across completed payments</small>
          </div>
          <div className="pulse-side-card">
            <span>Pending Commission</span>
            <strong>{fmt(stats.pendingCommission)}</strong>
            <small>Will count after payment completion</small>
          </div>
          <div className="pulse-side-card">
            <span>Deal Flow</span>
            <strong>{stats.closedDeals} closed</strong>
            <small>{stats.pendingDeals} pending • {stats.cancelledDeals} cancelled</small>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        {cards.map(c => (
          <div key={c.label} className={`stat-card ${c.color}`}>
            <div className="stat-card-header">
              <span className="stat-card-label">{c.label}</span>
              <div className="stat-card-icon"><c.icon size={20} strokeWidth={2} /></div>
            </div>
            <div className="stat-card-value">{c.value}</div>
            <p className="stat-card-insight">{c.insight}</p>
            <div className="stat-card-trend">
              <span><TrendingUp size={12} /> {c.trend}</span>
              <div className="mini-spark" aria-hidden="true">
                {c.spark.map((point, idx) => (
                  <i key={`${c.label}-${idx}`} style={{ height: `${point}%` }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card pulse-timeline-card">
        <div className="pulse-timeline-header">
          <h3>Recent Deal Activity</h3>
          <p>Structured flow of the latest transactions and current status</p>
        </div>
        {recentDeals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Mailbox size={36} /></div>
            <h4>No deals yet</h4>
            <p>Create a deal from the Deals page</p>
          </div>
        ) : (
          <div className="deal-strip">
            {recentDeals.map((d: any) => (
              <article key={d.deal_id} className="deal-tile">
                <div className="deal-tile-head">
                  <span className="deal-id">#{d.deal_id}</span>
                  <span className={`badge ${d.deal_status}`}>{d.deal_status}</span>
                </div>

                <h4>{d.properties?.title || 'Untitled property'}</h4>

                <div className="deal-meta-row">
                  <MapPin size={14} />
                  <span>{d.properties?.city || 'Unknown city'}</span>
                </div>
                <div className="deal-meta-row">
                  <UserRound size={14} />
                  <span>{d.clients?.first_name} {d.clients?.last_name}</span>
                </div>
                <div className="deal-meta-row">
                  <CalendarDays size={14} />
                  <span>{fmtDate(d.deal_date)}</span>
                </div>

                <div className="deal-amount">
                  <IndianRupee size={16} />
                  <strong>{fmt(Number(d.commission_amount || (Number(d.agreed_price) * Number(d.commission_rate_pct || 2)) / 100))}</strong>
                </div>
                <p className="deal-amount-sub">Commission at {Number(d.commission_rate_pct || 2).toFixed(1)}% on {fmt(Number(d.agreed_price))}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
