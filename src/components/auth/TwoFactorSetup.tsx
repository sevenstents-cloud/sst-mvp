'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { Shield, ShieldAlert, CheckCircle } from 'lucide-react';

export function TwoFactorSetup() {
    const { profile } = useAuth();
    const [secret, setSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'INITIAL' | 'SETUP' | 'VERIFIED'>(profile?.two_factor_enabled ? 'VERIFIED' : 'INITIAL');

    useEffect(() => {
        if (profile?.two_factor_enabled) {
            setStatus('VERIFIED');
        }
    }, [profile]);

    async function startSetup() {
        // Generate a new secret
        const newSecret = new OTPAuth.Secret({ size: 20 });
        const secretBase32 = newSecret.base32;
        setSecret(secretBase32);

        // Create URI
        const totp = new OTPAuth.TOTP({
            issuer: 'SST Platform',
            label: profile?.email || 'User',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: newSecret
        });

        const uri = totp.toString();

        // Generate QR Code
        try {
            const url = await QRCode.toDataURL(uri);
            setQrCodeUrl(url);
            setStatus('SETUP');
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar QR Code');
        }
    }

    async function confirmSetup() {
        setLoading(true);

        const totp = new OTPAuth.TOTP({
            secret: OTPAuth.Secret.fromBase32(secret),
            algorithm: 'SHA1',
            digits: 6,
            period: 30
        });

        const delta = totp.validate({ token: verifyCode, window: 1 });

        if (delta === null) {
            alert('Código incorreto. Tente novamente.');
            setLoading(false);
            return;
        }

        // Save to DB
        const { error } = await supabase
            .from('usuarios')
            .update({
                two_factor_enabled: true,
                two_factor_secret: secret
            })
            .eq('id', profile?.id);

        if (error) {
            alert('Erro ao salvar configuração: ' + error.message);
        } else {
            setStatus('VERIFIED');
            alert('Autenticação de dois fatores ativada com sucesso!');
        }
        setLoading(false);
    }

    async function disable2FA() {
        if (!confirm('Tem certeza que deseja desativar a e autenticação de dois fatores? Sua conta ficará menos segura.')) return;

        setLoading(true);
        const { error } = await supabase
            .from('usuarios')
            .update({
                two_factor_enabled: false,
                two_factor_secret: null
            })
            .eq('id', profile?.id);

        if (error) {
            alert('Erro ao desativar: ' + error.message);
        } else {
            setStatus('INITIAL');
            setSecret('');
            setVerifyCode('');
        }
        setLoading(false);
    }

    if (status === 'VERIFIED') {
        return (
            <div className="border p-6 rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-700">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-green-900">2FA Ativado</h3>
                        <p className="text-sm text-green-700">Sua conta está protegida com autenticação de dois fatores.</p>
                    </div>
                </div>
                <Button variant="destructive" onClick={disable2FA} isLoading={loading}>
                    Desativar 2FA
                </Button>
            </div>
        );
    }

    if (status === 'SETUP') {
        return (
            <div className="border p-6 rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-4">Configurar 2FA</h3>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-4">
                            1. Escaneie o QR Code abaixo com seu aplicativo autenticador (Google Authenticator, Authy, etc).
                        </p>
                        {qrCodeUrl && (
                            <div className="border p-2 inline-block rounded bg-white">
                                <img src={qrCodeUrl} alt="QR Code 2FA" width={200} height={200} />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            Se não conseguir escanear, digite o código: <code className="bg-gray-100 p-1">{secret}</code>
                        </p>
                    </div>

                    <div className="flex-1 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            2. Digite o código de 6 dígitos gerado pelo aplicativo.
                        </p>
                        <Input
                            label="Código de Verificação"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                            className="text-center text-xl tracking-widest"
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStatus('INITIAL')}>Cancelar</Button>
                            <Button onClick={confirmSetup} isLoading={loading}>Confirmar e Ativar</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border p-6 rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-700">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-yellow-900">2FA Não Ativado</h3>
                    <p className="text-sm text-yellow-700">Para sua segurança, configure a autenticação de doisatores agora.</p>
                </div>
            </div>
            <Button onClick={startSetup} className="w-full sm:w-auto">
                Configurar 2FA Agora
            </Button>
        </div>
    );
}
