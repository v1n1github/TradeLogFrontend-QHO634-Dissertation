// All calls go through useAuth().authFetch() which attaches the Bearer token.

export const getTrades = (authFetch, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return authFetch(`/api/trades${qs ? `?${qs}` : ''}`);
};
export const getTrade = (authFetch, id) => authFetch(`/api/trades/${id}`);
export const createTrade = (authFetch, data) => authFetch('/api/trades', { method: 'POST', body: data });
export const updateTrade = (authFetch, id, data) => authFetch(`/api/trades/${id}`, { method: 'PUT', body: data });
export const deleteTrade = (authFetch, id) => authFetch(`/api/trades/${id}`, { method: 'DELETE' });

export const getReflections = (authFetch, tradeId) => authFetch(`/api/trades/${tradeId}/reflections`);
export const createReflection = (authFetch, tradeId, data) => authFetch(`/api/trades/${tradeId}/reflections`, { method: 'POST', body: data });

export const getDashboard = (authFetch, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return authFetch(`/api/dashboard${qs ? `?${qs}` : ''}`);
};

export const submitEvaluation = (authFetch, data) => authFetch('/api/evaluation', { method: 'POST', body: data });

export const adminGetUsers    = (authFetch)        => authFetch('/api/admin/users');
export const adminGetUser     = (authFetch, id)    => authFetch(`/api/admin/users/${id}`);
export const adminCreateUser  = (authFetch, data)  => authFetch('/api/admin/users', { method: 'POST', body: data });
export const adminUpdateUser  = (authFetch, id, d) => authFetch(`/api/admin/users/${id}`, { method: 'PUT', body: d });
export const adminDeleteUser  = (authFetch, id)    => authFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
export const adminGetDashboard= (authFetch)        => authFetch('/api/admin/dashboard');
export const adminGetTrades   = (authFetch, p={})  => { const qs = new URLSearchParams(p).toString(); return authFetch(`/api/admin/trades${qs ? `?${qs}` : ''}`); };
export const adminGetEvaluations=(authFetch)       => authFetch('/api/admin/evaluations');
