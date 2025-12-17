'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { User, Building2, UserCircle } from 'lucide-react';

export default function PerfilPage() {
    const { profile, user } = useAuth();

    if (!user) {
        return <div className="p-8">Carregando perfil...</div>;
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Meu Perfil"
                subtitle="Gerencie suas informações e segurança"
                icon={UserCircle}
                backLink="/"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informações Básicas */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User size={20} />
                            Dados Pessoais
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground">Email</label>
                                <div className="font-medium">{user.email}</div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">ID do Usuário</label>
                                <div className="font-mono text-xs bg-muted p-1 rounded">{user.id}</div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Função (Role)</label>
                                <div className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium uppercase">
                                    {profile?.role || 'User'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building2 size={20} />
                            Empresa Vinculada
                        </h3>
                        <div>
                            {profile?.empresa_id ? (
                                <div className="font-medium text-lg">{profile.empresa_id}</div>
                            ) : (
                                <div className="text-muted-foreground italic">Nenhuma empresa vinculada.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Segurança e 2FA */}
                <div className="space-y-6">
                    <div className="card">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ShieldCheckIcon />
                                Segurança da Conta
                            </h3>
                        </div>
                        <div className="p-6">
                            <TwoFactorSetup />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function ShieldCheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
