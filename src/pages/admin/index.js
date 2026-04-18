import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { adminGetDashboard } from '../../lib/api';
import StatCard from '../../components/StatCard';
import { SkeletonCard } from '../../components/LoadingSpinner';

function EvalStars({ score }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= Math.round(score) ? 'text-accent-gold' : 'text-bg-border'}>★</span>
      ))}
      <span className="ml-1 text-xs num text-text-secondary">{score}</span>
    </span>
  );
}

export default function AdminDashboardPage() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminGetDashboard(authFetch);
        setStats(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Head><title>Admin Overview — TradeLog</title></Head>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-gold text-lg">👑</span>
            <h1 className="font-bold text-2xl text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>Admin Overview</h1>
          </div>
          <p className="text-text-muted text-sm">Platform-wide trading activity and participant statistics</p>
        </div>
        <Link href="/admin/users" className="btn-primary hidden sm:flex">Manage Users</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-outcome-loss text-sm">⚠ {error}</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in">
          {/* Platform stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Registered Users" value={stats.totalUsers} sub="Trader accounts" color="gold" accent />
            <StatCard label="Active Traders" value={stats.activeUsers} sub="With trades logged" />
            <StatCard label="Total Trades" value={stats.totalTrades} sub="Across all users" />
            <StatCard label="Evaluations" value={stats.evalResponses} sub="Survey responses" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Platform Win Rate" value={`${stats.winRate}%`} color={stats.winRate >= 50 ? 'green' : 'red'} sub={`${stats.wins}W / ${stats.losses}L`} />
            <StatCard label="Avg Risk %" value={`${stats.avgRisk}%`} sub="All users combined" color={stats.avgRisk <= 1.5 ? 'green' : 'gold'} />
            <StatCard label="Net P&L (Total)" value={stats.netPnL >= 0 ? `+${stats.netPnL}` : stats.netPnL} color={stats.netPnL > 0 ? 'green' : 'red'} sub="All users combined" />
            <StatCard label="Rule Adherence" value={`${stats.adherenceRate}%`} color={stats.adherenceRate >= 80 ? 'green' : 'gold'} sub="Platform average" />
          </div>

          {/* Avg satisfaction */}
          {stats.avgSatisfaction && (
            <div className="card p-5">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Participant Satisfaction (Recent Evaluations)</h3>
              <div className="flex items-center gap-4">
                <EvalStars score={stats.avgSatisfaction} />
                <span className="text-text-muted text-xs">Average from {stats.evalResponses} response{stats.evalResponses !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {/* Recent evaluations */}
          {stats.recentEvals?.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
                <h3 className="text-sm font-medium text-text-secondary">Recent Evaluation Responses</h3>
                <Link href="/admin/evals" className="text-xs text-accent-gold hover:text-amber-400 transition-colors">View all →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full trade-table">
                  <thead>
                    <tr className="border-b border-bg-border">
                      {['Participant','Ease','Risk Help','Dashboard','Satisfaction','Date'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bg-border">
                    {stats.recentEvals.map(e => (
                      <tr key={e.id} className="transition-colors">
                        <td className="px-5 py-3 text-sm text-text-secondary">{e.user?.username || 'Anonymous'}</td>
                        <td className="px-5 py-3 text-sm num text-accent-gold">{e.easeOfUse}/5</td>
                        <td className="px-5 py-3 text-sm num text-accent-gold">{e.helpfulnessForRisk}/5</td>
                        <td className="px-5 py-3 text-sm num text-accent-gold">{e.clarityOfDashboard}/5</td>
                        <td className="px-5 py-3 text-sm num text-accent-gold">{e.satisfaction}/5</td>
                        <td className="px-5 py-3 text-sm text-text-muted num">{new Date(e.submittedAt).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'Create, edit, activate or deactivate trader accounts' },
              { href: '/admin/trades', icon: '📋', title: 'All Trades', desc: 'View and monitor every trade across all users' },
              { href: '/admin/evals', icon: '📊', title: 'Evaluations', desc: 'Review all usability survey responses' },
            ].map(({ href, icon, title, desc }) => (
              <Link key={href} href={href} className="card p-5 hover:border-accent-gold/30 hover:bg-bg-hover transition-all group">
                <div className="text-2xl mb-3">{icon}</div>
                <h4 className="font-medium text-text-primary group-hover:text-accent-gold transition-colors text-sm mb-1">{title}</h4>
                <p className="text-xs text-text-muted">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
