import { useState } from 'react';
import api from '../../utils/api';
import {Button, Input, Select, Textarea} from '../../components'

const STAGE_OPTS = [
  { value: 'prospect', label: 'Prospect' }, { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }
];

export default function DealForm({ deal, leadId, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: deal?.title || '', value: deal?.value || '', stage: deal?.stage || 'prospect',
    probability: deal?.probability || 0, expectedCloseDate: deal?.expectedCloseDate?.slice(0, 10) || '',
    notes: deal?.notes || '', lead: deal?.lead?._id || deal?.lead || leadId || '', lostReason: deal?.lostReason || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.value) errs.value = 'Value is required';
    if (!form.lead) errs.lead = 'Lead ID is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (deal) await api.put(`/deals/${deal._id}`, form);
      else await api.post('/deals', form);
      onSuccess();
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Failed to save deal' });
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {errors.server && (
        <div style={{ background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '14px', color: 'var(--danger)' }}>{errors.server}</div>
      )}
      <Input label="Deal Title *"  value={form.title} onChange={set('title')} error={errors.title} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Input label="Value (USD) *" type="number" placeholder="10000" value={form.value} onChange={set('value')} error={errors.value} />
        <Select label="Stage" value={form.stage} onChange={set('stage')} options={STAGE_OPTS} />
        <Input label="Probability (%)" type="number" min="0" max="100" value={form.probability} onChange={set('probability')} />
        <Input label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={set('expectedCloseDate')} />
      </div>
      {form.stage === 'lost' && (
        <Input label="Lost Reason" placeholder="Why was this deal lost?" value={form.lostReason} onChange={set('lostReason')} />
      )}
      <Textarea label="Notes" placeholder="Deal notes..." value={form.notes} onChange={set('notes')} />
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{deal ? 'Update Deal' : 'Create Deal'}</Button>
      </div>
    </form>
  );
}