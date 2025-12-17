'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { Users, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Funcionario {
    id: string;
    nome_completo: string;
    cpf: string;
    empresa: { razao_social: string };
    cargo: { nome_cargo: string };
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
        id, 
        nome_completo, 
        cpf,
        empresa:empresas(razao_social),
        cargo:cargos(nome_cargo)
      `)
            .order('nome_completo');

        if (error) {
            console.error('Erro ao buscar funcionários:', error);
        } else {
            // @ts-ignore
            setFuncionarios(data || []);
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
            alert('Erro ao excluir funcionário');
        } else {
            fetchFuncionarios();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Funcionários"
                subtitle="Gestão de colaboradores"
                icon={Users}
                backLink="/"
                actionLabel="Novo Funcionário"
                actionLink="/funcionarios/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={funcionarios}
                        columns={[
                            { header: 'Nome', accessorKey: 'nome_completo' },
                            { header: 'CPF', accessorKey: 'cpf' },
                            { header: 'Empresa', cell: (item) => item.empresa?.razao_social || '-' },
                            { header: 'Cargo', cell: (item) => item.cargo?.nome_cargo || '-' },
                        ]}
                        actions={(func) => (
                            <>
                                <Link href={`/funcionarios/${func.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
                                    <Pencil size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(func.id)}
                                    className="btn btn-destructive p-2 h-auto"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    />
                )}
            </div>
        </main>
    );
}
