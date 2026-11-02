import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import Spinner from '../../components/Spinner';
import './DashboardTab.css';
import {
  Package, Users, MessageSquare, Folder,
  TrendingUp, RefreshCw, CheckCircle, Clock,
  Star, Zap, Eye
} from 'lucide-react';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

const ENQ_COLOR = { new: '#F59E0B', contacted: '#3B82F6', closed: '#10B981' };
const ENQ_BG    = { new: '#FFF7ED', contacted: '#EFF6FF', closed: '#ECFDF5' };
const CAT_COLORS = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#06B6D4'];

export default function DashboardTab() {
  const [stats,      setStats]      = useState(null);
  const [products,   setProducts]   = useState([]);
  const [enquiries,  setEnquiries]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [sRes, pRes, eRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/products?limit=100&includeInactive=true'),
        api.get('/enquiries'),
      ]);
      setStats(sRes.data);
      setProducts(pRes.data.products || []);
      setEnquiries(eRes.data.enquiries || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!stats)  return <p className="dash-empty">No data available.</p>;

  const active    = products.filter(p => p.isActive !== false);
  const featured  = products.filter(p => p.isFeatured);
  const newArr    = products.filter(p => p.isNew);
  const totalCats = stats.categoryBreakdown?.length || 0;

  const newEnq = enquiries.filter(e => e.status === 'new');
  const conEnq = enquiries.filter(e => e.status === 'contacted');
  const cloEnq = enquiries.filter(e => e.status === 'closed');

  const recentEnq  = [...enquiries].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0, 4);
  const recentProd = [...products].sort((a,b) => new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0, 5);

  const catBd  = stats.categoryBreakdown || [];
  const maxCat = Math.max(...catBd.map(c=>c.count), 1);

  /* ── Donut calc ─────────────────────────────────────────────────────── */
  const total   = enquiries.length || 1;
  const circ    = 251.2;
  const nPct = Math.round((newEnq.length / total) * 100);
  const cPct = Math.round((conEnq.length / total) * 100);
  const dPct = Math.round((cloEnq.length / total) * 100);
  const nDash = `${(nPct/100)*circ} ${circ}`;
  const cDash = `${(cPct/100)*circ} ${circ}`;
  const dDash = `${(dPct/100)*circ} ${circ}`;
  const cOff  = -((nPct/100)*circ);
  const dOff  = -(((nPct+cPct)/100)*circ);

  return (
    <div className="dashboard-wrapper">

      {/* ── Page header + Refresh ──────────────────────────────────────── */}
      <div className="dash-top-row">
        <div className="dash-quick-pills">
          {[
            { icon: Star,  label: 'Featured',    val: featured.length, color: '#EA580C', bg: '#FFF7ED' },
            { icon: Zap,   label: 'New',         val: newArr.length,   color: '#059669', bg: '#ECFDF5' },
            { icon: Eye,   label: 'Catalog',     val: products.length, color: '#2563EB', bg: '#EFF6FF' },
          ].map(({ icon: Icon, label, val, color, bg }) => (
            <div key={label} className="dash-pill" style={{ background: bg, borderColor: `${color}30`, color }}>
              <Icon size={13} />
              <span>{val} {label}</span>
            </div>
          ))}
        </div>
        <button className="dash-refresh-btn" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>

      {/* ── 4 Stat Cards — 2×2 on all screens ───────────────────────── */}
      <div className="dash-stats-2x2">
        {[
          { label: 'Active Products',  value: active.length,       icon: Package,      cls: 'si-blue',   badge: 'Live' },
          { label: 'Total Customers',  value: stats.totalUsers,    icon: Users,        cls: 'si-green',  badge: null },
          { label: 'Total Enquiries',  value: enquiries.length,    icon: MessageSquare,cls: 'si-purple', badge: newEnq.length > 0 ? `${newEnq.length} new` : null, badgeWarn: true },
          { label: 'Categories',       value: totalCats,            icon: Folder,       cls: 'si-orange', badge: 'Active' },
        ].map(({ label, value, icon: Icon, cls, badge, badgeWarn }, i) => (
          <div key={i} className="dash-stat-card">
            <div className="dsc-top">
              <div className={`dsc-icon ${cls}`}><Icon size={18} /></div>
              {badge && (
                <span className="dsc-badge" style={badgeWarn ? { background: '#FEF3C7', color: '#D97706' } : {}}>
                  {badge}
                </span>
              )}
              {!badge && <TrendingUp size={12} className="dsc-trend" />}
            </div>
            <div className="dsc-value">{value}</div>
            <div className="dsc-label">{label}</div>
            <div className="dsc-spark">
              <svg viewBox="0 0 80 20" width="100%" height="16">
                <path
                  d={['M0,14 Q10,6 20,11 T40,5 T60,14 T80,8',
                      'M0,16 Q10,8 20,13 T40,6 T60,15 T80,10',
                      'M0,13 Q15,7 30,14 T60,7 T80,12',
                      'M0,12 Q20,4 40,14 T80,8'][i]}
                  fill="none"
                  stroke={['#3B82F6','#10B981','#8B5CF6','#F59E0B'][i]}
                  strokeWidth="1.8" strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 2-col layout ────────────────────────────────────────── */}
      <div className="dash-grid">

        {/* ═══ LEFT ═══════════════════════════════════════════════════ */}
        <div className="dash-col-left">

          {/* Recent Enquiries */}
          <div className="dash-card">
            <div className="dash-card-hdr">
              <h2 className="dash-card-title">Recent Enquiries</h2>
              {newEnq.length > 0 && <span className="dash-new-badge">{newEnq.length} unread</span>}
            </div>
            {recentEnq.length === 0
              ? <p className="dash-empty-msg">No enquiries yet</p>
              : (
                <div className="enq-list">
                  {recentEnq.map(enq => (
                    <div key={enq._id} className="enq-item">
                      <div className="enq-avatar" style={{ background: ENQ_BG[enq.status]||'#F1F5F9', color: ENQ_COLOR[enq.status]||'#64748B' }}>
                        {enq.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="enq-body">
                        <div className="enq-row1">
                          <span className="enq-name">{enq.name}</span>
                          <span className="enq-time">{timeAgo(enq.createdAt)}</span>
                        </div>
                        <div className="enq-company">{enq.company || enq.email || enq.phone || '—'}</div>
                        <p className="enq-msg">{enq.message}</p>
                        <span className="enq-status" style={{ background: ENQ_BG[enq.status]||'#F1F5F9', color: ENQ_COLOR[enq.status]||'#64748B' }}>
                          {enq.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Recently Added Products */}
          <div className="dash-card">
            <div className="dash-card-hdr">
              <h2 className="dash-card-title">Recently Added Products</h2>
              <span className="dash-count-badge">{products.length} total</span>
            </div>
            {recentProd.length === 0
              ? <p className="dash-empty-msg">No products yet</p>
              : (
                <div className="prod-list">
                  {recentProd.map(p => (
                    <div key={p._id} className="prod-item">
                      <div className="prod-thumb">{p.emoji || '📦'}</div>
                      <div className="prod-info">
                        <span className="prod-name">{p.name}</span>
                        <span className="prod-cat">{p.category?.name || '—'}</span>
                      </div>
                      <div className="prod-right">
                        <span className="prod-stock">
                          {p.variants?.length > 0
                            ? `${p.variants.reduce((s,v)=>s+(v.stock||0),0)} units`
                            : '—'}
                        </span>
                        <div className="prod-badges">
                          {p.isNew      && <span className="pbadge pbadge-new">NEW</span>}
                          {p.isFeatured && <span className="pbadge pbadge-feat">FEAT</span>}
                          {!p.isActive  && <span className="pbadge pbadge-off">OFF</span>}
                          {p.isActive && !p.isNew && !p.isFeatured && <span className="pbadge pbadge-ok">✓</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* ═══ RIGHT ══════════════════════════════════════════════════ */}
        <div className="dash-col-right">

          {/* Enquiry Status Donut */}
          <div className="dash-card">
            <div className="dash-card-hdr">
              <h2 className="dash-card-title">Enquiry Status</h2>
            </div>
            <div className="donut-wrap">
              <div className="donut-svg-wrap">
                <svg viewBox="0 0 100 100" width="110" height="110">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray={nDash} strokeDashoffset="0" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="10" strokeDasharray={cDash} strokeDashoffset={cOff} transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="10" strokeDasharray={dDash} strokeDashoffset={dOff} transform="rotate(-90 50 50)" />
                  <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="800" fill="#0F172A">{enquiries.length}</text>
                  <text x="50" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#94A3B8">TOTAL</text>
                </svg>
              </div>
              <div className="donut-legend-wrap">
                {[
                  { label: 'New',       count: newEnq.length, color: '#F59E0B' },
                  { label: 'Contacted', count: conEnq.length, color: '#3B82F6' },
                  { label: 'Closed',    count: cloEnq.length, color: '#10B981' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="dl-row">
                    <span className="dl-dot" style={{ background: color }} />
                    <span className="dl-label">{label}</span>
                    <span className="dl-val">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products by Category */}
          <div className="dash-card">
            <div className="dash-card-hdr">
              <h2 className="dash-card-title">By Category</h2>
            </div>
            {catBd.length === 0
              ? <p className="dash-empty-msg">No categories</p>
              : (
                <div className="cat-bar-list">
                  {catBd.map((cat, i) => (
                    <div key={i} className="cat-bar-item">
                      <div className="cat-bar-row1">
                        <span className="cat-bar-name">{cat.name}</span>
                        <span className="cat-bar-count">{cat.count}</span>
                      </div>
                      <div className="cat-bar-track">
                        <div className="cat-bar-fill" style={{ width: `${Math.round((cat.count/maxCat)*100)}%`, background: CAT_COLORS[i%CAT_COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Enquiry Pipeline */}
          <div className="dash-card">
            <div className="dash-card-hdr">
              <h2 className="dash-card-title">Enquiry Pipeline</h2>
            </div>
            <div className="pipeline-list">
              {[
                { label: 'New (Unread)',  val: newEnq.length,      icon: Clock,        color: '#F59E0B' },
                { label: 'In Progress',   val: conEnq.length,      icon: TrendingUp,   color: '#3B82F6' },
                { label: 'Closed',        val: cloEnq.length,      icon: CheckCircle,  color: '#10B981' },
                { label: 'Total',         val: enquiries.length,   icon: MessageSquare, color: '#8B5CF6' },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="pipeline-item">
                  <div className="pi-left">
                    <div className="pi-icon" style={{ background: `${color}18`, color }}><Icon size={14} /></div>
                    <span className="pi-label">{label}</span>
                  </div>
                  <span className="pi-val" style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog Summary */}
          <div className="dash-card">
            <div className="dash-card-hdr">
              <h2 className="dash-card-title">Catalog Summary</h2>
            </div>
            <div className="pipeline-list">
              {[
                { label: 'Total Products',  val: products.length,  color: '#3B82F6' },
                { label: 'Active',          val: active.length,    color: '#10B981' },
                { label: 'Featured',        val: featured.length,  color: '#EA580C' },
                { label: 'New Arrivals',    val: newArr.length,    color: '#8B5CF6' },
                { label: 'Customers',       val: stats.totalUsers, color: '#06B6D4' },
              ].map(({ label, val, color }) => (
                <div key={label} className="pipeline-item">
                  <div className="pi-left">
                    <span className="pi-dot" style={{ background: color }} />
                    <span className="pi-label">{label}</span>
                  </div>
                  <span className="pi-val" style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
