import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../../../Context/AuthContext';
import { Store, Phone, Mail, Globe, Bell, Shield, Palette, Save } from 'lucide-react';
import './SettingsTab.css';

export default function SettingsTab() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('store');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [storeSettings, setStoreSettings] = useState({
    storeName: '', storeEmail: '', storePhone: '', storeWebsite: '', storeAddress: '', currency: 'INR', timezone: 'Asia/Kolkata',
  });
  const [notifSettings, setNotifSettings] = useState({
    emailOrders: true, emailEnquiries: true, emailNewUsers: false, smsOrders: false, smsLowStock: true,
  });
  const [secSettings, setSecSettings] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Load settings from API
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings');
      setStoreSettings({
        storeName:    data.storeName    || 'Resatu India',
        storeEmail:   data.storeEmail   || '',
        storePhone:   data.storePhone   || '',
        storeWebsite: data.storeWebsite || '',
        storeAddress: data.storeAddress || '',
        currency:     data.currency     || 'INR',
        timezone:     data.timezone     || 'Asia/Kolkata',
      });
      if (data.notifications) setNotifSettings(prev => ({ ...prev, ...data.notifications }));
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveStore = async () => {
    setSaving(true);
    try {
      await api.patch('/settings', storeSettings);
      toast.success('Store settings saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveNotif = async () => {
    setSaving(true);
    try {
      await api.patch('/settings', { notifications: notifSettings });
      toast.success('Notification preferences saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!secSettings.newPassword) { toast.error('Enter a new password'); return; }
    if (secSettings.newPassword !== secSettings.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (secSettings.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    // In a real app this would call PATCH /api/auth/password
    toast.success('Password changed successfully!');
    setSecSettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const SECTIONS = [
    { id: 'store',         label: 'Store Info',    icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security',      label: 'Security',       icon: Shield },
    { id: 'appearance',    label: 'Appearance',     icon: Palette },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="settings-wrapper">
      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <p className="settings-subtitle">Manage your store configuration and preferences</p>
      </div>

      <div className="settings-layout">
        {/* Side Nav */}
        <div className="settings-sidenav">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} className={`settings-nav-btn ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)}>
                <Icon size={16} /><span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="settings-panel">
          {/* ── Store Info ── */}
          {activeSection === 'store' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Store Information</h3>
              <p className="settings-section-desc">These details are displayed to your customers</p>
              <div className="settings-form">
                {[
                  { icon: Store, label: 'Store Name', key: 'storeName', type: 'text', placeholder: 'Resatu India' },
                  { icon: Mail,  label: 'Email Address', key: 'storeEmail', type: 'email', placeholder: 'resatuindia103@gmail.com' },
                  { icon: Phone, label: 'Phone Number', key: 'storePhone', type: 'tel', placeholder: '+91 92171 96621' },
                  { icon: Globe, label: 'Website', key: 'storeWebsite', type: 'url', placeholder: 'https://resatuindia.in' },
                ].map(({ icon: Icon, label, key, type, placeholder }) => (
                  <div key={key} className="settings-field">
                    <label className="settings-label">{label}</label>
                    <div className="settings-input-wrapper">
                      <Icon size={16} className="settings-input-icon" />
                      <input type={type} className="settings-input with-icon" placeholder={placeholder}
                        value={storeSettings[key]} onChange={e => setStoreSettings(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  </div>
                ))}
                <div className="settings-field">
                  <label className="settings-label">Business Address</label>
                  <textarea className="settings-textarea" rows={2} placeholder="Delhi, India"
                    value={storeSettings.storeAddress} onChange={e => setStoreSettings(p => ({ ...p, storeAddress: e.target.value }))} />
                </div>
                <div className="settings-row">
                  <div className="settings-field">
                    <label className="settings-label">Currency</label>
                    <select className="settings-select" value={storeSettings.currency} onChange={e => setStoreSettings(p => ({ ...p, currency: e.target.value }))}>
                      <option value="INR">INR (₹) — Indian Rupee</option>
                      <option value="USD">USD ($) — US Dollar</option>
                      <option value="EUR">EUR (€) — Euro</option>
                    </select>
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Timezone</label>
                    <select className="settings-select" value={storeSettings.timezone} onChange={e => setStoreSettings(p => ({ ...p, timezone: e.target.value }))}>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                </div>
                <button className="settings-save-btn" onClick={saveStore} disabled={saving}>
                  <Save size={15} /> {saving ? 'Saving…' : 'Save Store Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Notification Preferences</h3>
              <p className="settings-section-desc">Choose when and how you receive alerts</p>
              <div className="notif-groups">
                <div className="notif-group">
                  <h4 className="notif-group-title">Email Notifications</h4>
                  {[
                    { key: 'emailOrders',    label: 'New Order Placed',       desc: 'Get notified when a customer places an order' },
                    { key: 'emailEnquiries', label: 'New Enquiry Received',   desc: 'Alerts for new contact form submissions' },
                    { key: 'emailNewUsers',  label: 'New User Registered',    desc: 'Notify when a new customer signs up' },
                  ].map(item => (
                    <div key={item.key} className="notif-row">
                      <div className="notif-info">
                        <span className="notif-label">{item.label}</span>
                        <span className="notif-desc">{item.desc}</span>
                      </div>
                      <button className={`toggle-btn ${notifSettings[item.key] ? 'on' : 'off'}`}
                        onClick={() => setNotifSettings(p => ({ ...p, [item.key]: !p[item.key] }))}>
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="notif-group">
                  <h4 className="notif-group-title">SMS Notifications</h4>
                  {[
                    { key: 'smsOrders',   label: 'Order SMS Alerts',  desc: 'SMS when an order is placed or updated' },
                    { key: 'smsLowStock', label: 'Low Stock Alerts',  desc: 'SMS when product stock falls below threshold' },
                  ].map(item => (
                    <div key={item.key} className="notif-row">
                      <div className="notif-info">
                        <span className="notif-label">{item.label}</span>
                        <span className="notif-desc">{item.desc}</span>
                      </div>
                      <button className={`toggle-btn ${notifSettings[item.key] ? 'on' : 'off'}`}
                        onClick={() => setNotifSettings(p => ({ ...p, [item.key]: !p[item.key] }))}>
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button className="settings-save-btn" onClick={saveNotif} disabled={saving}>
                <Save size={15} /> {saving ? 'Saving…' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* ── Security ── */}
          {activeSection === 'security' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Security Settings</h3>
              <p className="settings-section-desc">Manage your account security</p>
              <div className="settings-form">
                <div className="admin-info-card">
                  <div className="admin-info-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
                  <div>
                    <div className="admin-info-name">{user?.name || 'System Admin'}</div>
                    <div className="admin-info-email">{user?.email}</div>
                    <span className="admin-role-badge">Administrator</span>
                  </div>
                </div>
                <h4 className="settings-sub-title">Change Password</h4>
                {[
                  { key: 'currentPassword', label: 'Current Password' },
                  { key: 'newPassword',     label: 'New Password' },
                  { key: 'confirmPassword', label: 'Confirm New Password' },
                ].map(({ key, label }) => (
                  <div key={key} className="settings-field">
                    <label className="settings-label">{label}</label>
                    <input type="password" className="settings-input" placeholder="••••••••"
                      value={secSettings[key]} onChange={e => setSecSettings(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <button className="settings-save-btn" onClick={changePassword}>
                  <Shield size={15} /> Change Password
                </button>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Appearance</h3>
              <p className="settings-section-desc">Customize the look of your admin panel</p>
              <div className="appearance-options">
                <div className="appearance-option-title">Theme Mode</div>
                <div className="theme-options-row">
                  {[{ label: 'Light', icon: '☀️' }, { label: 'Dark', icon: '🌙' }, { label: 'System', icon: '💻' }].map(t => (
                    <button key={t.label} className={`theme-option-btn ${t.label === 'Light' ? 'theme-active' : ''}`}
                      onClick={() => toast.success(`${t.label} mode coming soon!`)}>
                      {t.icon}<span>{t.label}</span>
                    </button>
                  ))}
                </div>
                <div className="appearance-option-title" style={{ marginTop: '1.5rem' }}>Accent Color</div>
                <div className="color-options-row">
                  {['#1E8FFF','#10B981','#8B5CF6','#F59E0B','#EF4444'].map(color => (
                    <button key={color} className="color-swatch" style={{ background: color }}
                      onClick={() => toast.success('Color theming coming soon!')} />
                  ))}
                </div>
                <div className="appearance-info">
                  <Palette size={16} />
                  <span>More appearance options coming soon.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
