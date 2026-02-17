/**
 * Cliente Supabase ligero usando fetch nativo.
 * Cubre auth (email/password) y operaciones CRUD via PostgREST.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const STORAGE_KEY = 'iching-supabase-session';

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http'));
}

// --- Session persistence ---

function saveSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- Server session cookie helpers ---
// Tras el login, notifica al servidor para que emita una cookie httpOnly.
// Esto protege los endpoints de Express de robos de token via XSS.
async function syncServerSession(token) {
  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch { /* no-op: la cookie es una mejora de seguridad opcional */ }
}

async function clearServerSession() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch { /* no-op */ }
}

// --- Auth helpers ---

async function authFetch(endpoint, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || data.message || 'Auth error');
  return data;
}

export async function signUp(email, password) {
  const data = await authFetch('/signup', { email, password });
  const session = data.access_token
    ? { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user }
    : null;
  if (session) {
    saveSession(session);
    await syncServerSession(data.access_token);
  }
  return { session, user: data.user };
}

export async function signIn(email, password) {
  const data = await authFetch('/token?grant_type=password', { email, password });
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user,
  };
  saveSession(session);
  await syncServerSession(data.access_token);
  return { session, user: data.user };
}

export async function signOut() {
  const session = loadSession();
  // Limpiar cookie httpOnly del servidor
  await clearServerSession();
  if (session?.access_token) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: SUPABASE_KEY,
        },
      });
    } catch { /* ignore */ }
  }
  saveSession(null);
}

export async function refreshSession() {
  const session = loadSession();
  if (!session?.refresh_token) return null;
  try {
    const data = await authFetch('/token?grant_type=refresh_token', {
      refresh_token: session.refresh_token,
    });
    const newSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    };
    saveSession(newSession);
    await syncServerSession(data.access_token);
    return newSession;
  } catch {
    saveSession(null);
    return null;
  }
}

export function getSession() {
  return loadSession();
}

export function getUser() {
  return loadSession()?.user || null;
}

// --- PostgREST (database) helpers ---

function authHeaders(session) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

export async function dbSelect(table, { session, filters = '', order = '', limit = 50 } = {}) {
  if (!session) return [];
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  if (filters) url += `&${filters}`;
  if (order) url += `&order=${order}`;
  url += `&limit=${limit}`;

  const res = await fetch(url, { headers: authHeaders(session) });
  if (!res.ok) throw new Error('DB select error');
  return res.json();
}

export async function dbInsert(table, row, session) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: authHeaders(session),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error('DB insert error');
  return res.json();
}

export async function dbUpdate(table, id, updates, session) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: authHeaders(session),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('DB update error');
  return res.json();
}

export async function dbDelete(table, id, session) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(session), Prefer: '' },
  });
  if (!res.ok) throw new Error('DB delete error');
}
