import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { Badge, Button, Modal, Spinner } from '../../components/index'
import Layout from '../../components/Layout'
import LeadForm from './LeadForm'
import DealForm from '../deals/DealForm'

const ICONS = { call: '📞', meeting: '📅', note: '📝', follow_up: '🔔' }

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [deals, setDeals] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeal, setShowDeal] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [actForm, setActForm] = useState({ type: 'call', title: '', description: '', status: 'pending' })

  const fetchAll = async () => {
    try {
      const [lr, dr, ar] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/deals?leadId=${id}`),
        api.get(`/activities?leadId=${id}`)
      ])
      setLead(lr.data.data)
      setDeals(dr.data.data)
      setActivities(ar.data.data)
    } catch { navigate('/leads') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleLogActivity = async (e) => {
    e.preventDefault()
    try {
      await api.post('/activities', { ...actForm, lead: id })
      setShowActivity(false)
      setActForm({ type: 'call', title: '', description: '', status: 'pending' })
      fetchAll()
    } catch (err) { console.error(err) }
  }

  if (loading) return <Layout><Spinner /></Layout>
  if (!lead) return null

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-700">{value || '—'}</p>
    </div>
  )

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button onClick={() => navigate('/leads')} className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← Back to Leads</button>
            <h1 className="text-2xl font-bold text-gray-800">{lead.name}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge label={lead.status} type={lead.status} />
              <Badge label={lead.priority} type={lead.priority} />
              {lead.source && <Badge label={lead.source.replace(/_/g, ' ')} />}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowEdit(true)}>✏️ Edit</Button>
            <Button onClick={() => setShowDeal(true)}>+ Add Deal</Button>
            <Button variant="ghost" onClick={() => setShowActivity(true)}>📋 Log Activity</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left */}
          <div className="col-span-2 space-y-5">
            {/* Contact Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" value={lead.email} />
                <Field label="Phone" value={lead.phone} />
                <Field label="Company" value={lead.company} />
                <Field label="Source" value={lead.source?.replace(/_/g, ' ')} />
                <Field label="Assigned To" value={lead.assignedTo?.name} />
                <Field label="Created" value={new Date(lead.createdAt).toLocaleDateString()} />
              </div>
              {lead.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-600">{lead.notes}</p>
                </div>
              )}
            </div>

            {/* Deals */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Deals ({deals.length})</h3>
                <Button size="sm" onClick={() => setShowDeal(true)}>+ Add Deal</Button>
              </div>
              {deals.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No deals yet</p>
              ) : (
                <div className="space-y-3">
                  {deals.map(deal => (
                    <div key={deal._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{deal.title}</p>
                        {deal.expectedCloseDate && <p className="text-xs text-gray-400 mt-0.5">Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-600">${deal.value?.toLocaleString()}</span>
                        <Badge label={deal.stage} type={deal.stage} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Activity History</h3>
              <button onClick={() => setShowActivity(true)} className="text-sm text-blue-600 hover:underline">+ Log</button>
            </div>
            {activities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No activities yet</p>
            ) : (
              <div className="space-y-4">
                {activities.map((act, i) => (
                  <div key={act._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-sm flex-shrink-0">{ICONS[act.type]}</div>
                      {i < activities.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-800">{act.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge label={act.type} type={act.type} />
                        <Badge label={act.status} type={act.status} />
                      </div>
                      {act.description && <p className="text-xs text-gray-500 mt-1">{act.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(act.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Lead">
        <LeadForm lead={lead} onSuccess={() => { setShowEdit(false); fetchAll() }} onCancel={() => setShowEdit(false)} />
      </Modal>

      <Modal open={showDeal} onClose={() => setShowDeal(false)} title="Add Deal">
        <DealForm leadId={id} onSuccess={() => { setShowDeal(false); fetchAll() }} onCancel={() => setShowDeal(false)} />
      </Modal>

      <Modal open={showActivity} onClose={() => setShowActivity(false)} title="Log Activity">
        <form onSubmit={handleLogActivity} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Type *</label>
              <select required value={actForm.type} onChange={e => setActForm({ ...actForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="call">📞 Call</option>
                <option value="meeting">📅 Meeting</option>
                <option value="note">📝 Note</option>
                <option value="follow_up">🔔 Follow-up</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
              <select value={actForm.status} onChange={e => setActForm({ ...actForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
            <input required value={actForm.title} onChange={e => setActForm({ ...actForm, title: e.target.value })} placeholder="e.g. Discovery call" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea value={actForm.description} onChange={e => setActForm({ ...actForm, description: e.target.value })} placeholder="Notes..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowActivity(false)}>Cancel</Button>
            <Button type="submit">Log Activity</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}