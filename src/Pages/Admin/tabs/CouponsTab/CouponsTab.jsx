import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import Spinner from '../../components/Spinner';
import { Plus, Trash2, Copy, Tag, Percent, RefreshCw } from 'lucide-react';
import './CouponsTab.css';

const EMPTY = { code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '' };

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addCoupon = async () => {
    if (!form.code.trim() || !form.value) {
      toast.error('Code and discount value are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/coupons', {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxUses: Number(form.maxUses) || 999,
        expiry: form.expiry || '2027-12-31',
      });
      toast.success(`Coupon "${form.code.toUpperCase()}" created!`);
      setModal(false);
      setForm(EMPTY);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await api.patch(`/coupons/${coupon._id}`, { active: !coupon.active });
      toast.success(`Coupon ${!coupon.active ? 'activated' : 'deactivated'}`);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    toast.success(`"${code}" copied!`);
  };

  if (loading) return <Spinner />;

  return (
    <div className="coupons-wrapper">
      {/* Header */}
      <div className="coupons-header">
        <div>
          <h2 className="coupons-title">Coupons & Discounts</h2>
          <p className="coupons-subtitle">Create and manage discount codes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="create-coupon-btn" style={{ background: '#F1F5F9', color: '#374151' }} onClick={load}>
            <RefreshCw size={14} />
          </button>
          <button className="create-coupon-btn" onClick={() => { setForm(EMPTY); setModal(true); }}>
            <Plus size={16} /> Create Coupon
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="coupon-summary-row">
        {[
          { label: 'Total Coupons', val: coupons.length, icon: Tag, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Active', val: coupons.filter(c => c.active).length, icon: Percent, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Total Uses', val: coupons.reduce((s, c) => s + (c.uses || 0), 0), icon: Tag, color: '#8B5CF6', bg: '#F5F3FF' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="coupon-sum-card">
              <div className="coupon-sum-icon" style={{ background: s.bg, color: s.color }}><Icon size={18} /></div>
              <div>
                <div className="coupon-sum-val">{s.val}</div>
                <div className="coupon-sum-label">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupons List */}
      <div className="coupons-list">
        {coupons.length === 0 && (
          <div className="coupons-empty">
            <Tag size={40} />
            <p>No coupons yet. Create your first one!</p>
          </div>
        )}
        {coupons.map(c => (
          <div key={c._id} className={`coupon-card ${!c.active ? 'coupon-inactive' : ''}`}>
            <div className="coupon-card-left">
              <div className="coupon-code-badge"><Tag size={14} /><span>{c.code}</span></div>
              <div className="coupon-details">
                <span className="coupon-discount">{c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}</span>
                <span className="coupon-meta">Min: ₹{c.minOrder}</span>
                <span className="coupon-meta">Uses: {c.uses || 0}/{c.maxUses}</span>
                <span className="coupon-meta">Expires: {c.expiry}</span>
              </div>
            </div>
            <div className="coupon-card-right">
              <span className={`coupon-status-badge ${c.active ? 'status-active' : 'status-expired'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </span>
              <div className="coupon-actions">
                <button className="coup-btn coup-copy" onClick={() => copyCoupon(c.code)} title="Copy code"><Copy size={14} /></button>
                <button className={`coup-btn ${c.active ? 'coup-deactivate' : 'coup-activate'}`} onClick={() => toggleActive(c)}>
                  {c.active ? 'Deactivate' : 'Activate'}
                </button>
                <button className="coup-btn coup-delete" onClick={() => deleteCoupon(c._id, c.code)} title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="coupon-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="coupon-modal">
            <h3 className="coupon-modal-title">Create New Coupon</h3>
            <div className="coupon-form">
              <div className="coupon-form-group">
                <label>Coupon Code *</label>
                <input className="coupon-input" placeholder="e.g. SAVE20" value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              </div>
              <div className="coupon-form-row">
                <div className="coupon-form-group">
                  <label>Type</label>
                  <select className="coupon-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="coupon-form-group">
                  <label>Value *</label>
                  <input className="coupon-input" type="number" placeholder={form.type === 'percent' ? '20' : '100'}
                    value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
                </div>
              </div>
              <div className="coupon-form-row">
                <div className="coupon-form-group">
                  <label>Min Order (₹)</label>
                  <input className="coupon-input" type="number" placeholder="500"
                    value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} />
                </div>
                <div className="coupon-form-group">
                  <label>Max Uses</label>
                  <input className="coupon-input" type="number" placeholder="100"
                    value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
                </div>
              </div>
              <div className="coupon-form-group">
                <label>Expiry Date</label>
                <input className="coupon-input" type="date" value={form.expiry}
                  onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} />
              </div>
            </div>
            <div className="coupon-modal-actions">
              <button className="coup-cancel-btn" onClick={() => setModal(false)}>Cancel</button>
              <button className="coup-save-btn" onClick={addCoupon} disabled={saving}>
                {saving ? 'Creating…' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
