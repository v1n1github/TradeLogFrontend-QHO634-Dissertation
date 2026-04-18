import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { adminGetEvaluations } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function ScorePill({ score }) {
  const color = score >= 4 ? 'text-outcome-win' : score >= 3 ? 'text-accent-gold' : 'text-outcome-loss';
  return <span className={`num font-semibold ${color}`}>{score}/5</span>;
}

function AvgBar({ value, max = 5 }) {
  const pct = (value / max) * 100;
  const color = value >= 4 ? 'bg-outcome-win' : value >= 3 ? 'bg-accent-gold' : 'bg-outcome-loss';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="num text-sm text-text-secondary w-6 text-right">{value}</span>
    </div>
  );
}

export default function AdminEvalsPage() {
  const { authFetch } = useAuth();
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminGetEvaluations(authFetch);
        setEvals(res.data);
      } catch (e) {
        toast.error('Failed to load evaluations');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Aggregate stats
  const avg = key => evals.length ? (evals.reduce((s, e) => s + e[key], 0) / evals.length).toFixed(2) : 0;
  const avgEase = avg('easeOfUse');
  const avgRisk = avg('helpfulnessForRisk');
  const avgDash = avg('clarityOfDashboard');
  const avgSat = avg('satisfaction');
  const overall = evals.length ? (((+avgEase + +avgRisk + +avgDash + +avgSat) / 4)).toFixed(2) : 0;

  return (
    <>
      <Head><title>Evaluations — TradeLog Admin</title></Head>

      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-1">
          <Link href="/admin" className="hover:text-text-secondary transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-text-primary">Evaluations</span>
        </nav>
        <h1 className="font-bold text-2xl text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>Usability Evaluations</h1>
        <p className="text-text-muted text-sm mt-0.5">{evals.length} survey response{evals.length !== 1 ? 's' : ''} collected</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading evaluations..." />
      ) : evals.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-text-secondary text-sm">No evaluation responses yet.</p>
          <p className="text-text-muted text-xs mt-1">Participants can submit the evaluation from the Evaluation page.</p>
        </div>
      ) : (
        <div className="space-y-5 animate-in">
          {/* Aggregate scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-medium text-text-secondary mb-4">Average Scores</h3>
              <div className="space-y-3">
                {[['Ease of Use', avgEase],['Risk Discipline Help', avgRisk],['Dashboard Clarity', avgDash],['Overall Satisfaction', avgSat]].map(([label, val]) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-text-muted">{label}</span>
                      <span className="num text-xs text-text-secondary">{val}/5</span>
                    </div>
                    <AvgBar value={+val} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5 flex flex-col items-center justify-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Overall Score</p>
              <p className="num text-6xl font-bold text-accent-gold">{overall}</p>
              <p className="text-text-muted text-sm mt-1">out of 5.00</p>
              <div className="flex items-center gap-1 mt-3">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={n <= Math.round(+overall) ? 'text-accent-gold text-xl' : 'text-bg-border text-xl'}>★</span>
                ))}
              </div>
              <p className="text-text-muted text-xs mt-2">From {evals.length} response{evals.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Individual responses table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-bg-border">
              <h3 className="text-sm font-medium text-text-secondary">Individual Responses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full trade-table">
                <thead className="border-b border-bg-border">
                  <tr>
                    {['#','Participant','Ease','Risk Help','Dashboard','Satisfaction','Date','Details'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {evals.map((e, i) => (
                    <tr key={e.id} className="transition-colors">
                      <td className="px-4 py-3 text-xs text-text-muted num">{i + 1}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{e.user?.username || 'Anonymous'}</td>
                      <td className="px-4 py-3"><ScorePill score={e.easeOfUse} /></td>
                      <td className="px-4 py-3"><ScorePill score={e.helpfulnessForRisk} /></td>
                      <td className="px-4 py-3"><ScorePill score={e.clarityOfDashboard} /></td>
                      <td className="px-4 py-3"><ScorePill score={e.satisfaction} /></td>
                      <td className="px-4 py-3 text-xs text-text-muted num">{new Date(e.submittedAt).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(e)} className="btn-ghost text-xs px-2 py-1">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" />
          <div className="relative card w-full max-w-lg animate-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
              <h3 className="font-semibold text-text-primary">Response from {selected.user?.username || 'Anonymous'}</h3>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary w-7 h-7 flex items-center justify-center rounded-lg hover:bg-bg-hover">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['Ease of Use', selected.easeOfUse],['Risk Help', selected.helpfulnessForRisk],['Dashboard', selected.clarityOfDashboard],['Satisfaction', selected.satisfaction]].map(([label, val]) => (
                  <div key={label} className="bg-bg-secondary rounded-lg p-3">
                    <p className="text-xs text-text-muted">{label}</p>
                    <ScorePill score={val} />
                  </div>
                ))}
              </div>
              {selected.likedMost && <div><p className="text-xs text-outcome-win uppercase tracking-wider mb-1">Liked most</p><p className="text-sm text-text-secondary">{selected.likedMost}</p></div>}
              {selected.couldBeImproved && <div><p className="text-xs text-yellow-500 uppercase tracking-wider mb-1">Could improve</p><p className="text-sm text-text-secondary">{selected.couldBeImproved}</p></div>}
              {selected.additionalComments && <div><p className="text-xs text-text-muted uppercase tracking-wider mb-1">Additional comments</p><p className="text-sm text-text-secondary">{selected.additionalComments}</p></div>}
              <p className="text-xs text-text-muted pt-2 border-t border-bg-border">Submitted: {new Date(selected.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
