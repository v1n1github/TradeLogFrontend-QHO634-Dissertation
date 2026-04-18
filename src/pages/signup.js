import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
    const { signup } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [errorField, setErrorField] = useState('');
    const [loading, setLoading] = useState(false);

    function set(field) {
        return (e) => {
            setForm((f) => ({ ...f, [field]: e.target.value }));
            setError('');
            setErrorField('');
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!form.username.trim() || form.username.trim().length < 3) {
            setError('Username must be at least 3 characters.');
            setErrorField('username');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) {
            setError('Username can only contain letters, numbers, and underscores.');
            setErrorField('username');
            return;
        }

        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            setError('Please enter a valid email address.');
            setErrorField('email');
            return;
        }

        if (!form.password || form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            setErrorField('password');
            return;
        }

        if (!form.confirmPassword) {
            setError('Please confirm your password.');
            setErrorField('confirmPassword');
            return;
        } else if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            setErrorField('confirmPassword');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setErrorField('');
            await signup({
                username: form.username.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });
            router.push('/');
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
            setErrorField(err?.errors?.[0]?.field || '');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head><title>Sign Up - TradeLog</title></Head>

            <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-gold/3 rounded-full blur-3xl" />
                </div>

                <div className="relative w-full max-w-sm">
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

                    <div className="card p-6 animate-in">
                        <h2 className="text-lg font-semibold text-text-primary mb-5">Create your trader account</h2>

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <div>
                                <label className="label">Username</label>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    className={`input ${errorField === 'username' ? 'input-error' : ''}`}
                                    placeholder="e.g. trader_john"
                                    value={form.username}
                                    onChange={set('username')}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    className={`input ${errorField === 'email' ? 'input-error' : ''}`}
                                    placeholder="e.g. john@domain.com"
                                    value={form.email}
                                    onChange={set('email')}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    className={`input ${errorField === 'password' ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={set('password')}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="label">Confirm Password</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    className={`input ${errorField === 'confirmPassword' ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={set('confirmPassword')}
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
                                        Creating account...
                                    </span>
                                ) : 'Sign Up'}
                            </button>
                        </form>
                        <div className="mt-4 pt-4 text-xs text-center text-text-muted space-y-1.5">
                            <p>
                                Already have an account?{' '}
                                <Link href="/login" className="text-accent-gold hover:text-accent-gold-dim transition-colors">Sign in</Link>
                            </p>
                        </div>
                    </div>

                    {/* <div className="mt-4 p-4 bg-bg-card border border-bg-border rounded-xl text-xs text-text-muted space-y-1.5">
                        <p>
                            Already have an account?{' '}
                            <Link href="/login" className="text-accent-gold hover:text-accent-gold-dim transition-colors">Sign in</Link>
                        </p>
                        <p>
                            Admin accounts are provisioned by system setup.
                        </p>
                    </div> */}
                </div>
            </div>
        </>
    );
}

SignupPage.noLayout = true;
