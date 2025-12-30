'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface Funcionario {
    id: string;
    nome: string;
    cpf: string;
    cargo_id: string;
    empresas?: { nome_fantasia: string };
    cargos?: { nome: string };
    ghe?: { nome: string };
}

export default function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFuncionarios();
    }, []);

    async function fetchFuncionarios() {
        setLoading(true);
        const { data, error } = await supabase
            .from('funcionarios')
            .select(`
                *,
                empresas (nome_fantasia),
                cargos (nome),
                ghe (nome)
            `)
            .order('nome');

        if (error) {
            console.error(error);
            alert('Erro ao carregar funcionários');
        } else {
            setFuncionarios(data as any || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

        const { error } = await supabase
            .from('funcionarios')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchFuncionarios();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Funcionários</h1>
                <Link href="/funcionarios/novo">
                    <Button className="gap-2">
                        <Plus size={18} /> Novo Funcionário
                    </Button>
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Carregando...</p>
                ) : (
                    <Table
                        data={funcionarios}
                        columns={[
                            { header: 'Nome', accessorKey: 'nome' },
                            { header: 'CPF', accessorKey: 'cpf' },
                            { header: 'Empresa', cell: (item) => item.empresas?.nome_fantasia || '-' },
                            { header: 'Cargo', cell: (item) => item.cargos?.nome || '-' },
                            { header: 'GHE', cell: (item) => item.ghe?.nome || '-' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/funcionarios/${item.id}`}>
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                                        <Eye size={18} />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                >
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
