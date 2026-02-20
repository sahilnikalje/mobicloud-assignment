import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { useDebounce } from '../../hooks/useDebounce'
import { Badge, Button, Spinner, EmptyState, Pagination, Modal } from '../../components/index'
import Layout from '../../components/Layout'
import LeadForm from './LeadForm'

export default function Leads() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (status) params.set('status', status)
      if (priority) params.set('priority', priority)
      const res = await api.get(`/leads?${params}`)
      setLeads(res.data.data)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [page, debouncedSearch, status, priority])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { setPage(1) }, [debouncedSearch, status, priority])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try { await api.delete(`/leads/${deleteId}`); setDeleteId(null); fetchLeads() }
    catch (err) { console.error(err) }
    finally { setDeleteLoading(false) }
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
            <p className="text-gray-500 text-sm mt-1">{total} total leads</p>
          </div>
          <Button onClick={() => setShowForm(true)}>+ Add Lead</Button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 shadow-sm flex gap-3 flex-wrap">
          <input
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=" Search by name, email or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
            <option value="converted">Converted</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? <Spinner /> : leads.length === 0 ? (
            <EmptyState title="No leads found" message="Add your first lead or change filters" action={<Button onClick={() => setShowForm(true)}>+ Add Lead</Button>} />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Company', 'Email', 'Status', 'Priority', 'Assigned To', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map(lead => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition-all">
                    <td className="px-4 py-3 font-medium text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/leads/${lead._id}`)}>{lead.name}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.company || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.email}</td>
                    <td className="px-4 py-3"><Badge label={lead.status} type={lead.status} /></td>
                    <td className="px-4 py-3"><Badge label={lead.priority} type={lead.priority} /></td>
                    <td className="px-4 py-3 text-gray-500">{lead.assignedTo?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/leads/${lead._id}`)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100">View</button>
                        <button onClick={() => setDeleteId(lead._id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-gray-100">
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Lead">
        <LeadForm onSuccess={() => { setShowForm(false); fetchLeads() }} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <p className="text-gray-600 mb-6">Are you sure you want to delete this lead? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>Delete</Button>
        </div>
      </Modal>
    </Layout>
  )
}