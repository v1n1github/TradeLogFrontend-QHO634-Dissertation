import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, logout, isAdmin, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const USER_LINKS = [
    { href: '/',            label: 'Dashboard',  icon: '◈' },
    { href: '/trades/add',  label: 'Add Trade',  icon: '+' },
    { href: '/trades',      label: 'Trade Log',  icon: '≡' },
    { href: '/evaluation',  label: 'Evaluation', icon: '✦' },
  ];
  const ADMIN_LINKS = [
    { href: '/admin',         label: 'Overview',   icon: '◈' },
    { href: '/admin/users',   label: 'Users',      icon: '👥' },
    { href: '/admin/trades',  label: 'All Trades', icon: '≡' },
    { href: '/admin/evals',   label: 'Evaluations',icon: '✦' },
  ];

  const NAV_LINKS = isAdmin ? ADMIN_LINKS : USER_LINKS;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-accent-gold" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-text-muted text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null; // auth redirect handled by AuthContext

  return (
    <>
      <Head><title>TradeLog — Risk Journal</title></Head>
      <div className="min-h-screen flex flex-col">

        {/* ── Top Nav ── */}
        <header className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-sm border-b border-bg-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

            {/* Logo */}
            <Link href={isAdmin ? '/admin' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-accent-gold flex items-center justify-center">
                <span className="text-bg-primary font-bold text-xs" style={{ fontFamily: 'Syne, sans-serif' }}>TL</span>
              </div>
              <span className="font-bold text-base tracking-tight text-text-primary group-hover:text-accent-gold transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>
                TradeLog
              </span>
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-accent-gold-glow text-accent-gold border border-accent-gold/30 ml-1">
                  Admin
                </span>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon }) => {
                const active = href === (isAdmin ? '/admin' : '/') ? router.pathname === href : router.pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      active ? 'bg-accent-gold-glow text-accent-gold font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                    }`}>
                    <span className="text-xs opacity-70">{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side: user menu */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-accent-gold text-bg-primary' : 'bg-bg-border text-text-secondary'}`}>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm text-text-secondary">{user.username}</span>
                  <span className="text-text-muted text-xs">▾</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 card py-1 animate-in z-50" onClick={() => setUserMenuOpen(false)}>
                    <div className="px-3 py-2 border-b border-bg-border mb-1">
                      <p className="text-sm font-medium text-text-primary">{user.username}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                      <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-xs ${isAdmin ? 'bg-accent-gold-glow text-accent-gold' : 'bg-bg-border text-text-muted'}`}>
                        {isAdmin ? '👑 Admin' : '👤 Trader'}
                      </span>
                    </div>
                    {!isAdmin && (
                      <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
                        📊 My Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
                        👑 Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-outcome-loss hover:bg-outcome-loss-bg transition-colors"
                    >
                      ⎋ Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile burger */}
              <button className="md:hidden p-2 rounded-lg hover:bg-bg-hover transition-colors" onClick={() => setMobileOpen(o => !o)}>
                <div className="w-5 flex flex-col gap-1">
                  <span className={`block h-0.5 bg-text-secondary rounded transition-transform ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`}/>
                  <span className={`block h-0.5 bg-text-secondary rounded transition-opacity ${mobileOpen ? 'opacity-0' : ''}`}/>
                  <span className={`block h-0.5 bg-text-secondary rounded transition-transform ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`}/>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-bg-border bg-bg-secondary animate-in">
              {NAV_LINKS.map(({ href, label, icon }) => {
                const active = href === (isAdmin ? '/admin' : '/') ? router.pathname === href : router.pathname.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3.5 text-sm border-b border-bg-border/50 transition-colors ${active ? 'text-accent-gold bg-accent-gold-glow' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}`}>
                    <span>{icon}</span>{label}
                  </Link>
                );
              })}
              <button onClick={logout} className="w-full flex items-center gap-3 px-6 py-3.5 text-sm text-outcome-loss hover:bg-outcome-loss-bg transition-colors">
                ⎋ Sign Out
              </button>
            </div>
          )}
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>

        <footer className="border-t border-bg-border py-4 px-6 text-center">
          <p className="text-text-muted text-xs">
            TradeLog &mdash; QHO634 Dissertation · Southampton Solent University · 2025
          </p>
        </footer>
      </div>

      {/* Close user menu on outside click */}
      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </>
  );
}
