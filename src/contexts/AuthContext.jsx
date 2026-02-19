import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  isSupabaseConfigured,
  getSession,
  getUser,
  signIn as sbSignIn,
  signUp as sbSignUp,
  signOut as sbSignOut,
  refreshSession,
  updateUserProfile as sbUpdateProfile,
  updatePassword as sbUpdatePassword,
  sendPasswordReset as sbSendPasswordReset,
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

  const updateProfile = useCallback(async (updates) => {
    const updatedUser = await sbUpdateProfile(updates);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    return sbUpdatePassword(newPassword);
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    return sbSendPasswordReset(email);
  }, []);

  const deleteAccount = useCallback(async () => {
    const stored = getSession();
    if (!stored?.access_token) throw new Error('Not authenticated');
    const res = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${stored.access_token}`,
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Could not delete account');
    }
    await sbSignOut();
    setSession(null);
    setUser(null);
  }, []);

  // Helper: display_name from user metadata, fallback to email prefix
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || null;

  return (
    <AuthContext.Provider value={{
      user, session, loading, configured,
      displayName,
      login, signup, logout,
      updateProfile, updatePassword, sendPasswordReset, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
