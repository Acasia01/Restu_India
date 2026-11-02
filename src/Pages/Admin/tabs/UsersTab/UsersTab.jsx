import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../Context/AuthContext';
import api from '../../../../services/api';
import Spinner from '../../components/Spinner';
import { Search, UserCheck, UserX, Trash2, RefreshCw } from 'lucide-react';
import './UsersTab.css';

export default function UsersTab() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);
  const { user: me } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleRole = async (u) => {
    setToggling(u._id);
    try {
      const newRole = u.role === 'admin' ? 'user' : 'admin';
      await api.patch(`/users/${u._id}/role`, { role: newRole });
      toast.success(`${u.name} is now ${newRole}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update role');
    } finally {
      setToggling(null);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const avBgColors   = ['#EFF6FF','#ECFDF5','#FFF7ED','#F5F3FF','#FEF2F2'];
  const avTextColors = ['#1D4ED8','#047857','#C2410C','#6D28D9','#B91C1C'];

  return (
    <div className="users-tab-wrapper">
      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="users-search-box">
          <Search size={15} className="users-search-icon" />
          <input
            className="users-search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="users-toolbar-right">
          <span className="users-count-badge">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
          <button className="users-refresh-btn" onClick={load} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          {filtered.length === 0 && (
            <div className="users-empty">
              <Search size={32} />
              <p>No users found {search ? `for "${search}"` : ''}</p>
            </div>
          )}

          <div className="users-grid">
            {filtered.map((u, i) => {
              const isMe = u._id === me?._id;
              const bg   = avBgColors[i % 5];
              const col  = avTextColors[i % 5];
              return (
                <div key={u._id} className="user-card">
                  {/* Avatar */}
                  <div className="user-card-avatar" style={{ background: bg, color: col }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="user-card-info">
                    <div className="user-card-name">
                      {u.name}
                      {isMe && <span className="user-you-badge">You</span>}
                    </div>
                    <div className="user-card-email">{u.email}</div>
                    <div className="user-card-meta">
                      <span className={`user-role-pill ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                        {u.role}
                      </span>
                      <span className="user-joined">
                        Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isMe && (
                    <div className="user-card-actions">
                      <button
                        className={`user-action-btn ${u.role === 'admin' ? 'demote-btn' : 'promote-btn'}`}
                        onClick={() => toggleRole(u)}
                        disabled={toggling === u._id}
                        title={u.role === 'admin' ? 'Make User' : 'Make Admin'}
                      >
                        {toggling === u._id
                          ? '…'
                          : u.role === 'admin' ? <><UserX size={13} /> Demote</> : <><UserCheck size={13} /> Promote</>
                        }
                      </button>
                      <button
                        className="user-action-btn delete-btn"
                        onClick={() => deleteUser(u._id, u.name)}
                        title="Delete user"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
