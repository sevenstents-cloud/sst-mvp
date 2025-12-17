'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Empresa {
    id: string;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
}

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmpresas();
    }, []);

    async function fetchEmpresas() {
        setLoading(true);
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('razao_social');

        if (error) {
            console.error('Erro ao buscar empresas:', error);
        } else {
            setEmpresas(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

        const { error } = await supabase
            .from('empresas')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir empresa');
        } else {
            fetchEmpresas();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Empresas"
                subtitle="Gerenciamento de clientes e contratantes"
                icon={Building2}
                backLink="/"
                actionLabel="Nova Empresa"
                actionLink="/empresas/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={empresas}
                        columns={[
                            { header: 'Razão Social', accessorKey: 'razao_social' },
                            { header: 'Nome Fantasia', accessorKey: 'nome_fantasia' },
                            { header: 'CNPJ', accessorKey: 'cnpj' },
                        ]}
                        actions={(empresa) => (
                            <>
                                <Link href={`/empresas/${empresa.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
                                    <Pencil size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(empresa.id)}
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
