import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { Input, Select, Textarea, Button } from '../../components/index'

export default function LeadForm({ lead, onSuccess, onCancel }) {
  const { isAdmin, user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    status: lead?.status || 'new',
    priority: lead?.priority || 'medium',
    source: lead?.source || 'other',
    notes: lead?.notes || '',
    assignedTo: lead?.assignedTo?._id || lead?.assignedTo || user?._id
  })

  useEffect(() => {
    if (isAdmin) api.get('/users').then(r => setUsers(r.data.data.map(u => ({ value: u._id, label: u.name })))).catch(() => {})
  }, [isAdmin])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name required'
    if (!form.email) e.email = 'Email required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      if (lead) await api.put(`/leads/${lead._id}`, form)
      else await api.post('/leads', form)
      onSuccess()
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Failed to save' })
    } finally { setLoading(false) }
  }

  const s = k => e => setForm({ ...form, [k]: e.target.value })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.server && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{errors.server}</div>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name *"  value={form.name} onChange={s('name')} error={errors.name} />
        <Input label="Email *" type="email" value={form.email} onChange={s('email')} error={errors.email} />
        <Input label="Phone" value={form.phone} onChange={s('phone')} />
        <Input label="Company"  value={form.company} onChange={s('company')} />
        <Select label="Status" value={form.status} onChange={s('status')} options={[
          { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' },
          { value: 'qualified', label: 'Qualified' }, { value: 'unqualified', label: 'Unqualified' }, { value: 'converted', label: 'Converted' }
        ]} />
        <Select label="Priority" value={form.priority} onChange={s('priority')} options={[
          { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }
        ]} />
        <Select label="Source" value={form.source} onChange={s('source')} options={[
          { value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' },
          { value: 'social_media', label: 'Social Media' }, { value: 'cold_call', label: 'Cold Call' },
          { value: 'email', label: 'Email' }, { value: 'other', label: 'Other' }
        ]} />
        {isAdmin && <Select label="Assign To" value={form.assignedTo} onChange={s('assignedTo')} options={users} />}
      </div>
      <Textarea label="Notes" placeholder="Additional notes..." value={form.notes} onChange={s('notes')} />
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{lead ? 'Update Lead' : 'Create Lead'}</Button>
      </div>
    </form>
  )
}