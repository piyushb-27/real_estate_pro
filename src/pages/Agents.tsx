import { useEffect, useState } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'

interface Agent {
  agent_id: number
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  agency_name: string | null
  experience_years: number | null
}

const defaultClientForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  agency_name: '',
  experience_years: '',
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [clientForm, setClientForm] = useState(defaultClientForm)
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    fetchAgents()
  }, [])

  async function fetchAgents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('agents')
      .select('agent_id, first_name, last_name, email, phone, agency_name, experience_years')
      .order('agent_id', { ascending: false })

    if (error) {
      addToast(`Failed to fetch agents: ${error.message}`, 'error')
      setAgents([])
    } else {
      setAgents(data || [])
    }
    setLoading(false)
  }

  async function handleAddAgent() {
    if (!clientForm.first_name.trim()) {
      addToast('First name is required', 'error')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from('agents').insert({
      first_name: clientForm.first_name.trim(),
      last_name: clientForm.last_name.trim() || null,
      email: clientForm.email.trim() ? clientForm.email.trim().toLowerCase() : null,
      phone: clientForm.phone.trim() || null,
      agency_name: clientForm.agency_name.trim() || null,
      experience_years: clientForm.experience_years ? Number(clientForm.experience_years) : 0,
    })
    setSubmitting(false)

    if (error) {
      if (error.message.includes('agents_pkey')) {
        addToast('Database sequence is out of sync. Run supabase/repair_sequences.sql once in Supabase SQL Editor.', 'error')
        return
      }
      addToast(`Failed: ${error.message}`, 'error')
      return
    }

    addToast('Agent added successfully', 'success')
    setShowAddAgent(false)
    setClientForm(defaultClientForm)
    fetchAgents()
  }

  const filteredAgents = agents.filter(a => {
    const text = `${a.first_name} ${a.last_name || ''} ${a.email || ''} ${a.phone || ''} ${a.agency_name || ''}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>Agents</h2>
            <p>View all registered agents and add new team members</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddAgent(true)}>
            <UserPlus size={16} /> Add Agent
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <h3>{filteredAgents.length} Agents</h3>
          <div className="table-search">
            <span className="table-search-icon"><Search size={14} /></span>
            <input
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={36} /></div>
            <h4>No agents found</h4>
            <p>Try a different search query</p>
          </div>
        ) : (
          <>
            <div className="desktop-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Agency</th>
                    <th>Contact</th>
                    <th>Experience</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map(agent => (
                    <tr key={agent.agent_id}>
                      <td>#{agent.agent_id}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {agent.first_name} {agent.last_name || ''}
                        <br />
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{agent.email || 'No email'}</span>
                      </td>
                      <td>{agent.agency_name || 'Independent'}</td>
                      <td>{agent.phone || 'No phone'}</td>
                      <td>{agent.experience_years || 0} yrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-card-list">
              {filteredAgents.map(agent => (
                <article key={`m-${agent.agent_id}`} className="mobile-record-card">
                  <div className="mobile-record-head">
                    <div className="mobile-record-id">#{agent.agent_id}</div>
                  </div>

                  <h4 className="mobile-record-title">{agent.first_name} {agent.last_name || ''}</h4>
                  <p className="mobile-record-subtitle">{agent.agency_name || 'Independent'}</p>

                  <div className="mobile-record-grid">
                    <div className="mobile-record-field">
                      <span className="mobile-record-field-label">Email</span>
                      <span className="mobile-record-field-value">{agent.email || 'No email'}</span>
                    </div>
                    <div className="mobile-record-field">
                      <span className="mobile-record-field-label">Phone</span>
                      <span className="mobile-record-field-value">{agent.phone || 'No phone'}</span>
                    </div>
                    <div className="mobile-record-field">
                      <span className="mobile-record-field-label">Experience</span>
                      <span className="mobile-record-field-value">{agent.experience_years || 0} yrs</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        open={showAddAgent}
        onClose={() => setShowAddAgent(false)}
        title="Add New Agent"
        footer={(
          <>
            <button className="btn btn-ghost" onClick={() => setShowAddAgent(false)} disabled={submitting}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddAgent} disabled={submitting}>{submitting ? 'Adding...' : 'Add Agent'}</button>
          </>
        )}
      >
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input className="form-input" value={clientForm.first_name} onChange={e => setClientForm({ ...clientForm, first_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input className="form-input" value={clientForm.last_name} onChange={e => setClientForm({ ...clientForm, last_name: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-input" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Agency Name</label>
            <input className="form-input" value={clientForm.agency_name} onChange={e => setClientForm({ ...clientForm, agency_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Experience (Years)</label>
            <input className="form-input" type="number" min={0} value={clientForm.experience_years} onChange={e => setClientForm({ ...clientForm, experience_years: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
