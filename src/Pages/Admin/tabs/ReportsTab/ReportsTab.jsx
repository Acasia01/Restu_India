import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import Spinner from '../../components/Spinner';
import { fmt } from '../../utils/adminUtils';
import { Download, TrendingUp, ShoppingCart, Users, Package, RefreshCw } from 'lucide-react';
import './ReportsTab.css';

export default function ReportsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Monthly');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!stats) return <p style={{ color: '#94A3B8', textAlign: 'center', padding: '3rem' }}>No data.</p>;

  const monthly = stats.monthlyRevenue || [];
  const maxRev  = Math.max(...monthly.map(m => m.revenue), 1);

  const ordersByStatus = {};
  (stats.ordersByStatus || []).forEach(s => { ordersByStatus[s._id] = s.count; });
  const delivered = ordersByStatus.delivered || 0;
  const pending   = ordersByStatus.pending   || 0;
  const cancelled = ordersByStatus.cancelled || 0;

  const STAT_CARDS = [
    { title: 'Total Revenue',  value: fmt(stats.totalRevenue),  icon: TrendingUp,  color: '#10B981', bg: '#ECFDF5' },
    { title: 'Total Orders',   value: stats.totalOrders,        icon: ShoppingCart, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Total Customers', value: stats.totalUsers,        icon: Users,        color: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Active Products', value: stats.totalProducts,     icon: Package,      color: '#F59E0B', bg: '#FFF7ED' },
  ];

  return (
    <div className="reports-wrapper">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h2 className="reports-title">Reports & Analytics</h2>
          <p className="reports-subtitle">Live data from your store — last updated just now</p>
        </div>
        <div className="reports-actions">
          <div className="period-selector">
            {['Weekly', 'Monthly', 'Yearly'].map(p => (
              <button key={p} className={`period-sel-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
          <button className="export-btn" onClick={() => toast.success('Exporting report…')}>
            <Download size={14} /> Export PDF
          </button>
          <button className="export-btn" style={{ background: '#F1F5F9', color: '#374151' }} onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="reports-stats-grid">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="report-stat-card">
              <div className="report-stat-icon" style={{ background: card.bg, color: card.color }}><Icon size={20} /></div>
              <div className="report-stat-info">
                <span className="report-stat-label">{card.title}</span>
                <span className="report-stat-value">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Bar Chart — real data */}
      <div className="reports-card">
        <div className="reports-card-header">
          <h3 className="reports-card-title">Monthly Revenue</h3>
          <div className="reports-legend">
            <span className="legend-dot-inline" style={{ background: '#3B82F6' }} />
            <span>Revenue (₹)</span>
          </div>
        </div>
        {monthly.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem', fontSize: 13 }}>No revenue data yet</p>
        ) : (
          <div className="bar-chart-wrapper">
            {monthly.map((d, i) => (
              <div key={i} className="bar-col">
                <div className="bar-value">{d.revenue > 0 ? `₹${(d.revenue / 1000).toFixed(0)}k` : '—'}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${Math.max((d.revenue / maxRev) * 100, d.revenue > 0 ? 4 : 0)}%` }} />
                </div>
                <div className="bar-label">{d.month}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="reports-bottom-grid">
        {/* Order Summary — real data */}
        <div className="reports-card">
          <div className="reports-card-header">
            <h3 className="reports-card-title">Order Summary</h3>
          </div>
          <div className="order-summary-list">
            {[
              { label: 'Total Orders',  val: stats.totalOrders,  color: '#3B82F6' },
              { label: 'Delivered',     val: delivered,           color: '#10B981' },
              { label: 'Pending',       val: pending,             color: '#F59E0B' },
              { label: 'Cancelled',     val: cancelled,           color: '#EF4444' },
              { label: 'New Enquiries', val: stats.newEnquiries || 0, color: '#8B5CF6' },
            ].map((row, i) => (
              <div key={i} className="summary-row">
                <div className="summary-left">
                  <span className="summary-dot" style={{ background: row.color }} />
                  <span className="summary-label">{row.label}</span>
                </div>
                <span className="summary-val" style={{ color: row.color }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories — real data */}
        <div className="reports-card">
          <div className="reports-card-header">
            <h3 className="reports-card-title">Products by Category</h3>
          </div>
          <div className="category-report-list">
            {(stats.categoryBreakdown || []).length === 0 && (
              <p style={{ color: '#94A3B8', fontSize: 13 }}>No products yet</p>
            )}
            {(stats.categoryBreakdown || []).map((cat, i) => {
              const maxCount = Math.max(...(stats.categoryBreakdown || []).map(c => c.count), 1);
              const pct = Math.round((cat.count / maxCount) * 100);
              return (
                <div key={i} className="cat-report-row">
                  <div className="cat-report-info">
                    <span className="cat-report-name">{cat.name}</span>
                    <span className="cat-report-sales">{cat.count} product{cat.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="cat-report-bar-track">
                    <div className="cat-report-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
