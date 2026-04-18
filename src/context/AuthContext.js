import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const AuthContext = createContext(null);

const PUBLIC_ROUTES = ['/login', '/signup'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token
  const router = useRouter();

  // ── Restore session from localStorage on mount ───────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('tl_token');
    const storedUser = localStorage.getItem('tl_user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('tl_token');
        localStorage.removeItem('tl_user');
      }
    }
    setLoading(false);
  }, []);

  // ── Redirect to login if unauthenticated ─────────────────────────────────
  useEffect(() => {
    if (!loading && !user && !PUBLIC_ROUTES.includes(router.pathname)) {
      router.replace('/login');
    }
  }, [loading, user, router.pathname]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (loginInput, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginInput, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      const message = json?.error || json?.errors?.[0]?.message || 'Login failed';
      throw new Error(message);
    }
    localStorage.setItem('tl_token', json.token);
    localStorage.setItem('tl_user', JSON.stringify(json.user));
    setToken(json.token);
    setUser(json.user);
    return json.user;
  }, []);

  // ── Signup (trader-only) ───────────────────────────────────────────────────
  const signup = useCallback(async ({ username, email, password }) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      const message = json?.error || json?.errors?.[0]?.message || 'Signup failed';
      const err = new Error(message);
      err.status = res.status;
      err.errors = json?.errors;
      throw err;
    }

    // Register now returns an authenticated session for immediate sign-in.
    if (json?.token && json?.user) {
      localStorage.setItem('tl_token', json.token);
      localStorage.setItem('tl_user', JSON.stringify(json.user));
      setToken(json.token);
      setUser(json.user);
      return json.user;
    }

    // Fallback for older API responses.
    return login(username, password);
  }, [login]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('tl_token');
    localStorage.removeItem('tl_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  // ── Auth fetch helper (automatically adds Bearer token) ──────────────────
  const authFetch = useCallback(
    async (path, options = {}) => {
      const url = `${API_URL}${path}`;
      const config = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      };
      if (config.body && typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body);
      }
      const res = await fetch(url, config);
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please log in again.');
      }
      const json = await res.json();
      if (!res.ok) {
        const message = json?.error || json?.errors?.[0]?.message || 'Request failed';
        const err = new Error(message);
        err.status = res.status;
        err.errors = json?.errors;
        throw err;
      }
      return json;
    },
    [token, logout]
  );

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, authFetch, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
