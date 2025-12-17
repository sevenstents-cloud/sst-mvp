'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { UserPlus, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
    const { profile, isLoading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;

    if (profile?.role !== 'admin') {
        return (
            <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <ShieldAlert size={48} style={{ color: 'var(--destructive)', marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Acesso Negado</h1>
                <p style={{ color: 'gray' }}>Você não tem permissão para acessar esta página.</p>
                <div style={{ marginTop: '1.5rem' }}>
                    <Button onClick={() => router.push('/')}>Voltar ao Início</Button>
                </div>
            </div>
        );
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Get session manually since we need the token and it might be refreshed
        // Actually AuthContext session is fine.
        // We know session exists if profile exists.

        try {
            // Need to get access token. AuthContext provides session.
            // Check if we need to refresh? AuthContext handles it.
            // We can just access it via supbase.auth.getSession() to be safe or use context.
            // Using context session from closure.
        } catch (e) { }

        // Re-get session from supabase to ensure we have token
        const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ email, password, role })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao criar usuário');
            }

            setMessage(`Usuário ${data.user.email} criado com sucesso!`);
            setEmail('');
            setPassword('');
            setRole('user');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary)', marginBottom: '1rem', textDecoration: 'none', fontWeight: 500 }}>
                        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Voltar ao Menu
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <UserPlus size={32} style={{ color: 'var(--primary)' }} />
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Administração de Usuários</h1>
                    </div>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                        Cadastrar Novo Usuário
                    </h2>

                    <form onSubmit={handleCreateUser}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="email@exemplo.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Senha Provisória</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Função (Role)</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="form-select"
                            >
                                <option value="user">Usuário Padrão</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <Button type="submit" isLoading={loading} style={{ width: '100%' }}>
                                <UserPlus size={18} style={{ marginRight: '0.5rem' }} />
                                Cadastrar Usuário
                            </Button>
                        </div>
                    </form>

                    {message && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            borderRadius: 'var(--radius)'
                        }}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius)'
                        }}>
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
