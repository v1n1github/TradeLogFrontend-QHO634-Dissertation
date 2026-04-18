import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getTrade, createReflection } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import ReflectionForm, { ReflectionCard } from '../../../components/ReflectionForm';
import LoadingSpinner from '../../../components/LoadingSpinner';

function OutcomeBadge({ outcome }) {
  const map = { Win: 'badge-win', Loss: 'badge-loss', Breakeven: 'badge-be' };
  return <span className={map[outcome] || 'badge'}>{outcome}</span>;
}

export default function ReflectionPage() {
  const router = useRouter();
  const { id, new: isNew } = router.query;
  const { authFetch } = useAuth();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await getTrade(authFetch, id);
        setTrade(res.data);
        if (isNew) setShowForm(true);
      } catch (e) {
        toast.error('Trade not found');
        router.push('/trades');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isNew]);

  async function handleReflection(data) {
    try {
      setSubmitting(true);
      await createReflection(authFetch, id, data);
      toast.success('Reflection saved!');
      setShowForm(false);
      const res = await getTrade(authFetch, id);
      setTrade(res.data);
    } catch (e) {
      toast.error(e.message || 'Failed to save reflection');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading trade..." />;
  if (!trade) return null;

  return (
    <>
      <Head><title>Reflection — {trade.instrument} — TradeLog</title></Head>
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-text-secondary transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/trades" className="hover:text-text-secondary transition-colors">Trade Log</Link>
        <span>/</span>
        <span className="text-text-primary">{trade.instrument} Reflection</span>
      </nav>

      <div className="max-w-2xl space-y-5">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-xl text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>{trade.instrument}</h2>
                <span className={trade.direction === 'Long' ? 'badge-long' : 'badge-short'}>{trade.direction}</span>
                <OutcomeBadge outcome={trade.outcome} />
              </div>
              <p className="text-text-muted text-sm">{new Date(trade.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            {isNew && <span className="badge bg-accent-gold-glow text-accent-gold border border-accent-gold/30 text-xs">✓ Just logged</span>}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-bg-border">
            {[['Entry', trade.entryPrice],['Stop Loss', trade.stopLoss],['Take Profit', trade.takeProfit ?? '—'],['Risk %', `${trade.riskPercent}%`],['R:R', trade.riskRewardRatio ? `${trade.riskRewardRatio}R` : '—']].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-text-muted">{label}</p>
                <p className="num text-sm text-text-primary font-medium mt-0.5">{val}</p>
              </div>
            ))}
          </div>
          {trade.notes && (
            <div className="mt-4 pt-4 border-t border-bg-border">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-text-secondary">{trade.notes}</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-bg-border flex items-center gap-2">
            {trade.ruleAdherence ? <span className="text-xs text-outcome-win">✓ Rules followed</span> : <span className="text-xs text-outcome-loss">✗ Rules not followed</span>}
            {trade.actualPnL != null && (<><span className="text-text-muted">·</span><span className={`text-xs num font-medium ${trade.actualPnL >= 0 ? 'text-outcome-win' : 'text-outcome-loss'}`}>P&L: {trade.actualPnL >= 0 ? '+' : ''}{trade.actualPnL}</span></>)}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>Post-Trade Reflections</h3>
            {!showForm && <button className="btn-primary text-xs py-1.5 px-3" onClick={() => setShowForm(true)}>+ Add Reflection</button>}
          </div>
          {showForm && (
            <div className="card p-5 mb-4 animate-in">
              <ReflectionForm onSubmit={handleReflection} loading={submitting} onCancel={() => setShowForm(false)} />
            </div>
          )}
          {trade.reflections?.length === 0 && !showForm ? (
            <div className="card p-8 text-center">
              <p className="text-4xl mb-3">🧠</p>
              <p className="text-text-secondary text-sm mb-1">No reflections yet</p>
              <p className="text-text-muted text-xs max-w-xs mx-auto">Post-trade reflection is one of the most effective ways to improve trading discipline.</p>
              <button className="btn-secondary text-sm mt-4" onClick={() => setShowForm(true)}>Write a Reflection</button>
            </div>
          ) : (
            <div className="space-y-3">{trade.reflections?.map(r => <ReflectionCard key={r.id} reflection={r} />)}</div>
          )}
        </div>

        <div className="flex gap-3">
          <Link href="/trades" className="btn-secondary text-sm">← Back to Trade Log</Link>
          <Link href="/trades/add" className="btn-ghost text-sm">Log Another Trade</Link>
        </div>
      </div>
    </>
  );
}
