import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { submitEvaluation } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const QUESTIONS = [
  { key: 'easeOfUse', label: 'Overall ease of use', description: 'How easy was it to navigate and use the system?' },
  { key: 'helpfulnessForRisk', label: 'Helpfulness for risk discipline', description: 'Did the system help you reflect on your risk management behaviour?' },
  { key: 'clarityOfDashboard', label: 'Clarity of dashboard', description: 'Were the charts and metrics clear and easy to understand?' },
  { key: 'satisfaction', label: 'Overall satisfaction', description: 'How satisfied are you with the system overall?' },
];
const LABELS = { 1: 'Very Poor', 2: 'Poor', 3: 'Neutral', 4: 'Good', 5: 'Excellent' };
const COLORS = { 1: 'border-outcome-loss text-outcome-loss', 2: 'border-orange-500 text-orange-500', 3: 'border-text-muted text-text-muted', 4: 'border-blue-400 text-blue-400', 5: 'border-outcome-win text-outcome-win' };

function LikertScale({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${value === n ? `${COLORS[n]}` : 'border-bg-border text-text-muted hover:border-bg-hover hover:text-text-secondary'}`}
          style={value === n ? { backgroundColor: 'rgba(255,255,255,0.04)' } : {}}>
          {n}
        </button>
      ))}
    </div>
  );
}

export default function EvaluationPage() {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({ easeOfUse: null, helpfulnessForRisk: null, clarityOfDashboard: null, satisfaction: null, likedMost: '', couldBeImproved: '', additionalComments: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate() {
    const e = {};
    QUESTIONS.forEach(({ key, label }) => { if (!form[key]) e[key] = `Please rate "${label}"`; });
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      await submitEvaluation(authFetch, { easeOfUse: form.easeOfUse, helpfulnessForRisk: form.helpfulnessForRisk, clarityOfDashboard: form.clarityOfDashboard, satisfaction: form.satisfaction, likedMost: form.likedMost || null, couldBeImproved: form.couldBeImproved || null, additionalComments: form.additionalComments || null });
      setSubmitted(true);
      toast.success('Evaluation submitted — thank you!');
    } catch (e) {
      toast.error(e.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Head><title>Evaluation — TradeLog</title></Head>
        <div className="max-w-lg mx-auto py-20 text-center animate-in">
          <div className="w-16 h-16 rounded-full bg-outcome-win-bg border border-outcome-win/30 flex items-center justify-center text-3xl mx-auto mb-6">✓</div>
          <h2 className="font-bold text-2xl text-text-primary mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Thank you!</h2>
          <p className="text-text-secondary text-sm mb-6">Your evaluation has been recorded. Your feedback is invaluable for the dissertation research.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-primary">Back to Dashboard</Link>
            <Link href="/trades" className="btn-secondary">View Trades</Link>
          </div>
        </div>
      </>
    );
  }

  const avgScore = QUESTIONS.filter(({ key }) => form[key]).reduce((s, { key }) => s + form[key], 0) / (QUESTIONS.filter(({ key }) => form[key]).length || 1);

  return (
    <>
      <Head><title>Usability Evaluation — TradeLog</title></Head>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-text-primary mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Usability Evaluation</h1>
          <p className="text-text-muted text-sm">QHO634 Dissertation — Southampton Solent University · Please complete after using the system.</p>
        </div>
        <div className="card p-4 mb-5 border-accent-gold/20">
          <p className="text-xs text-text-secondary leading-relaxed"><strong className="text-accent-gold">Study context:</strong> This evaluation is part of a Master&apos;s dissertation studying the usability and effectiveness of a trade journaling system for retail traders. Responses are anonymous and used only for academic analysis.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card p-5 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Rating Questions</h3>
              <div className="flex gap-3 text-xs text-text-muted">{[1,2,3,4,5].map(n => <span key={n} className="w-8 text-center">{n}</span>)}</div>
            </div>
            {QUESTIONS.map(({ key, label, description }) => (
              <div key={key}>
                <div className="mb-2">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="text-xs text-text-muted">{description}</p>
                </div>
                <LikertScale value={form[key]} onChange={v => set(key, v)} />
                {form[key] && <p className={`text-xs mt-1 ${COLORS[form[key]]}`}>{LABELS[form[key]]}</p>}
                {errors[key] && <p className="error-text">{errors[key]}</p>}
              </div>
            ))}
            {avgScore > 0 && QUESTIONS.every(({ key }) => form[key]) && (
              <div className="pt-3 border-t border-bg-border flex items-center gap-3">
                <span className="text-xs text-text-muted">Your average rating:</span>
                <span className="num text-sm font-medium text-accent-gold">{avgScore.toFixed(1)} / 5</span>
              </div>
            )}
          </div>
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Open-ended Questions</h3>
            <div>
              <label className="label">What did you like most?</label>
              <textarea className="input resize-none" rows={2} maxLength={1000} value={form.likedMost} onChange={e => set('likedMost', e.target.value)} />
            </div>
            <div>
              <label className="label">What could be improved?</label>
              <textarea className="input resize-none" rows={2} maxLength={1000} value={form.couldBeImproved} onChange={e => set('couldBeImproved', e.target.value)} />
            </div>
            <div>
              <label className="label">Any additional comments?</label>
              <textarea className="input resize-none" rows={2} maxLength={1000} value={form.additionalComments} onChange={e => set('additionalComments', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pb-6">
            <Link href="/" className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Evaluation'}</button>
          </div>
        </form>
      </div>
    </>
  );
}
