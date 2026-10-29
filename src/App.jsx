import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase.js'

const demo = [
  { property_id: 1042, title: 'The Olive Residences', city: 'Ahmedabad', locality: 'Bodakdev', price: 18500000, status: 'available', listing_type: 'sale', bedrooms: 3, area_sqft: 2140, owner_name: 'Aarav Shah', property_categories: { name: 'Apartment' } },
  { property_id: 1041, title: 'Palm Grove Villa', city: 'Ahmedabad', locality: 'Thaltej', price: 34200000, status: 'available', listing_type: 'sale', bedrooms: 4, area_sqft: 3650, owner_name: 'Meera Patel', property_categories: { name: 'Villa' } },
  { property_id: 1040, title: 'Skyline Business Suite', city: 'Gandhinagar', locality: 'Gift City', price: 92000, status: 'rented', listing_type: 'rent', bedrooms: 0, area_sqft: 980, owner_name: 'Nirav Desai', property_categories: { name: 'Commercial' } },
  { property_id: 1039, title: 'Riverfront Heights', city: 'Ahmedabad', locality: 'Paldi', price: 12750000, status: 'sold', listing_type: 'sale', bedrooms: 2, area_sqft: 1580, owner_name: 'Kavya Mehta', property_categories: { name: 'Apartment' } },
  { property_id: 1038, title: 'Gardenia Corner House', city: 'Vadodara', locality: 'Alkapuri', price: 21900000, status: 'available', listing_type: 'sale', bedrooms: 3, area_sqft: 2760, owner_name: 'Rohan Trivedi', property_categories: { name: 'House' } },
]
const demoDeals = [
  { deal_id: 221, deal_status: 'pending', agreed_price: 18500000, deal_date: '2026-10-28', properties: { title: 'The Olive Residences' }, clients: { first_name: 'Ishaan', last_name: 'Kapoor' } },
  { deal_id: 220, deal_status: 'closed', agreed_price: 12750000, deal_date: '2026-10-25', properties: { title: 'Riverfront Heights' }, clients: { first_name: 'Anaya', last_name: 'Rao' } },
]
const demoPayments = [
  { payment_id: 501, status: 'completed', deals: { commission_amount: 255000, agreed_price: 12750000, commission_rate_pct: 2 } },
  { payment_id: 502, status: 'pending', deals: { commission_amount: 370000, agreed_price: 18500000, commission_rate_pct: 2 } },
]
const unwrap = x => Array.isArray(x) ? x[0] : x
const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0))
const compact = n => Number(n) >= 10000000 ? '₹' + (Number(n) / 10000000).toFixed(2) + ' Cr' : Number(n) >= 100000 ? '₹' + (Number(n) / 100000).toFixed(2) + ' L' : fmt(n)
const dateFmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

function Icon({ type, size = 18 }) {
  const shapes = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3"/></>,
    deal: <><path d="m3 12 4-4 4 1 3-2 7 5-4 5-5-2-3 2-6-5Z"/><path d="m7 8 3-3 5 1 3 3"/></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8h15a3 3 0 0 1 3 3v2h-5a2 2 0 0 1 0-4h5"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[type] || shapes.dashboard}</svg>
}

