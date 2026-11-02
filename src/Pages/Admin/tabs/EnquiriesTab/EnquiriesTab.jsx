import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';

const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'];

export default function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/enquiries')
      .then((r) => setEnquiries(r.data.enquiries))
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.patch(`/enquiries/${id}`, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const deleteEnquiry = async (id) => {
    if (!confirm('Delete this enquiry?')) return;
    try {
      await api.delete(`/enquiries/${id}`);
      toast.success('Enquiry deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = statusFilter ? enquiries.filter((e) => e.status === statusFilter) : enquiries;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', ...ENQUIRY_STATUSES].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 16px', borderRadius: 20, border: '1.5px solid', borderColor: statusFilter === s ? '#1A1218' : '#EDE8E3', background: statusFilter === s ? '#1A1218' : '#fff', color: statusFilter === s ? '#FDFBF9' : '#6B7280', fontWeight: 600, cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((en) => (
            <div key={en._id} style={{ background: '#fff', border: '1.5px solid #EDE8E3', borderRadius: 12, overflow: 'hidden' }}>
              <div onClick={() => setExpanded(expanded === en._id ? null : en._id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1A1218' }}>{en.name}</span>
                  {en.phone && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{en.phone}</span>}
                  {en.email && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{en.email}</span>}
                  <Badge status={en.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{new Date(en.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span style={{ fontSize: 18, color: '#9CA3AF' }}>{expanded === en._id ? '\u25b2' : '\u25bc'}</span>
                </div>
              </div>

              {expanded === en._id && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #F5F0EB' }}>
                  <div className="admin-grid-2col" style={{ marginTop: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Details</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
                        <strong>Name:</strong> {en.name}<br />
                        {en.phone && <>{'\u{1F4DE}'} {en.phone}<br /></>}
                        {en.email && <>{'\u2709'} {en.email}<br /></>}
                        {en.company && <>{'\u{1F3E2}'} {en.company}<br /></>}
                        {en.category?.name && <><strong>Category:</strong> {en.category.name}<br /></>}
                        {en.purpose && <><strong>Purpose:</strong> {en.purpose}<br /></>}
                      </p>
                    </div>

                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{en.message}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF' }}>UPDATE STATUS:</span>
                    {ENQUIRY_STATUSES.filter((s) => s !== en.status).map((s) => (
                      <button key={s} onClick={() => updateStatus(en._id, s)} disabled={updating === en._id} style={{ padding: '5px 14px', borderRadius: 20, border: '1.5px solid #EDE8E3', background: '#FDFBF9', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: 12, textTransform: 'capitalize', opacity: updating === en._id ? 0.5 : 1 }}>
                        {s}
                      </button>
                    ))}
                    <button onClick={() => deleteEnquiry(en._id)} style={{ marginLeft: 'auto', background: '#FEF2F2', color: '#B91C1C', border: 'none', padding: '5px 14px', borderRadius: 20, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>No enquiries found.</p>}
        </div>
      )}
    </div>
  );
}
