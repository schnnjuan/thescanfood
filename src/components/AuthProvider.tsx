"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseReady } from "@/lib/supabase";

type AuthState = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthState>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseReady()) { setLoading(false); return; }

    supabase!.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setLoading(false);
    });

    const { data: sub } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => sub?.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseReady()) return;
    await supabase!.auth.signInWithOAuth({ provider: "google" });
  }, []);

  const signInWithEmail = useCallback(async (email: string): Promise<string | null> => {
    if (!isSupabaseReady()) return "Supabase nao configurado.";
    const { error } = await supabase!.auth.signInWithOtp({ email });
    return error?.message || null;
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseReady()) return;
    await supabase!.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthCtx value={{ user, loading, signInWithGoogle, signInWithEmail, signOut }}>
      {children}
    </AuthCtx>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
