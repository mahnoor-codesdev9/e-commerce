import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '@/lib/types';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: import('@supabase/supabase-js').Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthContextType['session']>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) {
      console.error('Failed to load profile:', error.message);
      return null;
    }
    setProfile(data as Profile | null);
    return data as Profile | null;
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
        return;
      }
      if (session?.user) {
        (async () => {
          // Retry profile load — the handle_new_user trigger may still be running
          let retries = 0;
          let p: Profile | null = null;
          while (retries < 3 && !p) {
            p = await loadProfile(session.user.id);
            if (!p) await new Promise((r) => setTimeout(r, 500));
            retries++;
          }
          if (mounted) setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    // If signup returned a session (email confirmation off), load the profile
    if (data.session?.user) {
      // Give the trigger time to create the profile row
      await new Promise((r) => setTimeout(r, 800));
      await loadProfile(data.session.user.id);
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }

  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
