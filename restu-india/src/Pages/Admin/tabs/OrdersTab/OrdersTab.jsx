import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { fmt } from '../../utils/adminUtils';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const q = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/orders${q}`)
      .then((r) => setOrders(r.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', ...ORDER_STATUSES].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 16px', borderRadius: 20, border: '1.5px solid', borderColor: statusFilter === s ? '#1A1218' : '#EDE8E3', background: statusFilter === s ? '#1A1218' : '#fff', color: statusFilter === s ? '#FDFBF9' : '#6B7280', fontWeight: 600, cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((o) => (
            <div key={o._id} style={{ background: '#fff', border: '1.5px solid #EDE8E3', borderRadius: 12, overflow: 'hidden' }}>
              <div onClick={() => setExpanded(expanded === o._id ? null : o._id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1A1218' }}>{o.orderNumber}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{o.user?.name || o.guestEmail || 'Guest'}</span>
                  <Badge status={o.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontWeight: 700, color: '#C4705A', fontSize: 14 }}>{fmt(o.totalPrice)}</span>
                  <span style={{ fontSize: 18, color: '#9CA3AF' }}>{expanded === o._id ? '\u25b2' : '\u25bc'}</span>
                </div>
              </div>

              {expanded === o._id && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #F5F0EB' }}>
                  <div className="admin-grid-2col" style={{ marginTop: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Items</p>
                      {o.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #F5F0EB' }}>
                          <span>{item.emoji} {item.name} ({item.size}) {'\u00d7'}{item.qty}</span>
                          <span style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shipping To</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                        {o.shipping?.fullName}<br />{o.shipping?.line1}, {o.shipping?.city}<br />{o.shipping?.pincode} - {o.shipping?.phone}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF' }}>UPDATE STATUS:</span>
                    {ORDER_STATUSES.filter((s) => s !== o.status).map((s) => (
                      <button key={s} onClick={() => updateStatus(o._id, s)} disabled={updating === o._id} style={{ padding: '5px 14px', borderRadius: 20, border: '1.5px solid #EDE8E3', background: '#FDFBF9', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: 12, textTransform: 'capitalize', opacity: updating === o._id ? 0.5 : 1 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {orders.length === 0 && <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>No orders found.</p>}
        </div>
      )}
    </div>
  );
}
