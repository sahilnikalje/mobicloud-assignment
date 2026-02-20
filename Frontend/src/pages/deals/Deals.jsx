import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import {Button, Badge, Spinner, EmptyState, Modal} from '../../components' 
//!todo card to be added
import Layout from '../../components/Layout';
import DealForm from './DealForm';

const STAGES = ['prospect', 'negotiation', 'won', 'lost'];
const STAGE_COLORS = { prospect: 'var(--info)', negotiation: 'var(--warning)', won: 'var(--success)', lost: 'var(--danger)' };
const STAGE_ICONS = { prospect: '🎯', negotiation: '🤝', won: '🏆', lost: '❌' };

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [showForm, setShowForm] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/deals?limit=100');
      setDeals(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleDelete = async () => {
    try { await api.delete(`/deals/${deleteId}`); setDeleteId(null); fetchDeals(); }
    catch (err) { console.error(err); }
  };

  const updateStage = async (dealId, stage) => {
    try { await api.put(`/deals/${dealId}`, { stage }); fetchDeals(); }
    catch (err) { console.error(err); }
  };

  const dealsByStage = STAGES.reduce((acc, s) => {
    acc[s] = deals.filter(d => d.stage === s && (!filter || d.title.toLowerCase().includes(filter.toLowerCase())));
    return acc;
  }, {});

  const totalValue = (stage) => dealsByStage[stage]?.reduce((s, d) => s + d.value, 0) || 0;

  return (
    <Layout>
      <div style={{ padding: '32px' }} className="animate-fade">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>Deals Pipeline</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>{deals.length} total deals</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              placeholder="Search deals..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ padding: '9px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', width: '200px' }}
            />
            <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {['kanban', 'list'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '9px 16px', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                  background: view === v ? 'var(--accent)' : 'transparent', color: view === v ? '#fff' : 'var(--text-muted)'
                }}>{v === 'kanban' ? '⬛ Kanban' : '☰ List'}</button>
              ))}
            </div>
            <Button onClick={() => setShowForm(true)}>+ Add Deal</Button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Spinner size={40} /></div>
        ) : view === 'kanban' ? (
          /* KANBAN VIEW */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'start' }}>
            {STAGES.map(stage => (
              <div key={stage}>
                {/* Column Header */}
                <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span>{STAGE_ICONS[stage]}</span>
                    <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'capitalize', color: STAGE_COLORS[stage] }}>{stage}</span>
                    <span style={{ marginLeft: 'auto', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>{dealsByStage[stage].length}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>${totalValue(stage).toLocaleString()}</div>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dealsByStage[stage].length === 0 && (
                    <div style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No deals</div>
                  )}
                  {dealsByStage[stage].map(deal => (
                    <div key={deal._id} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                      padding: '14px', transition: 'var(--transition)', borderLeft: `3px solid ${STAGE_COLORS[stage]}`
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = STAGE_COLORS[stage]}
                      onMouseLeave={e => e.currentTarget.style.borderLeftColor = STAGE_COLORS[stage]}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>{deal.title}</div>
                      <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--success)', fontWeight: 700, marginBottom: '8px' }}>${deal.value?.toLocaleString()}</div>
                      {deal.lead && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>👤 {deal.lead.name}</div>}
                      {deal.expectedCloseDate && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>📅 {new Date(deal.expectedCloseDate).toLocaleDateString()}</div>}

                      {/* Stage Move */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                        {STAGES.filter(s => s !== stage).map(s => (
                          <button key={s} onClick={() => updateStage(deal._id, s)} style={{
                            fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            background: 'var(--bg-hover)', color: 'var(--text-muted)', fontWeight: 500
                          }}>→ {s}</button>
                        ))}
                        <button onClick={() => { setEditDeal(deal); }} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: 'var(--info-bg)', color: 'var(--info)', marginLeft: 'auto' }}>Edit</button>
                        <button onClick={() => setDeleteId(deal._id)} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: 'var(--danger-bg)', color: 'var(--danger)' }}>Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {deals.length === 0 ? (
              <EmptyState icon="💼" title="No deals yet" message="Create your first deal" action={<Button onClick={() => setShowForm(true)}>+ Add Deal</Button>} />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Title', 'Lead', 'Value', 'Stage', 'Probability', 'Close Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deals.filter(d => !filter || d.title.toLowerCase().includes(filter.toLowerCase())).map((deal, i) => (
                    <tr key={deal._id} style={{ borderBottom: i < deals.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '14px' }}>{deal.title}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{deal.lead?.name || '—'}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--success)' }}>${deal.value?.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px' }}><Badge label={deal.stage} type={deal.stage} /></td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{deal.probability}%</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setEditDeal(deal)} style={{ background: 'var(--info-bg)', border: 'none', color: 'var(--info)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => setDeleteId(deal._id)} style={{ background: 'var(--danger-bg)', border: 'none', color: 'var(--danger)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Deal" width={560}>
        <DealForm onSuccess={() => { setShowForm(false); fetchDeals(); }} onCancel={() => setShowForm(false)} />
      </Modal>
      <Modal open={!!editDeal} onClose={() => setEditDeal(null)} title="Edit Deal" width={560}>
        <DealForm deal={editDeal} onSuccess={() => { setEditDeal(null); fetchDeals(); }} onCancel={() => setEditDeal(null)} />
      </Modal>
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Deal" width={400}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Are you sure you want to delete this deal?</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </Layout>
  );
}