'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';

export default function PerfilPage() {
    const { user, profile, isLoading } = useAuth();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [setupStep, setSetupStep] = useState(0); // 0: Idle, 1: QR Shown, 2: Verified?
    const [saving, setSaving] = useState(false);

    // Initial setup if valid user but no 2FA
    function start2FASetup() {
        // Generate Secret
        // In a real app, this should ideally be done server-side, but client-side is acceptable for MVP if sent via HTTPS.
        const newSecret = new OTPAuth.Secret({ size: 20 });
        const secretStr = newSecret.base32;
        setSecret(secretStr);

        const totp = new OTPAuth.TOTP({
            issuer: 'SST Platform',
            label: user?.email || 'User',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: newSecret
        });

        const uri = totp.toString();

        QRCode.toDataURL(uri, (err, url) => {
            if (err) {
                console.error(err);
                return;
            }
            setQrCodeUrl(url);
            setSetupStep(1);
        });
    }

    async function confirm2FA() {
        setSaving(true);
        // Validate Code first
        const totp = new OTPAuth.TOTP({
            secret: OTPAuth.Secret.fromBase32(secret),
            algorithm: 'SHA1',
            digits: 6,
            period: 30
        });

        const delta = totp.validate({ token: verifyCode, window: 1 });

        if (delta === null) {
            alert('Código incorreto. Tente novamente.');
            setSaving(false);
            return;
        }

        // Save to DB
        const { error } = await supabase
            .from('usuarios')
            .update({
                two_factor_enabled: true,
                two_factor_secret: secret
            })
            .eq('id', user?.id);

        if (error) {
            alert('Erro ao salvar configuração: ' + error.message);
        } else {
            alert('2FA Ativado com sucesso!');
            setSetupStep(0);
            window.location.reload(); // Reload to refresh context
        }
        setSaving(false);
    }

    async function disable2FA() {
        if (!confirm('Tem certeza que deseja desativar a autenticação em duas etapas? Sua conta ficará menos segura.')) return;

        setSaving(true);
        const { error } = await supabase
            .from('usuarios')
            .update({
                two_factor_enabled: false,
                two_factor_secret: null
            })
            .eq('id', user?.id);

        if (error) {
            alert('Erro ao desativar: ' + error.message);
        } else {
            alert('2FA Desativado.');
            window.location.reload();
        }
        setSaving(false);
    }

    if (isLoading) return <div>Carregando...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Meu Perfil</h1>

            {/* Basic Info */}
            <div className="card space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Informações Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Cargo / Função</label>
                        <p className="font-medium">{profile?.role || 'Usuário'}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">ID do Usuário</label>
                        <p className="font-mono text-xs text-gray-400 mt-1">{user?.id}</p>
                    </div>
                </div>
            </div>

            {/* Security / 2FA */}
            <div className="card space-y-6">
                <h2 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                    <Shield size={20} /> Segurança e Login
                </h2>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        {profile?.two_factor_enabled ? (
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <ShieldCheck size={24} />
                            </div>
                        ) : (
                            <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                                <ShieldAlert size={24} />
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-gray-900">Autenticação em Duas Etapas</p>
                            <p className="text-sm text-gray-500">
                                {profile?.two_factor_enabled
                                    ? 'Sua conta está protegida com 2FA.'
                                    : 'Adicione uma camada extra de segurança.'}
                            </p>
                        </div>
                    </div>

                    <div>
                        {profile?.two_factor_enabled ? (
                            <Button variant="destructive" size="sm" onClick={disable2FA} isLoading={saving}>
                                Desativar
                            </Button>
                        ) : (
                            setupStep === 0 && (
                                <Button onClick={start2FASetup}>
                                    Ativar Agora
                                </Button>
                            )
                        )}
                    </div>
                </div>

                {/* 2FA Setup Flow */}
                {setupStep === 1 && !profile?.two_factor_enabled && (
                    <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 animate-fade-in">
                        <h3 className="font-bold text-lg mb-4">Configurar Autenticador</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col items-center justify-center space-y-2">
                                {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 border bg-white p-2 rounded" />}
                                <p className="text-xs text-gray-500 text-center max-w-[200px]">
                                    Escaneie este código com o Google Authenticator ou Authy.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Digite o código gerado no app</label>
                                    <input
                                        type="text"
                                        className="form-input text-center text-xl tracking-widest"
                                        placeholder="000 000"
                                        maxLength={6}
                                        value={verifyCode}
                                        onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                <Button className="w-full" onClick={confirm2FA} isLoading={saving} disabled={verifyCode.length !== 6}>
                                    Verificar e Ativar
                                </Button>
                                <button
                                    onClick={() => setSetupStep(0)}
                                    className="text-sm text-gray-500 hover:text-gray-700 w-full text-center mt-2"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
