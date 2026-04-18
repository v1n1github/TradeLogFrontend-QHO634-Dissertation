import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError('');
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.login.trim() || !form.password) {
      setError('Please enter your username/email and password.');
      return;
    }
    try {
      setLoading(true);
      const user = await login(form.login.trim(), form.password);
      // Redirect based on role
      router.push(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Login — TradeLog</title></Head>

      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-gold flex items-center justify-center shadow-gold">
                <span className="font-display font-bold text-bg-primary text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>TL</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-text-primary" style={{ fontFamily: 'Syne, sans-serif' }}>
                TradeLog
              </h1>
            </div>
            <p className="text-text-muted text-sm">Risk Journal · QHO634 Dissertation</p>
          </div>

          {/* Card */}
          <div className="card p-6 animate-in">
            <h2 className="text-lg font-semibold text-text-primary mb-5">Sign in to your account</h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="label">Username or Email</label>
                <input
                  type="text"
                  autoComplete="username"
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="e.g. trader_john"
                  value={form.login}
                  onChange={set('login')}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-outcome-loss-bg border border-outcome-loss/30 rounded-lg animate-in">
                  <span className="text-outcome-loss text-sm">⚠</span>
                  <p className="text-outcome-loss text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-4 text-xs text-center text-text-muted space-y-1.5">
              <span>
                Don't have an account?{' '}
                <Link href="/signup" className="text-accent-gold hover:text-accent-gold-dim transition-colors">Create account</Link>
              </span>
            </div>
          </div>

          {/* Demo credentials hint */}
          {/* <div className="mt-4 p-4 bg-bg-card border border-bg-border rounded-xl text-xs text-text-muted space-y-1.5">
            <p className="text-text-secondary font-medium text-xs uppercase tracking-wider mb-2">Access</p>
            <div className="flex justify-between"><span>Admin:</span><span className="num text-accent-gold">admin / admin123</span></div>
            <p>
              New trader?{' '}
              <Link href="/signup" className="text-accent-gold hover:text-accent-gold-dim transition-colors">Create account</Link>
            </p>
          </div> */}
        </div>
      </div>
    </>
  );
}

// Mark login page so _app.js skips Layout wrapper
LoginPage.noLayout = true;
