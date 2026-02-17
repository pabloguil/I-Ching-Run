import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  isSupabaseConfigured,
  getSession,
  getUser,
  signIn as sbSignIn,
  signUp as sbSignUp,
  signOut as sbSignOut,
  refreshSession,
} from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  // Restore session on mount
  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const stored = getSession();
    if (stored) {
      setSession(stored);
      setUser(stored.user);
      // Try to refresh token silently
      refreshSession().then((fresh) => {
        if (fresh) {
          setSession(fresh);
          setUser(fresh.user);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [configured]);

  const login = useCallback(async (email, password) => {
    const { session: s, user: u } = await sbSignIn(email, password);
    setSession(s);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (email, password) => {
    const { session: s, user: u } = await sbSignUp(email, password);
    if (s) {
      setSession(s);
      setUser(u);
    }
    return u;
  }, []);

  const logout = useCallback(async () => {
    await sbSignOut();
    setSession(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, configured, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
