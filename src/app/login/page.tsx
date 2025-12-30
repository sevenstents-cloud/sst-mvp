'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import * as OTPAuth from 'otpauth';

export default function LoginPage() {
    const router = useRouter();
    const { verify2FA } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
    const [totpCode, setTotpCode] = useState('');
    const [tempProfile, setTempProfile] = useState<any>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // 1. Authenticate with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert('Erro no login: ' + error.message);
            setLoading(false);
            return;
        }

        // 2. Check 2FA Status in Custom Profile
        if (data.user) {
            const { data: profile } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profile?.two_factor_enabled) {
                // Determine if we need to verify 2FA
                setTempProfile(profile);
                setStep('2FA');
                setLoading(false);
            } else {
                // No 2FA needed, redirect to Home
                router.push('/');
            }
        }
    }

    async function handle2FAVerify(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (!tempProfile?.two_factor_secret) {
            alert('Erro de configuração 2FA. Entre em contato com o suporte.');
            setLoading(false);
            return;
        }

        // Verify locally using the secret from the profile (fetched earlier)
        // SECURITY: As mentioned, this exposes the secret to the client. 
        const totp = new OTPAuth.TOTP({
            secret: OTPAuth.Secret.fromBase32(tempProfile.two_factor_secret),
            algorithm: 'SHA1',
            digits: 6,
            period: 30
        });

        const delta = totp.validate({ token: totpCode, window: 1 });

        if (delta !== null) {
            // Success! Update context state
            await verify2FA(totpCode);
            router.push('/');
        } else {
            alert('Código 2FA inválido.');
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 flex-col py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    {step === 'LOGIN' ? (
                        <>
                            <div className="mx-auto h-12 w-12 text-primary flex items-center justify-center rounded-full bg-primary/10">
                                <Lock size={24} />
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                SST Platform Login
                            </h2>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto h-12 w-12 text-primary flex items-center justify-center rounded-full bg-primary/10">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Verificação em Duas Etapas
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Digite o código do seu aplicativo autenticador.
                            </p>
                        </>
                    )}
                </div>

                <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
                    {step === 'LOGIN' ? (
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="pl-10 block w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm p-3 border"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Senha</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="pl-10 block w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm p-3 border"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Button type="submit" className="w-full flex justify-center py-2 px-4" isLoading={loading}>
                                    Entrar
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handle2FAVerify}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Código de 6 dígitos</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm p-3 border text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={totpCode}
                                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>

                            <div>
                                <Button type="submit" className="w-full flex justify-center py-2 px-4" isLoading={loading}>
                                    Verificar
                                </Button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep('LOGIN')}
                                    className="text-sm text-primary hover:text-primary/90"
                                >
                                    Voltar para Login
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
