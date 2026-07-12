'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { UserProfile } from '@/types';
import {
  onAuthStateChange,
  getCurrentUser,
  signIn as signInService,
  signUp as signUpService,
  signOut as signOutService,
  signInWithGoogle as signInWithGoogleService,
  updateUserProfile as updateUserProfileService,
} from '@/lib/services';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, displayName: string, phone: string, userType: 'buyer' | 'seller') => Promise<UserProfile>;
  signInWithGoogle: (userType?: 'buyer' | 'seller', phone?: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChange((next) => {
      if (mounted) {
        setUser(next);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const profile = await signInService(email, password);
    setUser(profile);
    return profile;
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string, phone: string, userType: 'buyer' | 'seller') => {
    const profile = await signUpService(email, password, displayName, phone, userType);
    setUser(profile);
    return profile;
  }, []);

  const signInWithGoogle = useCallback(async (userType?: 'buyer' | 'seller', phone?: string) => {
    const profile = await signInWithGoogleService(userType, phone);
    setUser(profile);
    return profile;
  }, []);

  const signOut = useCallback(async () => {
    await signOutService();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    const updated = await updateUserProfileService(data);
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