export default function App() {
  const [page, setPage] = useState('Dashboard')
  const [properties, setProperties] = useState(demo)
  const [deals, setDeals] = useState(demoDeals)
  const [payments, setPayments] = useState(demoPayments)
  const [categories, setCategories] = useState([{ category_id: 1, name: 'Apartment' }, { category_id: 2, name: 'Villa' }, { category_id: 3, name: 'Commercial' }])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [modal, setModal] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [form, setForm] = useState({ title: '', owner_name: '', city: '', locality: '', price: '', listing_type: 'sale', category_id: '', bedrooms: '2', area_sqft: '' })

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setError('')
    try {
      const [p, d, pay, c] = await Promise.all([
        supabase.from('properties').select('*, property_categories(name)').order('property_id', { ascending: false }),
        supabase.from('deals').select('deal_id, deal_status, agreed_price, deal_date, properties(title), clients(first_name,last_name)').order('deal_date', { ascending: false }).limit(8),
        supabase.from('payments').select('payment_id,status,deals(agreed_price,commission_amount,commission_rate_pct)').order('created_at', { ascending: false }).limit(200),
        supabase.from('property_categories').select('category_id,name').order('category_id'),
      ])
      const problem = p.error || d.error || pay.error || c.error
      if (problem) throw problem
      setProperties(p.data || []); setDeals(d.data || []); setPayments(pay.data || []); setCategories(c.data || [])
    } catch (e) { setError(e.message || 'Could not load Supabase data.') }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 3000); return () => clearTimeout(t) }, [notice])

  const stats = useMemo(() => {
    const paid = payments.filter(p => p.status === 'completed').reduce((s, p) => { const d = unwrap(p.deals); return s + Number(d?.commission_amount || Number(d?.agreed_price || 0) * Number(d?.commission_rate_pct || 2) / 100) }, 0)
    const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => { const d = unwrap(p.deals); return s + Number(d?.commission_amount || Number(d?.agreed_price || 0) * Number(d?.commission_rate_pct || 2) / 100) }, 0)
    return { total: properties.length, available: properties.filter(p => p.status === 'available').length, sold: properties.filter(p => p.status === 'sold').length, rented: properties.filter(p => p.status === 'rented').length, active: deals.filter(d => d.deal_status === 'pending').length, closedValue: deals.filter(d => d.deal_status === 'closed').reduce((s, d) => s + Number(d.agreed_price || 0), 0), closed: deals.filter(d => d.deal_status === 'closed').length, paid, pending }
  }, [properties, deals, payments])
  const filtered = useMemo(() => properties.filter(p => (`${p.title || ''} ${p.city || ''} ${p.locality || ''} ${p.owner_name || ''}`).toLowerCase().includes(query.toLowerCase()) && (status === 'all' || p.status === status)), [properties, query, status])

  async function saveProperty(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.owner_name.trim() || !form.city.trim() || Number(form.price) <= 0) { setNotice('Enter a property name, owner, city and valid price.'); return }
    const row = { title: form.title.trim(), owner_name: form.owner_name.trim(), city: form.city.trim(), locality: form.locality.trim() || null, price: Number(form.price), listing_type: form.listing_type, category_id: form.category_id ? Number(form.category_id) : categories[0]?.category_id, bedrooms: Number(form.bedrooms) || 0, area_sqft: Number(form.area_sqft) || 0, status: 'available' }
    if (!row.category_id) { setNotice('Add a property category in Supabase before creating a listing.'); return }
    setSaving(true)
    try {
      if (isSupabaseConfigured) {
        const { data, error: err } = await supabase.from('properties').insert(row).select('*, property_categories(name)').single()
        if (err) throw err
        setProperties(current => [data, ...current])
      } else {
        setProperties(current => [{ ...row, property_id: Math.max(0, ...current.map(p => Number(p.property_id) || 0)) + 1, property_categories: categories.find(c => c.category_id === row.category_id) }, ...current])
      }
      setModal(false); setForm({ title: '', owner_name: '', city: '', locality: '', price: '', listing_type: 'sale', category_id: '', bedrooms: '2', area_sqft: '' }); setNotice('Property added.')
    } catch (err) { setNotice('Could not save property: ' + (err.message || 'unknown error')) }
    finally { setSaving(false) }
  }
  async function updateStatus(p, next) {
    try {
      if (isSupabaseConfigured) { const { error: err } = await supabase.from('properties').update({ status: next }).eq('property_id', p.property_id); if (err) throw err }
      setProperties(current => current.map(x => x.property_id === p.property_id ? { ...x, status: next } : x)); setNotice('Listing status updated.')
    } catch (err) { setNotice('Status update failed: ' + err.message) }
  }
  const nav = <><button className={page === 'Dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => { setPage('Dashboard'); setMobile(false) }}><Icon type="dashboard"/><span>Dashboard</span></button><button className={page === 'Properties' ? 'nav-item active' : 'nav-item'} onClick={() => { setPage('Properties'); setMobile(false) }}><Icon type="building"/><span>Properties</span><b>{properties.length}</b></button></>

  return <div className="app-shell">
    <aside className={'sidebar ' + (mobile ? 'open' : '')}><div className="brand"><span className="brand-mark"><Icon type="home" size={21}/></span><div><strong>estateflow</strong><small>PROPERTY WORKSPACE</small></div><button className="icon-btn mobile-close" onClick={() => setMobile(false)} aria-label="Close menu"><Icon type="close"/></button></div><div className="nav-label">WORKSPACE</div><nav>{nav}</nav><div className="sidebar-bottom"><div className="help-card"><span className="help-symbol">?</span><strong>Need a hand?</strong><p>Everything you need to manage your listings, in one place.</p><button onClick={() => setNotice('Tip: search and filter your listings on the Properties page.')}>Quick tip <Icon type="arrow" size={14}/></button></div><div className="profile"><span className="avatar">PB</span><div><strong>Property Manager</strong><small>Workspace admin</small></div></div></div></aside>
    {mobile && <button className="scrim" onClick={() => setMobile(false)} aria-label="Close navigation"/>}
    <main className="main"><header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobile(true)} aria-label="Open navigation"><Icon type="menu"/></button><div className="crumb"><span>Workspace</span><span>/</span><strong>{page}</strong></div><div className="top-actions"><span className={'connection ' + (isSupabaseConfigured ? 'live' : '')}><i/>{isSupabaseConfigured ? 'Supabase connected' : 'Preview mode'}</span><span className="avatar small">PB</span></div></header>
      <div className="content">
        {error && <div className="error"><strong>Data connection issue</strong><span>{error}</span><button onClick={load}>Retry</button></div>}
        {page === 'Dashboard' ? <>
          <section className="heading-row"><div><div className="eyebrow"><i/> PORTFOLIO OVERVIEW</div><h1>Good morning, Piyush <span>✳</span></h1><p>Here’s what’s happening across your property portfolio.</p></div><div className="heading-actions"><button className="btn btn-secondary" onClick={() => setPage('Properties')}><Icon type="building" size={16}/> View inventory</button><button className="btn btn-primary" onClick={() => { setPage('Properties'); setModal(true) }}><Icon type="plus" size={17}/> Add property</button></div></section>
          <section className="metrics"><Metric title="Total properties" value={stats.total} foot="Across your portfolio" icon="building" tone="blue"/><Metric title="Available listings" value={stats.available} foot={(stats.total ? Math.round(stats.available / stats.total * 100) : 0) + '% of your inventory'} icon="home" tone="green"/><Metric title="Active deals" value={stats.active} foot="Awaiting completion" icon="deal" tone="purple"/><Metric title="Commission received" value={compact(stats.paid)} foot={compact(stats.pending) + ' pending'} icon="wallet" tone="amber"/></section>
          <section className="dashboard-grid"><article className="panel"><div className="panel-head"><div><h2>Property overview</h2><p>Inventory at a glance</p></div><button className="link-btn" onClick={() => setPage('Properties')}>View all →</button></div><div className="inventory"><div className="donut" style={{ '--avail': (stats.total ? stats.available / stats.total * 100 : 0) + '%', '--sold': (stats.total ? stats.sold / stats.total * 100 : 0) + '%' }}><div><strong>{stats.total}</strong><span>properties</span></div></div><div className="legend"><Legend label="Available" value={stats.available} total={stats.total} tone="green"/><Legend label="Sold" value={stats.sold} total={stats.total} tone="blue"/><Legend label="Rented" value={stats.rented} total={stats.total} tone="purple"/></div></div><div className="panel-bottom"><span><Icon type="check" size={15}/> Inventory status</span><strong>{stats.total ? Math.round(stats.available / stats.total * 100) : 0}% available</strong></div></article>
            <article className="panel"><div className="panel-head"><div><h2>Recent deal activity</h2><p>Latest updates from your pipeline</p></div></div>{deals.length ? <div className="activity">{deals.slice(0, 4).map(d => { const p = unwrap(d.properties), c = unwrap(d.clients); return <div className="activity-row" key={d.deal_id}><span className={'activity-symbol ' + (d.deal_status === 'closed' ? 'green' : 'amber')}><Icon type={d.deal_status === 'closed' ? 'check' : 'deal'} size={16}/></span><div className="activity-main"><strong>{p?.title || 'Deal #' + d.deal_id}</strong><small>{c ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : 'Client details unavailable'} · {dateFmt(d.deal_date)}</small></div><div className="activity-value"><strong>{compact(d.agreed_price)}</strong><span className={'badge ' + d.deal_status}>{d.deal_status}</span></div></div> })}</div> : <Empty text="No deal activity yet"/>}</article></section>
          <section className="panel"><div className="panel-head"><div><h2>Recently added properties</h2><p>The latest additions to your inventory</p></div><button className="link-btn" onClick={() => setPage('Properties')}>All properties →</button></div><PropertyTable items={properties.slice(0, 4)} compact onStatus={updateStatus}/></section>
          <section className="summary-strip"><Summary icon="deal" value={compact(stats.closedValue)} label="Closed deal value"/><Summary icon="check" value={stats.closed} label="Deals closed"/><Summary icon="wallet" value={payments.filter(p => p.status === 'pending').length} label="Payments awaiting completion"/></section>
        </> : <>
          <section className="heading-row"><div><div className="eyebrow"><i/> INVENTORY</div><h1>Properties</h1><p>Manage listings, pricing and availability in one place.</p></div><button className="btn btn-primary" onClick={() => setModal(true)}><Icon type="plus" size={17}/> Add property</button></section>
          <section className="metrics small-metrics"><Metric title="Total properties" value={stats.total} foot="Across your portfolio" icon="building" tone="blue"/><Metric title="Available" value={stats.available} foot="Ready for a new client" icon="home" tone="green"/><Metric title="Sold" value={stats.sold} foot="Successfully sold" icon="check" tone="purple"/><Metric title="Rented" value={stats.rented} foot="Currently rented" icon="wallet" tone="amber"/></section>
          <section className="panel inventory-table"><div className="table-title"><div><h2>All properties <span className="count">{filtered.length}</span></h2><p>Search and manage your property inventory.</p></div><button className="btn btn-primary" onClick={() => setModal(true)}><Icon type="plus" size={16}/> Add property</button></div><div className="filters"><label className="search-box"><Icon type="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by property, city or owner…" aria-label="Search properties"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><Icon type="close" size={14}/></button>}</label><select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="available">Available</option><option value="sold">Sold</option><option value="rented">Rented</option></select></div><PropertyTable items={filtered} onStatus={updateStatus}/></section>
        </>}
        <footer className="footer"><span>© 2026 EstateFlow</span><span>Property management, without the clutter.</span></footer>
      </div>
    </main>
    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false) }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><div className="eyebrow">NEW LISTING</div><h2 id="modal-title">Add a property</h2><p>Enter the basics to add it to your inventory.</p></div><button className="icon-btn" onClick={() => setModal(false)} aria-label="Close"><Icon type="close"/></button></div><form onSubmit={saveProperty}><div className="form-grid"><Field label="Property name *"><input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="The Olive Residences"/></Field><Field label="Owner name *"><input required value={form.owner_name} onChange={e => setForm({...form,owner_name:e.target.value})} placeholder="Full name"/></Field><Field label="City *"><input required value={form.city} onChange={e => setForm({...form,city:e.target.value})} placeholder="Ahmedabad"/></Field><Field label="Locality"><input value={form.locality} onChange={e => setForm({...form,locality:e.target.value})} placeholder="Neighbourhood"/></Field><Field label="Price (INR) *"><input required min="1" type="number" value={form.price} onChange={e => setForm({...form,price:e.target.value})} placeholder="18500000"/></Field><Field label="Listing type"><select value={form.listing_type} onChange={e => setForm({...form,listing_type:e.target.value})}><option value="sale">For sale</option><option value="rent">For rent</option></select></Field><Field label="Category"><select value={form.category_id} onChange={e => setForm({...form,category_id:e.target.value})}><option value="">Default category</option>{categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}</select></Field><Field label="Bedrooms"><input min="0" type="number" value={form.bedrooms} onChange={e => setForm({...form,bedrooms:e.target.value})}/></Field><Field label="Area (sq ft)"><input min="0" type="number" value={form.area_sqft} onChange={e => setForm({...form,area_sqft:e.target.value})} placeholder="1500"/></Field></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : <><Icon type="plus" size={16}/> Save property</>}</button></div></form></section></div>}
    {notice && <div className="toast" role="status"><Icon type="check" size={16}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><Icon type="close" size={14}/></button></div>}
  </div>
}

