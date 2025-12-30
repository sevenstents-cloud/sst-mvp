'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface User {
    id: string;
    email: string;
    role: string;
    empresa_id?: string;
    empresas?: { nome_fantasia: string };
    two_factor_enabled: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        // Supabase Auth users aren't directly queryable via Client SDK efficiently without Admin API
        // But we have public.usuarios table as requested in prompt "User Management (for Administrators): Paginated list of all users (public.usuarios)".
        const { data, error } = await supabase
            .from('usuarios')
            .select('*, empresas(nome_fantasia)')
            .order('email');

        if (error) {
            console.error(error);
            alert('Erro ao carregar usuários');
        } else {
            setUsers(data as any || []);
        }
        setLoading(false);
    }

    async function toggle2FA(user: User) {
        if (!confirm(`Deseja ${user.two_factor_enabled ? 'desativar' : 'ativar'} o 2FA para este usuário?`)) return;

        const { error } = await supabase
            .from('usuarios')
            .update({ two_factor_enabled: !user.two_factor_enabled })
            .eq('id', user.id);

        if (error) {
            alert('Erro: ' + error.message);
        } else {
            fetchUsers();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
                <Button className="gap-2" onClick={() => alert('Para criar usuário, utilize o painel do Supabase Auth ou convite system (não implementado no Front-End only MVP).')}>
                    <Plus size={18} /> Novo Usuário
                </Button>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Carregando...</p>
                ) : (
                    <Table
                        data={users}
                        columns={[
                            { header: 'Email', accessorKey: 'email' },
                            { header: 'Função', cell: (u) => <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs font-medium">{u.role}</span> },
                            { header: 'Empresa', cell: (u) => u.empresas?.nome_fantasia || 'Admin / Todas' },
                            {
                                header: '2FA', cell: (u) => (
                                    <span className={`px-2 py-1 rounded text-xs ${u.two_factor_enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {u.two_factor_enabled ? 'Ativo' : 'Inativo'}
                                    </span>
                                )
                            },
                        ]}
                        actions={(item) => (
                            <>
                                <button title="Toggle 2FA" onClick={() => toggle2FA(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                                    <Edit size={18} />
                                </button>
                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
                    />
                )}
            </div>
        </div>
    );
}
