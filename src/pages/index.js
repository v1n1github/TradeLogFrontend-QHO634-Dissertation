import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../lib/api';
import StatCard from '../components/StatCard';
import { WinLossChart, RiskTrendChart, RiskByTradeChart } from '../components/charts/Charts';
import { SkeletonCard } from '../components/LoadingSpinner';

function OutcomeBadge({ outcome }) {
  const map = { Win: 'badge-win', Loss: 'badge-loss', Breakeven: 'badge-be' };
  return <span className={map[outcome] || 'badge'}>{outcome}</span>;
}

function PnL({ value }) {
  if (value == null) return <span className="text-text-muted num">—</span>;
  const color = value > 0 ? 'text-outcome-win' : value < 0 ? 'text-outcome-loss' : 'text-text-secondary';
  return <span className={`num font-medium ${color}`}>{value >= 0 ? '+' : ''}{value.toFixed(2)}</span>;
}

export default function DashboardPage() {
  const { authFetch, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboard(authFetch);
      setStats(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDashboard(); }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-text-secondary text-sm">Failed to load dashboard: {error}</p>
        <button className="btn-secondary text-sm" onClick={fetchDashboard}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <Head><title>Dashboard — TradeLog</title></Head>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">Welcome back, <span className="text-text-secondary">{user?.username}</span> · Your trading overview</p>
        </div>
        <Link href="/trades/add" className="btn-primary hidden sm:flex">+ Add Trade</Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      ) : stats?.totalTrades === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6 animate-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total Trades" value={stats.totalTrades} sub={`${stats.totalWins}W · ${stats.totalLosses}L · ${stats.totalBreakeven}BE`} accent />
            <StatCard label="Win Rate" value={`${stats.winRate}%`} sub={`${stats.totalWins} winning trades`} color={stats.winRate >= 50 ? 'green' : 'red'} />
            <StatCard label="Net P&L" value={stats.netPnL >= 0 ? `+${stats.netPnL}` : stats.netPnL} sub="Sum of all P&L" color={stats.netPnL > 0 ? 'green' : stats.netPnL < 0 ? 'red' : 'default'} />
            <StatCard label="Profit Factor" value={stats.profitFactor === 'N/A' ? 'N/A' : stats.profitFactor} sub="Wins / Losses" color={stats.profitFactor !== 'N/A' && stats.profitFactor >= 1.5 ? 'green' : 'default'} />
            <StatCard label="Avg R:R" value={stats.avgRRRatio > 0 ? `${stats.avgRRRatio}R` : '—'} sub="Risk-reward ratio" color="gold" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Avg Risk %" value={`${stats.avgRiskPercent}%`} sub="Per trade average" color={stats.avgRiskPercent <= 1 ? 'green' : stats.avgRiskPercent <= 2 ? 'gold' : 'red'} />
            <StatCard label="Risk Consistency" value={`±${stats.riskConsistency}%`} sub="Std deviation (lower = better)" color={stats.riskConsistency <= 0.3 ? 'green' : stats.riskConsistency <= 0.8 ? 'gold' : 'red'} />
            <StatCard label="Rule Adherence" value={`${stats.ruleAdherenceRate}%`} sub="Trades following rules" color={stats.ruleAdherenceRate >= 90 ? 'green' : stats.ruleAdherenceRate >= 70 ? 'gold' : 'red'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-medium text-text-secondary mb-4">Win / Loss Distribution</h3>
              <WinLossChart data={stats.winLossData} />
            </div>
            <div className="card p-5 lg:col-span-2">
              <h3 className="text-sm font-medium text-text-secondary mb-4">Risk % Trend Over Time</h3>
              <RiskTrendChart data={stats.riskTrend} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-medium text-text-secondary mb-1">Risk % per Trade — Coloured by Outcome</h3>
            <p className="text-xs text-text-muted mb-4">
              <span className="text-outcome-win">■</span> Win &nbsp;
              <span className="text-outcome-loss">■</span> Loss &nbsp;
              <span className="text-outcome-be">■</span> Breakeven
            </p>
            <RiskByTradeChart data={stats.riskByTrade} />
          </div>

          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
              <h3 className="text-sm font-medium text-text-secondary">Recent Trades</h3>
              <Link href="/trades" className="text-xs text-accent-gold hover:text-amber-400 transition-colors">View all →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full trade-table">
                <thead>
                  <tr className="border-b border-bg-border">
                    {['Date','Instrument','Direction','Risk %','Outcome','P&L','Rules'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {stats.recentTrades.map(t => (
                    <tr key={t.id} className="transition-colors">
                      <td className="px-5 py-3 text-sm text-text-secondary num">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                      <td className="px-5 py-3 text-sm font-medium text-text-primary num">{t.instrument}</td>
                      <td className="px-5 py-3"><span className={t.direction === 'Long' ? 'badge-long' : 'badge-short'}>{t.direction}</span></td>
                      <td className="px-5 py-3 text-sm num text-text-secondary">{t.riskPercent}%</td>
                      <td className="px-5 py-3"><OutcomeBadge outcome={t.outcome} /></td>
                      <td className="px-5 py-3 text-sm"><PnL value={t.actualPnL} /></td>
                      <td className="px-5 py-3 text-sm">{t.ruleAdherence ? <span className="text-outcome-win">✓</span> : <span className="text-outcome-loss">✗</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 animate-in">
      <div className="w-16 h-16 rounded-full bg-accent-gold-glow border border-accent-gold/30 flex items-center justify-center text-3xl">📊</div>
      <div className="text-center">
        <h3 className="text-text-primary font-medium text-lg mb-1">No trades yet</h3>
        <p className="text-text-muted text-sm max-w-xs">Start logging trades to see your risk metrics and performance charts.</p>
      </div>
      <Link href="/trades/add" className="btn-primary">Log Your First Trade</Link>
    </div>
  );
}
