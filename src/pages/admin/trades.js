import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { adminGetTrades, adminGetUsers } from '../../lib/api';
import { SkeletonRow } from '../../components/LoadingSpinner';

function OutcomeBadge({ outcome }) {
  const map = { Win: 'badge-win', Loss: 'badge-loss', Breakeven: 'badge-be' };
  return <span className={map[outcome] || 'badge'}>{outcome}</span>;
}

export default function AdminTradesPage() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ userId: '', outcome: '', instrument: '' });

  // Pre-fill userId filter from query param (e.g. from user profile)
  useEffect(() => {
    if (router.query.userId) setFilters(f => ({ ...f, userId: router.query.userId }));
  }, [router.query.userId]);

  useEffect(() => {
    async function load() {
      try {
        const [tradesRes, usersRes] = await Promise.all([
          adminGetTrades(authFetch, filters),
          adminGetUsers(authFetch),
        ]);
        setTrades(tradesRes.data);
        setUsers(usersRes.data);
      } catch (e) {
        toast.error('Failed to load trades');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  function setFilter(key) {
    return e => setFilters(f => ({ ...f, [key]: e.target.value }));
  }

  const totalRisk = trades.length ? (trades.reduce((s, t) => s + t.riskPercent, 0) / trades.length).toFixed(2) : 0;
  const wins = trades.filter(t => t.outcome === 'Win').length;
  const winRate = trades.length ? ((wins / trades.length) * 100).toFixed(1) : 0;

  return (
    <>
      <Head><title>All Trades — TradeLog Admin</title></Head>

      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-1">
          <Link href="/admin" className="hover:text-text-secondary transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-text-primary">All Trades</span>
        </nav>
        <h1 className="font-bold text-2xl text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>All Trades Monitor</h1>
        <p className="text-text-muted text-sm mt-0.5">View and filter every trade across all participants</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Filter by User</label>
          <select className="input min-w-40" value={filters.userId} onChange={setFilter('userId')}>
            <option value="">All Users</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Outcome</label>
          <select className="input" value={filters.outcome} onChange={setFilter('outcome')}>
            <option value="">All</option>
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Breakeven">Breakeven</option>
          </select>
        </div>
        <div>
          <label className="label">Instrument</label>
          <input type="text" className="input w-32" placeholder="e.g. XAUUSD" value={filters.instrument} onChange={setFilter('instrument')} />
        </div>
        <button className="btn-secondary text-sm" onClick={() => setFilters({ userId: '', outcome: '', instrument: '' })}>Clear</button>
      </div>

      {/* Summary bar */}
      {!loading && trades.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="card p-3 text-center">
            <p className="text-xs text-text-muted">Showing</p>
            <p className="num text-lg font-semibold text-text-primary">{trades.length}</p>
            <p className="text-xs text-text-muted">trades</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xs text-text-muted">Win Rate</p>
            <p className={`num text-lg font-semibold ${winRate >= 50 ? 'text-outcome-win' : 'text-outcome-loss'}`}>{winRate}%</p>
            <p className="text-xs text-text-muted">{wins}W / {trades.length - wins}L</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xs text-text-muted">Avg Risk</p>
            <p className="num text-lg font-semibold text-accent-gold">{totalRisk}%</p>
            <p className="text-xs text-text-muted">per trade</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full"><tbody className="divide-y divide-bg-border">{[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
          </div>
        ) : trades.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-text-muted text-sm">No trades match these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full trade-table">
              <thead className="border-b border-bg-border">
                <tr>
                  {['Trader','Date','Instrument','Direction','Risk %','R:R','Outcome','P&L','Rules','Reflections'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {trades.map(t => (
                  <tr key={t.id} className="transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-bg-border flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                          {t.user?.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm text-text-secondary">{t.user?.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary num whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary num">{t.instrument}</td>
                    <td className="px-4 py-3"><span className={t.direction === 'Long' ? 'badge-long' : 'badge-short'}>{t.direction === 'Long' ? '↑' : '↓'} {t.direction}</span></td>
                    <td className="px-4 py-3 text-sm num text-text-secondary">{t.riskPercent}%</td>
                    <td className="px-4 py-3 text-sm num text-text-secondary">{t.riskRewardRatio ? `${t.riskRewardRatio}R` : '—'}</td>
                    <td className="px-4 py-3"><OutcomeBadge outcome={t.outcome} /></td>
                    <td className="px-4 py-3 text-sm num">
                      {t.actualPnL != null ? <span className={t.actualPnL >= 0 ? 'text-outcome-win' : 'text-outcome-loss'}>{t.actualPnL >= 0 ? '+' : ''}{t.actualPnL.toFixed(2)}</span> : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{t.ruleAdherence ? <span className="text-outcome-win">✓</span> : <span className="text-outcome-loss">✗</span>}</td>
                    <td className="px-4 py-3 text-sm num text-text-muted">{t._count?.reflections ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
