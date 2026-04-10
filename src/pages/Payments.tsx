import { useEffect, useState, type ReactNode } from 'react'
import { Ban, Check, CircleX, Clock3, CreditCard, Landmark, Search, Smartphone, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'

type MaybeArray<T> = T | T[] | null

function unwrapOne<T>(value: MaybeArray<T> | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] || null) : value
}

interface DealJoin {
  deal_id: number
  deal_status: string
  agreed_price: number
  commission_rate_pct: number
  commission_amount: number
  properties: MaybeArray<{ title: string; city: string }>
}

interface Payment {
  payment_id: number
  deal_id: number
  amount: number
  method: string
  status: string
  transaction_ref: string | null
  paid_at: string | null
  created_at: string
  deals: MaybeArray<DealJoin>
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { addToast } = useToast()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase.from('payments').select(`
      payment_id, deal_id, amount, method, status, transaction_ref, paid_at, created_at,
      deals (deal_id, deal_status, agreed_price, commission_rate_pct, commission_amount, properties (title, city))
    `).order('created_at', { ascending: false }).limit(200)
    setPayments(data || [])
    setLoading(false)
  }

  async function markComplete(id: number) {
    const { data: paymentRow, error: paymentErr } = await supabase
      .from('payments')
      .select('payment_id, deal_id')
      .eq('payment_id', id)
      .single()

    if (paymentErr || !paymentRow) {
      addToast(`Failed: ${paymentErr?.message || 'Payment not found'}`, 'error')
      return
    }

    const { data: dealRow, error: dealErr } = await supabase
      .from('deals')
      .select('deal_id, property_id, agreed_price, commission_rate_pct, commission_amount')
      .eq('deal_id', paymentRow.deal_id)
      .single()

    if (dealErr || !dealRow) {
      addToast(`Failed: ${dealErr?.message || 'Deal not found for payment'}`, 'error')
      return
    }

    const { data: propertyRow, error: propertyErr } = await supabase
      .from('properties')
      .select('agent_id')
      .eq('property_id', dealRow.property_id)
      .single()

    if (propertyErr) {
      addToast(`Failed: ${propertyErr.message}`, 'error')
      return
    }

    const { error: paymentUpdateErr } = await supabase
      .from('payments')
      .update({ status: 'completed', paid_at: new Date().toISOString() })
      .eq('payment_id', id)

    if (paymentUpdateErr) {
      addToast(`Failed: ${paymentUpdateErr.message}`, 'error')
      return
    }

    if (propertyRow?.agent_id) {
      const commissionValue = Number(
        dealRow.commission_amount ||
        (Number(dealRow.agreed_price) * Number(dealRow.commission_rate_pct || 2)) / 100,
      )

      const { data: existingLog } = await supabase
        .from('commission_logs')
        .select('log_id')
        .eq('deal_id', dealRow.deal_id)
        .limit(1)
        .maybeSingle()

      if (!existingLog) {
        await supabase.from('commission_logs').insert({
          deal_id: dealRow.deal_id,
          agent_id: propertyRow.agent_id,
          commission_amount: commissionValue,
          reason: `Commission for Deal #${dealRow.deal_id} (payment completed)`,
        })
      }
    }

    addToast('Payment completed! Commission recognized.', 'success')
    fetchAll()
  }

  async function markFailed(id: number) {
    await supabase.from('payments').update({ status: 'failed' }).eq('payment_id', id)
    addToast('Payment marked failed', 'info'); fetchAll()
  }

  function fmt(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
    return `₹${n.toLocaleString('en-IN')}`
  }

  const methodIcons: Record<string, ReactNode> = {
    bank_transfer: <Landmark size={14} />,
    upi: <Smartphone size={14} />,
    credit_card: <CreditCard size={14} />,
    debit_card: <CreditCard size={14} />,
    cheque: <Wallet size={14} />,
  }

  const filtered = payments.filter(p => {
    const d = unwrapOne(p.deals)
    const prop = unwrapOne(d?.properties)
    const text = `${prop?.title || ''} ${prop?.city || ''} ${p.method} ${p.transaction_ref || ''}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  const commissionOf = (payment: Payment) => {
    const deal = unwrapOne(payment.deals)
    if (!deal) return 0
    return Number(deal.commission_amount || (Number(deal.agreed_price) * Number(deal.commission_rate_pct || 2)) / 100)
  }

  const received = payments.filter(p => p.status === 'completed').reduce((s, p) => s + commissionOf(p), 0)
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + commissionOf(p), 0)
  const failedValue = payments.filter(p => p.status === 'failed').reduce((s, p) => s + commissionOf(p), 0)
  const failedCount = payments.filter(p => p.status === 'failed').length
  const totalTracked = received + pending + failedValue

  const summaryCards = [
    {
      key: 'received',
      label: 'Received',
      value: fmt(received),
      subtext: 'Settled commission inflow',
      accent: 'received',
      ratio: totalTracked ? Math.round((received / totalTracked) * 100) : 0,
      icon: Check,
    },
    {
      key: 'pending',
      label: 'Pending',
      value: fmt(pending),
      subtext: 'Expected from open settlements',
      accent: 'pending',
      ratio: totalTracked ? Math.round((pending / totalTracked) * 100) : 0,
      icon: Clock3,
    },
    {
      key: 'failed',
      label: 'Failed',
      value: `${failedCount} txns`,
      subtext: `At-risk commission ${fmt(failedValue)}`,
      accent: 'failed',
      ratio: totalTracked ? Math.round((failedValue / totalTracked) * 100) : 0,
      icon: CircleX,
    },
  ]

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Payments</h2>
        <p>Track payment status — payments are auto-created when deals are closed</p>
      </div>

      <section className="payment-highlight-grid">
        {summaryCards.map(card => (
          <article key={card.key} className={`payment-highlight-card ${card.accent}`}>
            <div className="payment-highlight-head">
              <span>{card.label}</span>
              <div className="payment-highlight-icon"><card.icon size={16} /></div>
            </div>
            <h3>{card.value}</h3>
            <p>{card.subtext}</p>
            <div className="payment-highlight-meter" role="presentation">
              <i style={{ width: `${Math.max(10, card.ratio)}%` }} />
            </div>
          </article>
        ))}
      </section>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <h3>{filtered.length} Payments</h3>
          <div className="table-search"><span className="table-search-icon"><Search size={14} /></span><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Wallet size={36} /></div><h4>No payments yet</h4><p>Close a deal to auto-create a payment</p></div>
        ) : (
          <table>
            <thead><tr><th>ID</th><th>Property</th><th>Method</th><th>Amount</th><th>Status</th><th>Paid At</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => {
                const d = unwrapOne(p.deals)
                const prop = unwrapOne(d?.properties)
                return (
                  <tr key={p.payment_id}>
                    <td>#{p.payment_id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {prop?.title || '—'}
                      <br /><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{prop?.city || '—'}</span>
                    </td>
                    <td><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{methodIcons[p.method] || <Wallet size={14} />} {p.method.replace(/_/g, ' ')}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(Number(p.amount))}</td>
                    <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                    <td>{p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td>{p.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-success btn-sm" onClick={() => markComplete(p.payment_id)}><Check size={14} /> Complete</button>
                        <button className="btn btn-danger btn-sm" onClick={() => markFailed(p.payment_id)}><Ban size={14} /> Fail</button>
                      </div>
                    ) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
