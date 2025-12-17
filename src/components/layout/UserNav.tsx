'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, UserCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function UserNav() {
    const { user, profile, signOut, isLoading } = useAuth();

    if (isLoading) return null;

    if (!user) {
        return (
            <Link href="/login">
                <Button variant="outline" className="gap-2">
                    <LogIn size={16} />
                    Entrar
                </Button>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.email}
            </span>

            {profile?.role === 'admin' && (
                <Link href="/admin/users" title="Administração de Usuários">
                    <Button variant="outline" className="p-2 h-auto rounded-full text-blue-600 border-blue-200 hover:bg-blue-50">
                        <ShieldCheck size={24} />
                    </Button>
                </Link>
            )}

            <Link href="/perfil" title="Meu Perfil">
                <Button variant="outline" className="p-2 h-auto rounded-full">
                    <UserCircle size={24} />
                </Button>
            </Link>
            <Button
                variant="outline"
                onClick={signOut}
                className="text-destructive hover:bg-destructive/10 p-2 h-auto"
                title="Sair"
            >
                <LogOut size={20} />
            </Button>
        </div>
    );
}
