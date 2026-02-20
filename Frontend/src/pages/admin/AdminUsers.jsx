import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {Badge, Button, Spinner, EmptyState, Modal} from '../../components'
//*todo card to be add
import Layout from '../../components/Layout';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [userLeads, setUserLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await api.get('/users'); setUsers(res.data.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleViewUser = async (user) => {
    setViewUser(user);
    setLeadsLoading(true);
    try { const res = await api.get(`/users/${user._id}`); setUserLeads(res.data.data.leads); }
    catch (err) { console.error(err); }
    finally { setLeadsLoading(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/users/${deleteId}`); setDeleteId(null); fetchUsers(); }
    catch (err) { console.error(err); }
  };

  const toggleActive = async (user) => {
    try { await api.put(`/users/${user._id}`, { isActive: !user.isActive }); fetchUsers(); }
    catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '1200px' }} className="animate-fade">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>{users.length} registered users</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size={40} /></div>
        ) : users.length === 0 ? (
          <EmptyState icon="🛡" title="No users found" />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Role', 'Email', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0
                        }}>{user.name?.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><Badge label={user.role} type={user.role} /></td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: user.isActive ? 'var(--success)' : 'var(--danger)' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.isActive ? 'var(--success)' : 'var(--danger)', display: 'inline-block' }} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleViewUser(user)} style={{ padding: '5px 10px', background: 'var(--info-bg)', color: 'var(--info)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>View Leads</button>
                        <button onClick={() => toggleActive(user)} style={{ padding: '5px 10px', background: user.isActive ? 'var(--warning-bg)' : 'var(--success-bg)', color: user.isActive ? 'var(--warning)' : 'var(--success)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => setDeleteId(user._id)} style={{ padding: '5px 10px', background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* View User Leads Modal */}
      <Modal open={!!viewUser} onClose={() => { setViewUser(null); setUserLeads([]); }} title={`${viewUser?.name}'s Leads`} width={600}>
        {leadsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
        ) : userLeads.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No leads assigned to this user</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userLeads.map(lead => (
              <div key={lead._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{lead.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lead.company || lead.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge label={lead.status} type={lead.status} />
                  <Badge label={lead.priority} type={lead.priority} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User" width={400}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>This will permanently delete the user account.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete User</Button>
        </div>
      </Modal>
    </Layout>
  );
}