function Metric({title,value,foot,icon,tone}) { return <article className="metric"><div className="metric-top"><span>{title}</span><span className={'metric-icon '+tone}><Icon type={icon} size={19}/></span></div><strong className="metric-value">{value}</strong><div className="metric-foot"><i/>{foot}</div></article> }
function Legend({label,value,total,tone}) { return <div className="legend-row"><i className={tone}/><span>{label}</span><strong>{value}</strong><div className="legend-track"><i className={tone} style={{width:(total ? value/total*100 : 0)+'%'}}/></div></div> }
function Summary({icon,value,label}) { return <div className="summary-item"><span><Icon type={icon} size={18}/></span><div><strong>{value}</strong><small>{label}</small></div></div> }
function Empty({text}) { return <div className="empty"><span><Icon type="building" size={22}/></span><strong>{text}</strong><small>New activity will appear here.</small></div> }
function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label> }
function PropertyTable({items,onStatus,compact:small=false}) {
  if (!items.length) return <Empty text="No properties match your search"/>
  return <div className="table-scroll"><table className="properties-table"><thead><tr><th>PROPERTY</th><th>TYPE</th><th>PRICE</th><th>STATUS</th>{!small && <th>UPDATE STATUS</th>}</tr></thead><tbody>{items.map(p=><tr key={p.property_id}><td><div className="property-cell"><span className={'property-thumb t'+(Number(p.property_id)%4)}><Icon type="building" size={21}/></span><div><strong>{p.title || 'Untitled property'}</strong><small><Icon type="pin" size={12}/> {[p.locality,p.city].filter(Boolean).join(', ') || 'Location not set'}</small><em>{p.bedrooms || 0} beds · {Number(p.area_sqft || 0).toLocaleString('en-IN')} sq ft</em></div></div></td><td><strong className="type-name">{p.property_categories?.name || (p.listing_type === 'rent' ? 'Rental' : 'Residential')}</strong><small className="type-sub">For {p.listing_type === 'rent' ? 'rent' : 'sale'}</small></td><td><strong className="price">{compact(p.price)}</strong></td><td><span className={'badge '+(p.status || 'available')}><i/>{p.status || 'available'}</span></td>{!small && <td><select className="status-select" value={p.status || 'available'} onChange={e=>onStatus(p,e.target.value)} aria-label={'Update status for '+p.title}><option value="available">Available</option><option value="sold">Sold</option><option value="rented">Rented</option></select></td>}</tr>)}</tbody></table></div>
}
