import { useEffect, useState } from 'react'
import { AlertTriangle, Pencil, Search, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'

interface Property {
  property_id: number
  title: string
  owner_name: string
  city: string
  locality: string
  area_sqft: number
  bedrooms: number
  bathrooms: number
  furnishing_status: string
  built_year: number
  description: string
  listing_type: string
  price: number
  status: string
  category_id: number
  agent_id: number
  property_categories?: { name: string }
  agents?: { first_name: string; last_name: string; agency_name: string }
}

const defaultForm = {
  category_id: '', agent_id: '', owner_name: '', title: '', city: '', locality: '',
  area_sqft: '', bedrooms: '', bathrooms: '', furnishing_status: 'semi-furnished',
  built_year: '', description: '', listing_type: 'sale', price: '',
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState<Property | null>(null)
  const [editPrice, setEditPrice] = useState<Property | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [form, setForm] = useState(defaultForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [propRes, catRes, agentRes] = await Promise.all([
      supabase.from('properties').select('*, property_categories(name), agents(first_name, last_name, agency_name)').order('property_id', { ascending: false }),
      supabase.from('property_categories').select('*').order('category_id'),
      supabase.from('agents').select('*').order('agent_id'),
    ])
    setProperties(propRes.data || [])
    setCategories(catRes.data || [])
    setAgents(agentRes.data || [])
    setLoading(false)
  }

  async function handleAdd() {
    if (!form.title || !form.owner_name || !form.category_id || !form.city || !form.price) {
      addToast('Please fill all required fields', 'error'); return
    }
    setSubmitting(true)
    const { error } = await supabase.from('properties').insert({
      category_id: Number(form.category_id),
      agent_id: form.agent_id ? Number(form.agent_id) : null,
      owner_name: form.owner_name,
      title: form.title,
      city: form.city,
      locality: form.locality,
      area_sqft: Number(form.area_sqft) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      furnishing_status: form.furnishing_status,
      built_year: Number(form.built_year) || null,
      description: form.description,
      listing_type: form.listing_type,
      price: Number(form.price),
      status: 'available',
    })
    setSubmitting(false)
    if (error) {
      addToast(`Failed: ${error.message}`, 'error')
    } else {
      addToast('Property added successfully!', 'success')
      setShowAdd(false)
      setForm(defaultForm)
      fetchAll()
    }
  }

  async function handleDelete() {
    if (!showDelete) return
    const id = showDelete.property_id
    // Cascade: commission_logs → payments → deals → property
    const dealIds = (await supabase.from('deals').select('deal_id').eq('property_id', id)).data?.map(d => d.deal_id) || []
    if (dealIds.length > 0) {
      await supabase.from('commission_logs').delete().in('deal_id', dealIds)
      await supabase.from('payments').delete().in('deal_id', dealIds)
      await supabase.from('deals').delete().eq('property_id', id)
    }
    const { error } = await supabase.from('properties').delete().eq('property_id', id)
    if (error) addToast(`Delete failed: ${error.message}`, 'error')
    else { addToast('Property deleted', 'success'); fetchAll() }
    setShowDelete(null)
  }

  async function handleUpdatePrice() {
    if (!editPrice || !newPrice) return
    setSubmitting(true)
    const { error } = await supabase.from('properties').update({ price: Number(newPrice) }).eq('property_id', editPrice.property_id)
    setSubmitting(false)
    if (error) addToast(`Failed: ${error.message}`, 'error')
    else { addToast('Price updated!', 'success'); setEditPrice(null); fetchAll() }
  }

  function fmt(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
    return `₹${n.toLocaleString('en-IN')}`
  }

  const filtered = properties.filter(p => {
    const matchSearch = `${p.title} ${p.city} ${p.owner_name}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>Properties</h2>
            <p>Manage properties — add with pricing, agent assignment, and status tracking</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Property</button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['all', 'available', 'sold', 'rented'].map(f => (
              <button key={f} className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="table-search">
            <span className="table-search-icon"><Search size={14} /></span>
            <input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={36} /></div>
            <h4>No properties found</h4>
            <p>Add a property to get started</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>City</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.property_id}>
                  <td>#{p.property_id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    <span className="property-title">{p.title}</span>
                    <br /><span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                      {p.property_categories?.name} · {p.listing_type} · {p.bedrooms}BHK · {Number(p.area_sqft).toLocaleString()} sqft
                    </span>
                  </td>
                  <td>{p.city}{p.locality ? `, ${p.locality}` : ''}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(Number(p.price))}</td>
                  <td>
                    <div className="status-card-group">
                      <span className={`badge ${p.status === 'available' ? 'active' : p.status === 'sold' ? 'sold' : 'rented'}`}>{p.status}</span>
                      <span className={`badge listing ${p.listing_type === 'rent' ? 'rent' : 'sale'}`}>
                        {p.listing_type === 'rent' ? 'for rent' : 'for sale'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditPrice(p); setNewPrice(String(p.price)) }}><Pencil size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(p)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== ADD PROPERTY MODAL ===== */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Property"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={submitting}>{submitting ? 'Adding...' : 'Add Property'}</button>
        </>}>
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input className="form-input" placeholder="2BHK Apartment in Andheri" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Owner Name *</label>
            <input className="form-input" placeholder="Raj Malhotra" value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select className="form-input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Assigned Agent</label>
            <select className="form-input" value={form.agent_id} onChange={e => setForm({ ...form, agent_id: e.target.value })}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.agent_id} value={a.agent_id}>{a.first_name} {a.last_name} ({a.agency_name})</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input className="form-input" placeholder="Mumbai" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Locality</label>
            <input className="form-input" placeholder="Andheri" value={form.locality} onChange={e => setForm({ ...form, locality: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Listing Type</label>
            <select className="form-input" value={form.listing_type} onChange={e => setForm({ ...form, listing_type: e.target.value })}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Price (₹) *</label>
            <input className="form-input" type="number" placeholder="16500000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Area (sqft)</label>
            <input className="form-input" type="number" placeholder="980" value={form.area_sqft} onChange={e => setForm({ ...form, area_sqft: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Built Year</label>
            <input className="form-input" type="number" placeholder="2020" value={form.built_year} onChange={e => setForm({ ...form, built_year: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Bedrooms</label>
            <input className="form-input" type="number" placeholder="2" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Bathrooms</label>
            <input className="form-input" type="number" placeholder="2" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Furnishing</label>
          <select className="form-input" value={form.furnishing_status} onChange={e => setForm({ ...form, furnishing_status: e.target.value })}>
            <option value="furnished">Furnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input className="form-input" placeholder="Spacious apartment near metro station" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      {/* ===== EDIT PRICE MODAL ===== */}
      <Modal open={!!editPrice} onClose={() => setEditPrice(null)} title="Update Price"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setEditPrice(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpdatePrice} disabled={submitting}>{submitting ? 'Updating...' : 'Update'}</button>
        </>}>
        {editPrice && (<>
          <div className="form-group"><label>Property</label><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{editPrice.title}</p></div>
          <div className="form-group"><label>Current</label><p style={{ color: 'var(--text-muted)' }}>{fmt(Number(editPrice.price))}</p></div>
          <div className="form-group"><label>New Price (₹)</label><input className="form-input" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} /></div>
        </>)}
      </Modal>

      {/* ===== DELETE CONFIRM ===== */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Confirm Delete"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowDelete(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </>}>
        <div className="confirm-body">
          <div className="confirm-icon"><AlertTriangle size={40} /></div>
          <p>Delete "{showDelete?.title}"?</p>
          <p className="confirm-detail">This will also remove all linked deals, payments, and commissions.</p>
        </div>
      </Modal>
    </div>
  )
}
