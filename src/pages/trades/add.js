import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TradeForm from '../../components/TradeForm';
import { createTrade } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function AddTradePage() {
  const router = useRouter();
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data) {
    try {
      setLoading(true);
      const res = await createTrade(authFetch, data);
      toast.success('Trade logged successfully!');
      router.push(`/trades/${res.data.id}/reflection?new=1`);
    } catch (err) {
      if (err.errors?.length) toast.error(err.errors.map(e => e.message).join(', '));
      else toast.error(err.message || 'Failed to save trade');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Add Trade — TradeLog</title></Head>
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-text-secondary transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/trades" className="hover:text-text-secondary transition-colors">Trade Log</Link>
        <span>/</span>
        <span className="text-text-primary">Add Trade</span>
      </nav>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>Log New Trade</h1>
          <p className="text-text-muted text-sm mt-1">Record the full details of your trade including risk parameters.</p>
        </div>
        <div className="mb-5 p-4 bg-accent-gold-glow border border-accent-gold/20 rounded-xl text-sm text-text-secondary">
          <p className="text-accent-gold font-medium text-xs uppercase tracking-wider mb-1.5">💡 Risk discipline reminder</p>
          The <strong className="text-text-primary">Risk %</strong> field is critical. Keep it consistent (0.5–2%) across all trades.
          The <strong className="text-text-primary">Rule Adherence</strong> checkbox tracks your discipline over time.
        </div>
        <div className="card p-6">
          <TradeForm onSubmit={handleSubmit} loading={loading} submitLabel="Save Trade & Add Reflection" />
        </div>
      </div>
    </>
  );
}
