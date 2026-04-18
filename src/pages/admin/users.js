import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiEye, FiShield, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../../lib/api';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

function RoleBadge({ role }) {
  return role === 'admin'
    ? <span className="badge bg-accent-gold-glow text-accent-gold border border-accent-gold/30">Admin</span>
    : <span className="badge bg-bg-border text-text-muted">Trader</span>;
}

function StatusDot({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${isActive ? 'text-outcome-win' : 'text-outcome-loss'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-outcome-win' : 'bg-outcome-loss'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

const EMPTY_FORM = { username: '', email: '', password: '', role: 'user' };

function ClampedValue({ value, className = '' }) {
  return (
    <span className={`line-clamp-1 ${className}`} title={value}>
      {value}
    </span>
  );
}

function ActionIconButton({ onClick, title, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border border-bg-border bg-bg-secondary text-text-muted transition-all duration-150 active:scale-95 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

function formatLastSignIn(lastLoginAt) {
  if (!lastLoginAt) return 'Never';
  return new Date(lastLoginAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsersPage() {
  const { authFetch, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await adminGetUsers(authFetch);
      setUsers(res.data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  function setField(f) { return e => { setForm(prev => ({ ...prev, [f]: e.target.value })); setFormErrors(prev => { const n = { ...prev }; delete n[f]; return n; }); }; }

  async function handleCreate(e) {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim() || form.username.length < 3) errs.username = 'At least 3 characters';
    if (!form.email.includes('@')) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6) errs.password = 'At least 6 characters';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    try {
      setFormLoading(true);
      await adminCreateUser(authFetch, form);
      toast.success(`User "${form.username}" created`);
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      loadUsers();
    } catch (e) {
      if (e.errors) {
        const errs2 = {};
        e.errors.forEach(er => { errs2[er.field] = er.message; });
        setFormErrors(errs2);
      } else toast.error(e.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleActive(user) {
    try {
      await adminUpdateUser(authFetch, user.id, { isActive: !user.isActive });
      toast.success(`${user.username} ${!user.isActive ? 'activated' : 'deactivated'}`);
      loadUsers();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleRoleToggle(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await adminUpdateUser(authFetch, user.id, { role: newRole });
      toast.success(`${user.username} is now ${newRole}`);
      loadUsers();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete() {
    try {
      await adminDeleteUser(authFetch, deleteUser.id);
      toast.success(`User "${deleteUser.username}" deleted`);
      setDeleteUser(null);
      loadUsers();
    } catch (e) {
      toast.error(e.message);
    }
  }

  const filtered = users.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>User Management — TradeLog Admin</title></Head>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-1">
            <Link href="/admin" className="hover:text-text-secondary transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-text-primary">Users</span>
          </nav>
          <h1 className="font-bold text-2xl text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>User Management</h1>
          <p className="text-text-muted text-sm mt-0.5">{users.length} accounts registered</p>
        </div>
        <div className="flex gap-3 items-center">
          <input type="text" placeholder="Search users..." className="input w-44 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-primary whitespace-nowrap" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setCreateOpen(true); }}>+ New User</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading users..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full trade-table">
              <thead className="border-b border-bg-border">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Last Sign In', 'Trades', 'Win Rate', 'Avg Risk', 'Net P&L', 'Rule Adh.', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filtered.map(u => (
                  <tr key={u.id} className="transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${u.role === 'admin' ? 'bg-accent-gold text-bg-primary' : 'bg-bg-border text-text-secondary'}`}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div className="max-w-[180px]">
                          <p className="text-sm font-medium text-text-primary line-clamp-1" title={u.username}>{u.username}</p>
                          <p className="text-xs text-text-muted">#{u.id}</p>
                        </div>
                        {u.id === currentUser.id && <span className="text-xs text-accent-gold-dim">(you)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted max-w-[230px]">
                      <ClampedValue value={u.email} />
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3"><StatusDot isActive={u.isActive} /></td>
                    <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap max-w-[150px]">
                      <ClampedValue value={formatLastSignIn(u.lastLoginAt)} />
                    </td>
                    <td className="px-4 py-3 text-sm num text-text-secondary">{u.tradeCount}</td>
                    <td className="px-4 py-3 text-sm num">
                      <span className={u.stats.winRate >= 50 ? 'text-outcome-win' : 'text-outcome-loss'}>{u.stats.winRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-sm num text-text-secondary">{u.stats.avgRisk}%</td>
                    <td className="px-4 py-3 text-sm num">
                      <span className={u.stats.netPnL >= 0 ? 'text-outcome-win' : 'text-outcome-loss'}>
                        {u.stats.netPnL >= 0 ? '+' : ''}{u.stats.netPnL}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm num">
                      <span className={u.stats.adherence >= 80 ? 'text-outcome-win' : 'text-yellow-500'}>{u.stats.adherence}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 items-center flex-nowrap">
                        <ActionIconButton
                          title="View user"
                          onClick={() => setViewUser(u)}
                          className="hover:text-accent-gold-dim hover:border-accent-gold/35 hover:bg-accent-gold/10"
                        >
                          <FiEye size={14} />
                        </ActionIconButton>
                        {u.id !== currentUser.id && (
                          <>
                            <ActionIconButton
                              title={u.role === 'admin' ? 'Switch to trader' : 'Switch to admin'}
                              onClick={() => handleRoleToggle(u)}
                              className="hover:text-outcome-be hover:border-outcome-be/35 hover:bg-outcome-be-bg"
                            >
                              <FiShield size={14} />
                            </ActionIconButton>
                            <ActionIconButton
                              title={u.isActive ? 'Deactivate user' : 'Activate user'}
                              onClick={() => handleToggleActive(u)}
                              className={u.isActive
                                ? 'hover:text-outcome-loss hover:border-outcome-loss/35 hover:bg-outcome-loss-bg'
                                : 'hover:text-outcome-win hover:border-outcome-win/35 hover:bg-outcome-win-bg'}
                            >
                              {u.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                            </ActionIconButton>
                            <ActionIconButton
                              title="Delete user"
                              onClick={() => setDeleteUser(u)}
                              className="hover:text-outcome-loss hover:border-outcome-loss/35 hover:bg-outcome-loss-bg"
                            >
                              <FiTrash2 size={14} />
                            </ActionIconButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New User" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input type="text" className={`input ${formErrors.username ? 'input-error' : ''}`} placeholder="e.g. trader_john" value={form.username} onChange={setField('username')} />
            {formErrors.username && <p className="error-text">{formErrors.username}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className={`input ${formErrors.email ? 'input-error' : ''}`} placeholder="john@example.com" value={form.email} onChange={setField('email')} />
            {formErrors.email && <p className="error-text">{formErrors.email}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className={`input ${formErrors.password ? 'input-error' : ''}`} placeholder="Min 6 characters" value={form.password} onChange={setField('password')} />
            {formErrors.password && <p className="error-text">{formErrors.password}</p>}
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={setField('role')}>
              <option value="user">Trader</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </Modal>

      {/* View User Modal */}
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title={viewUser ? `${viewUser.username}'s Profile` : ''} size="md">
        {viewUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${viewUser.role === 'admin' ? 'bg-accent-gold text-bg-primary' : 'bg-bg-border text-text-secondary'}`}>
                {viewUser.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-text-primary">{viewUser.username}</p>
                <p className="text-sm text-text-muted">{viewUser.email}</p>
                <div className="flex items-center gap-2 mt-1"><RoleBadge role={viewUser.role} /><StatusDot isActive={viewUser.isActive} /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-bg-border">
              {[['Total Trades', viewUser.tradeCount], ['Win Rate', `${viewUser.stats.winRate}%`], ['Net P&L', `${viewUser.stats.netPnL >= 0 ? '+' : ''}${viewUser.stats.netPnL}`], ['Avg Risk %', `${viewUser.stats.avgRisk}%`], ['Rule Adherence', `${viewUser.stats.adherence}%`], ['Evaluations', viewUser.evaluationCount]].map(([label, val]) => (
                <div key={label} className="bg-bg-secondary rounded-lg p-3">
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="num text-sm font-medium text-text-primary mt-1">{val}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-bg-border">
              <p className="text-xs text-text-muted">Joined: {new Date(viewUser.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-xs text-text-muted mt-1">Last sign in: {formatLastSignIn(viewUser.lastLoginAt)}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <Link href={`/admin/trades?userId=${viewUser.id}`} className="btn-secondary text-sm">View Their Trades</Link>
              <button className="btn-ghost text-sm" onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User" size="sm">
        {deleteUser && (
          <div className="space-y-4">
            <p className="text-text-secondary text-sm">
              Permanently delete <strong className="text-text-primary">@{deleteUser.username}</strong>?
              This will also delete all their trades, reflections, and evaluation responses. This action cannot be undone.
            </p>
            <div className="p-3 bg-outcome-loss-bg border border-outcome-loss/30 rounded-lg">
              <p className="text-outcome-loss text-xs">⚠ {deleteUser.tradeCount} trades will be deleted permanently.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setDeleteUser(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete User</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
