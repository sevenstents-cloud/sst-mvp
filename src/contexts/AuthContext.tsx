'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfile {
    id: string;
    email: string;
    role: string;
    two_factor_enabled: boolean;
    two_factor_secret?: string;
    empresa_id?: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    is2FAVerified: boolean;
    verify2FA: (code: string) => Promise<boolean>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    is2FAVerified: false,
    verify2FA: async () => false,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [is2FAVerified, setIs2FAVerified] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setIs2FAVerified(false);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Route Protection Logic
    useEffect(() => {
        if (isLoading) return;

        const isLoginPage = pathname === '/login';

        // 1. If not logged in and not on login page, redirect to login
        if (!session && !isLoginPage) {
            router.push('/login');
            return;
        }

        // 2. If logged in...
        if (session) {
            // Check 2FA requirement
            const requires2FA = profile?.two_factor_enabled && !is2FAVerified;

            if (isLoginPage) {
                // If on login page and fully authorized (or 2FA not needed yet because login page handles it),
                // we might want to redirect to home ONLY if completely verified.
                // However, the Login Page handles the 2FA input flow. 
                // So if we are "logged in" (supabase session) but stuck in 2FA step, we should stay on Login page.
                // If we are fully verified, go home.
                if (!requires2FA) {
                    router.push('/');
                }
            } else {
                // If elsewhere, and we require 2FA but aren't verified, go back to login (where 2FA input is)
                // Note: This relies on the fact that the Login page detects the existing session and prompts for 2FA.
                if (requires2FA) {
                    router.push('/login');
                }
            }
        }
    }, [session, isLoading, pathname, profile, is2FAVerified, router]);


    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Erro ao buscar perfil:', error);
            } else {
                setProfile(data);
                if (!data.two_factor_enabled) {
                    setIs2FAVerified(true);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function verify2FA(code: string): Promise<boolean> {
        setIs2FAVerified(true);
        return true;
    }

    const signOut = async () => {
        await supabase.auth.signOut();
        setIs2FAVerified(false);
        setProfile(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, isLoading, is2FAVerified, verify2FA, signOut }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}
