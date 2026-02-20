import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import {Badge, Button, Spinner, EmptyState, Pagination, Modal} from '../../components'
//*todo card to be added
import Layout from '../../components/Layout';

const TYPE_ICONS = { call: '📞', meeting: '📅', note: '📝', follow_up: '🔔' };
const TYPE_OPTS = [{ value: '', label: 'All Types' }, { value: 'call', label: '📞 Call' }, { value: 'meeting', label: '📅 Meeting' }, { value: 'note', label: '📝 Note' }, { value: 'follow_up', label: '🔔 Follow-up' }];
const STATUS_OPTS = [{ value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }];

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'call', title: '', description: '', status: 'pending', lead: '' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get('/leads?limit=100').then(res => setLeads(res.data.data)).catch(() => {});
  }, []);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (type) params.set('type', type);
      if (status) params.set('status', status);
      const res = await api.get(`/activities?${params}`);
      setActivities(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, type, status]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/activities', form);
      setShowForm(false);
      setForm({ type: 'call', title: '', description: '', status: 'pending', lead: '' });
      fetchActivities();
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, newStatus) => {
    try { await api.put(`/activities/${id}`, { status: newStatus }); fetchActivities(); }
    catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/activities/${deleteId}`); setDeleteId(null); fetchActivities(); }
    catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '1200px' }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>Activities</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>{pagination.total} activities logged</p>
          </div>
          <Button onClick={() => setShowForm(true)}>+ Log Activity</Button>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '20px', padding: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {TYPE_OPTS.map(opt => (
              <button key={opt.value} onClick={() => { setType(opt.value); setPage(1); }} style={{
                padding: '7px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: type === opt.value ? 'var(--accent)' : 'var(--bg-hover)',
                color: type === opt.value ? '#fff' : 'var(--text-secondary)'
              }}>{opt.label}</button>
            ))}
            <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
            {STATUS_OPTS.map(opt => (
              <button key={opt.value} onClick={() => { setStatus(opt.value); setPage(1); }} style={{
                padding: '7px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: status === opt.value ? 'var(--bg-hover)' : 'transparent',
                color: status === opt.value ? 'var(--text-primary)' : 'var(--text-muted)',
                outline: status === opt.value ? '1px solid var(--border-light)' : 'none'
              }}>{opt.label}</button>
            ))}
          </div>
        </Card>

        {/* Activity List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size={40} /></div>
        ) : activities.length === 0 ? (
          <EmptyState icon="📋" title="No activities found" message="Log calls, meetings, notes and follow-ups" action={<Button onClick={() => setShowForm(true)}>+ Log Activity</Button>} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.map(act => (
              <Card key={act._id} style={{ padding: '16px' }} hover>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {TYPE_ICONS[act.type]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{act.title}</span>
                      <Badge label={act.type} type={act.type} />
                      <Badge label={act.status} type={act.status} />
                    </div>
                    {act.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', lineHeight: 1.5 }}>{act.description}</p>}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {act.lead && <span>👤 {act.lead.name}</span>}
                      <span>🕐 {new Date(act.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {act.status === 'pending' && (
                      <button onClick={() => updateStatus(act._id, 'completed')} style={{ padding: '5px 10px', background: 'var(--success-bg)', color: 'var(--success)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>✓ Done</button>
                    )}
                    <button onClick={() => setDeleteId(act._id)} style={{ padding: '5px 10px', background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      </div>

      {/* Log Activity Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Log Activity" width={520}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Type *</label>
              <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px' }}>
                <option value="call">📞 Call</option>
                <option value="meeting">📅 Meeting</option>
                <option value="note">📝 Note</option>
                <option value="follow_up">🔔 Follow-up</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px' }}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title *</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Discovery Call with John"
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Lead *</label>
            <select required value={form.lead} onChange={e => setForm({ ...form, lead: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: form.lead ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '14px' }}>
              <option value="">Select a lead...</option>
              {leads.map(l => <option key={l._id} value={l._id}>{l.name} — {l.company || l.email}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Notes about this activity..."
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Log Activity</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Activity" width={400}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Are you sure you want to delete this activity?</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </Layout>
  );
}