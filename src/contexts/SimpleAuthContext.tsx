"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// =========================================================
// TYPES
// =========================================================

interface User {
  id: number;
  email: string;
  role_code: string;
  role_name: string;
  role_id: number; // 1 = admin, 2 = client, 3 = staff
  client_id?: number;
  client_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

// =========================================================
// CONTEXT
// =========================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =========================================================
// PROVIDER
// =========================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Vérifier la session au chargement
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Vérifier si une session Supabase Auth existe
   */
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login utilisateur via Supabase Auth
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Utiliser le nouvel endpoint Supabase Auth
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        
        // Rediriger selon le rôle avec rechargement complet
        // pour éviter race condition entre state React et navigation
        const redirectPath = data.redirect_path || '/dashboard';
        window.location.href = redirectPath;
        
        return { success: true };
      }

      return { 
        success: false, 
        error: data.error || 'Erreur de connexion' 
      };
    } catch {
      return {
        success: false,
        error: 'Erreur lors de la connexion'
      };
    }
  };

  /**
   * Logout utilisateur via Supabase Auth
   */
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        // Rediriger avec window.location pour forcer un refresh complet
        window.location.href = '/login';
      }
    } catch {
      // Même en cas d'erreur, on redirige vers login
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =========================================================
// HOOK
// =========================================================

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// =========================================================
// HOOKS UTILITAIRES
// =========================================================

/**
 * Protège une page - redirige si non authentifié
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isLoading, isAuthenticated };
}

/**
 * Protège une page admin - redirige si non admin (role_id !== 1)
 */
export function useRequireAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role_id !== 1) {
        // Vérifier role_id === 1 pour admin
        router.push('/client-portal');
      }
    }
  }, [user, isLoading, router]);

  return { isLoading, user };
}

/**
 * Protège une page client - redirige si non client (role_id !== 2)
 */
export function useRequireClient() {
  const { user, isLoading, checkSession } = useAuth();
  const router = useRouter();

  // Forcer la vérification de session au montage
  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/client-login');
      } else if (user.role_id !== 2) {
        // Vérifier role_id === 2 pour client
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  return { isLoading, user };
}
