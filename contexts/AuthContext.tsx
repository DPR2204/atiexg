import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Agent } from '../types/backoffice';

const isDev = import.meta.env.DEV;

interface AuthContextType {
    user: User | null;
    agent: Agent | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAgentProfile = useCallback(async (userId: string) => {
        if (isDev) console.log('[Auth] Fetching agent profile for:', userId);
        try {
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (isDev) console.warn('[Auth] Agent profile error:', error.message);
            } else if (data) {
                if (isDev) console.log('[Auth] Agent profile loaded:', data.role);
                setAgent(data as Agent);
            }
        } catch (err) {
            console.error('[Auth] Fetch agent profile failed:', err);
        }
    }, []);

    useEffect(() => {
        if (isDev) console.log('[Auth] Initializing authentication...');

        let mounted = true;
        let hasResolved = false;

        // Fallback: Ensure loading state clears eventually
        const timeout = setTimeout(() => {
            if (mounted && !hasResolved) {
                if (isDev) console.warn('[Auth] Loading timed out, forcing clear');
                setLoading(false);
                hasResolved = true;
            }
        }, 5000);

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            if (isDev) console.log('[Auth] Session loaded:', session ? 'Yes' : 'No');
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchAgentProfile(session.user.id).finally(() => {
                    if (mounted && !hasResolved) {
                        hasResolved = true;
                        setLoading(false);
                    }
                });
            } else {
                hasResolved = true;
                setLoading(false);
            }
        }).catch(err => {
            console.error('[Auth] getSession failed:', err);
            if (mounted && !hasResolved) {
                hasResolved = true;
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!mounted) return;
                if (isDev) console.log('[Auth] State changed:', _event, session?.user?.email);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchAgentProfile(session.user.id);
                } else {
                    setAgent(null);
                }
                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, [fetchAgentProfile]);

    // Refresh session when tab regains visibility (stale-tab fix)
    useEffect(() => {
        const handleVisibility = async () => {
            if (document.visibilityState === 'visible' && session) {
                const { error } = await supabase.auth.refreshSession();
                if (error) {
                    setSession(null);
                    setUser(null);
                    setAgent(null);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [session]);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } },
            });

            if (error) return { error: error.message || JSON.stringify(error) };

            // Supabase returns a user with fake id and no session when email already exists
            // (to prevent user enumeration). Detect this case.
            if (data?.user && !data.session && data.user.identities?.length === 0) {
                return { error: 'Ya existe una cuenta con este correo.' };
            }

            return { error: null };
        } catch (err: any) {
            return { error: err?.message || 'Error inesperado al crear cuenta' };
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('[Auth] Sign out error:', err);
        } finally {
            setUser(null);
            setAgent(null);
            setSession(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                agent,
                session,
                loading,
                signIn,
                signUp,
                signOut,
                isAdmin: agent?.role === 'admin',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
