import { useEffect, useState } from 'react'
import { Ban, Check, Landmark, Smartphone, CreditCard, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'

interface Deal {
  deal_id: number
  deal_type: string
  deal_status: string
  agreed_price: number
  commission_rate_pct: number
  commission_amount: number
  deal_date: string
  property_id: number
  properties: any
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [availableProps, setAvailableProps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [showPayment, setShowPayment] = useState<Deal | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  const [addForm, setAddForm] = useState({ property_id: '', agreed_price: '', commission_rate_pct: '2.0' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [dealRes, propRes] = await Promise.all([
      supabase.from('deals').select(`
        deal_id, deal_type, deal_status, agreed_price, commission_rate_pct, commission_amount, deal_date, property_id,
        properties (title, city, agent_id, listing_type, agents (first_name, last_name))
      `).order('deal_id', { ascending: false }).limit(100),
      supabase.from('properties').select('property_id, title, city, price, listing_type, agent_id').eq('status', 'available').order('property_id'),
    ])
    setDeals(dealRes.data || [])
    setAvailableProps(propRes.data || [])
    setLoading(false)
  }

  async function handleCreateDeal() {
    if (!addForm.property_id || !addForm.agreed_price) {
      addToast('Please select property and enter agreed price', 'error'); return
    }
    const selectedProp = availableProps.find((p: any) => p.property_id === Number(addForm.property_id))
    const agreedPrice = Number(addForm.agreed_price)
    const commissionRate = Number(addForm.commission_rate_pct)

    if (Number.isNaN(agreedPrice) || agreedPrice <= 0) {
      addToast('Agreed price must be greater than 0', 'error'); return
    }

    if (Number.isNaN(commissionRate) || commissionRate < 0.5 || commissionRate > 10) {
      addToast('Commission rate must be between 0.5% and 10%', 'error'); return
    }

    setSubmitting(true)
    try {
      const { data: existingClient, error: existingClientErr } = await supabase
        .from('clients')
        .select('client_id')
        .order('client_id', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (existingClientErr) throw existingClientErr

      let clientId = existingClient?.client_id
      if (!clientId) {
        const stamp = Date.now()
        const { data: createdClient, error: createdClientErr } = await supabase
          .from('clients')
          .insert({
            first_name: 'Walk-in',
            last_name: 'Client',
            email: `walkin+${stamp}@demo.local`,
            phone: `+91${String(stamp).slice(-10)}`,
            budget: 0,
            preferred_city: 'Any',
          })
          .select('client_id')
          .single()

        if (createdClientErr) throw createdClientErr
        clientId = createdClient.client_id
      }

      const { error } = await supabase.from('deals').insert({
        property_id: Number(addForm.property_id),
        client_id: clientId,
        deal_type: selectedProp?.listing_type || 'sale',
        deal_status: 'pending',
        agreed_price: agreedPrice,
        commission_rate_pct: commissionRate,
        commission_amount: (agreedPrice * commissionRate) / 100,
      })

      if (error) throw error

      addToast('Deal created!', 'success')
      setShowAdd(false)
      setAddForm({ property_id: '', agreed_price: '', commission_rate_pct: '2.0' })
      fetchAll()
    } catch (err: any) {
      addToast(`Failed: ${err.message}`, 'error')
    }
    setSubmitting(false)
  }

  function handleCloseClick(deal: Deal) {
    setShowPayment(deal)
    setPaymentMethod('bank_transfer')
  }

  async function handleCloseDeal() {
    if (!showPayment) return
    const deal = showPayment
    setSubmitting(true)

    const { error: closeError } = await supabase.from('deals').update({ deal_status: 'closed' }).eq('deal_id', deal.deal_id)
    if (closeError) {
      setSubmitting(false)
      addToast(`Failed: ${closeError.message}`, 'error')
      return
    }

    const { error: payError } = await supabase.from('payments').insert({
      deal_id: deal.deal_id,
      amount: Number(deal.agreed_price),
      method: paymentMethod,
      status: 'pending',
    })
    if (payError) {
      setSubmitting(false)
      addToast(`Failed: ${payError.message}`, 'error')
      return
    }

    const prop = deal.properties as any
    const newStatus = (prop?.listing_type || deal.deal_type) === 'sale' ? 'sold' : 'rented'
    await supabase.from('properties').update({ status: newStatus }).eq('property_id', deal.property_id)

    setSubmitting(false)
    setShowPayment(null)
    addToast(`Deal #${deal.deal_id} closed! Commission will be recognized after payment completion.`, 'success')
    fetchAll()
  }

  async function cancelDeal(deal: Deal) {
    await supabase.from('deals').update({ deal_status: 'cancelled' }).eq('deal_id', deal.deal_id)
    // Refund any pending payments
    await supabase.from('payments').update({ status: 'refunded' }).eq('deal_id', deal.deal_id).eq('status', 'pending')
    addToast(`Deal #${deal.deal_id} cancelled.`, 'success')
    fetchAll()
  }

  function fmt(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
    return `₹${n.toLocaleString('en-IN')}`
  }

  function getCommissionAmount(price: number | string, rate: number | string) {
    const p = Number(price)
    const r = Number(rate)
    if (Number.isNaN(p) || Number.isNaN(r)) return 0
    return (p * r) / 100
  }

  const filteredDeals = filter === 'all' ? deals : deals.filter(d => d.deal_status === filter)

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div><h2>Deals</h2><p>Create and manage property deals</p></div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Create Deal</button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <h3>{filteredDeals.length} Deals</h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['all', 'pending', 'closed', 'cancelled'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {filteredDeals.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Ban size={36} /></div><h4>No {filter !== 'all' ? filter : ''} deals</h4><p>Create a deal to get started</p></div>
        ) : (
          <div className="deal-table-scroll">
            <table className="deal-table">
              <thead><tr><th>ID</th><th>Property</th><th>Price</th><th>Commission</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredDeals.map(d => {
                  const prop = d.properties as any
                  const commissionRate = Number(d.commission_rate_pct || 0)
                  const commissionAmount = Number(d.commission_amount || getCommissionAmount(d.agreed_price, commissionRate))
                  return (
                    <tr key={d.deal_id}>
                      <td>#{d.deal_id}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {prop?.title}
                        <br /><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{prop?.city}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(Number(d.agreed_price))}</td>
                      <td>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(commissionAmount)}</div>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{commissionRate.toFixed(1)}%</span>
                      </td>
                      <td><span className={`badge ${d.deal_status}`}>{d.deal_status}</span></td>
                      <td>{new Date(d.deal_date).toLocaleDateString('en-IN')}</td>
                      <td>{d.deal_status === 'pending' ? (
                        <div className="row-actions">
                          <button className="btn btn-success btn-sm" onClick={() => handleCloseClick(d)}><Check size={14} /> Close</button>
                          <button className="btn btn-danger btn-sm" onClick={() => cancelDeal(d)}><Ban size={14} /> Cancel</button>
                        </div>
                      ) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE DEAL MODAL — only property + price */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create New Deal"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowAdd(false)} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreateDeal} disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
        </>}>
        <div className="form-group">
          <label>Property</label>
          <select className="form-input" value={addForm.property_id} onChange={e => {
            const pid = e.target.value
            const prop = availableProps.find((p: any) => p.property_id === Number(pid))
            setAddForm({
              property_id: pid,
              agreed_price: prop ? String(prop.price) : '',
              commission_rate_pct: addForm.commission_rate_pct,
            })
          }}>
            <option value="">Select property</option>
            {availableProps.map((p: any) => (
              <option key={p.property_id} value={p.property_id}>{p.title} — {p.city} — {fmt(Number(p.price))}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Agreed Price (₹)</label>
          <input className="form-input" type="number" placeholder="16000000" value={addForm.agreed_price} onChange={e => setAddForm({ ...addForm, agreed_price: e.target.value })} />
        </div>
        <div className="form-group commission-slider-wrap">
          <div className="commission-slider-head">
            <label>Commission Rate</label>
            <span className="commission-slider-value">{Number(addForm.commission_rate_pct).toFixed(1)}%</span>
          </div>
          <input
            className="commission-range"
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={addForm.commission_rate_pct}
            onChange={e => setAddForm({ ...addForm, commission_rate_pct: e.target.value })}
          />
          <div className="commission-quick-picks">
            {[1.5, 2, 2.5, 3].map(rate => (
              <button
                key={rate}
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setAddForm({ ...addForm, commission_rate_pct: String(rate) })}
              >
                {rate}%
              </button>
            ))}
          </div>
          <p className="commission-preview">Estimated commission: <strong>{fmt(getCommissionAmount(addForm.agreed_price, addForm.commission_rate_pct))}</strong></p>
        </div>
      </Modal>

      {/* CLOSE DEAL → PAYMENT METHOD MODAL */}
      <Modal open={!!showPayment} onClose={() => setShowPayment(null)} title="Close Deal — Enter Payment Details"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowPayment(null)} disabled={submitting}>Cancel</button>
          <button className="btn btn-success" onClick={handleCloseDeal} disabled={submitting}>{submitting ? 'Processing...' : 'Close Deal & Add Payment'}</button>
        </>}>
        {showPayment && (<>
          <div className="form-group">
            <label>Property</label>
            <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{(showPayment.properties as any)?.title}</p>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 'var(--font-xl)' }}>{fmt(Number(showPayment.agreed_price))}</p>
            <p style={{ marginTop: '6px', fontSize: 'var(--font-sm)', color: '#6ee7b7' }}>
              Commission: {fmt(Number(showPayment.commission_amount || getCommissionAmount(showPayment.agreed_price, showPayment.commission_rate_pct || 2)))} ({Number(showPayment.commission_rate_pct || 2).toFixed(1)}%)
            </p>
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select className="form-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="payment-method-hints">
            <span><Landmark size={14} /> Bank</span>
            <span><Smartphone size={14} /> UPI</span>
            <span><CreditCard size={14} /> Card</span>
            <span><FileText size={14} /> Cheque</span>
          </div>
          <div style={{ padding: 'var(--space-4)', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
            <p style={{ fontSize: 'var(--font-sm)', color: '#34d399' }}>
              ✅ Payment will be recorded as <strong>pending</strong> and property will be marked as <strong>{(showPayment.properties as any)?.listing_type === 'rent' ? 'rented' : 'sold'}</strong>.
            </p>
          </div>
        </>)}
      </Modal>
    </div>
  )
}

