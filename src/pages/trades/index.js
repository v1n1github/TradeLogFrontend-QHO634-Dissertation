import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { getTrades, deleteTrade, updateTrade } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import TradeForm from '../../components/TradeForm';
import { SkeletonRow } from '../../components/LoadingSpinner';

function OutcomeBadge({ outcome }) {
  const map = { Win: 'badge-win', Loss: 'badge-loss', Breakeven: 'badge-be' };
  return <span className={map[outcome] || 'badge'}>{outcome}</span>;
}

function SortIcon({ active, order }) {
  if (!active) return <span className="text-text-muted opacity-30 ml-1">↕</span>;
  return <span className="text-accent-gold ml-1">{order === 'asc' ? '↑' : '↓'}</span>;
}

export default function TradeListPage() {
  const { authFetch } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [editTrade, setEditTrade] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTrades(authFetch, { sortBy, order });
      setTrades(res.data);
    } catch (e) {
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [authFetch, sortBy, order]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  function handleSort(field) {
    if (sortBy === field) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setOrder('desc'); }
  }

  async function handleEdit(data) {
    try {
      setEditLoading(true);
      await updateTrade(authFetch, editTrade.id, data);
      toast.success('Trade updated');
      setEditTrade(null);
      fetchTrades();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTrade(authFetch, id);
      toast.success('Trade deleted');
      setDeleteConfirm(null);
      fetchTrades();
    } catch (e) {
      toast.error('Delete failed');
    }
  }

  const filtered = trades.filter(t =>
    !search || t.instrument.toLowerCase().includes(search.toLowerCase()) ||
    t.outcome.toLowerCase().includes(search.toLowerCase()) ||
    t.direction.toLowerCase().includes(search.toLowerCase())
  );

  const SortTh = ({ field, label }) => (
    <th className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors select-none" onClick={() => handleSort(field)}>
      {label}<SortIcon active={sortBy === field} order={order} />
    </th>
  );

  return (
    <>
      <Head><title>Trade Log — TradeLog</title></Head>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-2xl text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>Trade Log</h1>
          <p className="text-text-muted text-sm mt-0.5">{loading ? '...' : `${trades.length} trades recorded`}</p>
        </div>
        <div className="flex gap-3 items-center">
          <input type="text" placeholder="Search instrument..." className="input w-44 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          <Link href="/trades/add" className="btn-primary whitespace-nowrap">+ Add Trade</Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full"><tbody className="divide-y divide-bg-border">{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-text-muted text-sm">{search ? `No trades matching "${search}"` : 'No trades yet.'}</p>
            {!search && <Link href="/trades/add" className="btn-primary mt-4 inline-flex">Log First Trade</Link>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full trade-table">
              <thead className="border-b border-bg-border">
                <tr>
                  <SortTh field="date" label="Date" />
                  <SortTh field="instrument" label="Instrument" />
                  <th className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">Dir</th>
                  <SortTh field="riskPercent" label="Risk %" />
                  <th className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">R:R</th>
                  <SortTh field="outcome" label="Outcome" />
                  <th className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">P&L</th>
                  <th className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">Rules</th>
                  <th className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">Refl.</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filtered.map(t => (
                  <tr key={t.id} className="transition-colors group">
                    <td className="px-4 py-3 text-sm text-text-secondary num whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary num">{t.instrument}</td>
                    <td className="px-4 py-3"><span className={t.direction === 'Long' ? 'badge-long' : 'badge-short'}>{t.direction === 'Long' ? '↑ L' : '↓ S'}</span></td>
                    <td className="px-4 py-3 text-sm num text-text-secondary">{t.riskPercent}%</td>
                    <td className="px-4 py-3 text-sm num text-text-secondary">{t.riskRewardRatio ? `${t.riskRewardRatio}R` : '—'}</td>
                    <td className="px-4 py-3"><OutcomeBadge outcome={t.outcome} /></td>
                    <td className="px-4 py-3 text-sm num">
                      {t.actualPnL != null ? <span className={t.actualPnL >= 0 ? 'text-outcome-win' : 'text-outcome-loss'}>{t.actualPnL >= 0 ? '+' : ''}{t.actualPnL.toFixed(2)}</span> : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{t.ruleAdherence ? <span className="text-outcome-win font-bold">✓</span> : <span className="text-outcome-loss">✗</span>}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/trades/${t.id}/reflection`} className="text-xs text-text-muted hover:text-accent-gold transition-colors">
                        {t.reflections?.length > 0 ? <span className="text-accent-gold">{t.reflections.length} 📝</span> : '+ add'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setEditTrade(t)}>Edit</button>
                        <button className="btn-ghost px-2 py-1 text-xs text-outcome-loss hover:text-outcome-loss" onClick={() => setDeleteConfirm(t)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!editTrade} onClose={() => setEditTrade(null)} title="Edit Trade" size="lg">
        {editTrade && (
          <TradeForm
            initialValues={{ ...editTrade, date: new Date(editTrade.date).toISOString().split('T')[0], entryPrice: editTrade.entryPrice?.toString(), stopLoss: editTrade.stopLoss?.toString(), takeProfit: editTrade.takeProfit?.toString() ?? '', riskPercent: editTrade.riskPercent?.toString(), riskRewardRatio: editTrade.riskRewardRatio?.toString() ?? '', actualPnL: editTrade.actualPnL?.toString() ?? '', notes: editTrade.notes ?? '' }}
            onSubmit={handleEdit} loading={editLoading} submitLabel="Update Trade"
          />
        )}
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Trade" size="sm">
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-text-secondary text-sm">Delete the <strong className="text-text-primary">{deleteConfirm.instrument}</strong> trade from <strong className="text-text-primary">{new Date(deleteConfirm.date).toLocaleDateString('en-GB')}</strong>? This also deletes linked reflections.</p>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
