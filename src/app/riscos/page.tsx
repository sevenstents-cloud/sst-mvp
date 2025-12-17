'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Risco {
    id: string;
    nome_agente: string;
    categoria: string;
    cod_esocial: string;
}

export default function RiscosPage() {
    const [riscos, setRiscos] = useState<Risco[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRiscos();
    }, []);

    async function fetchRiscos() {
        setLoading(true);
        const { data, error } = await supabase
            .from('catalogo_riscos')
            .select('*')
            .order('nome_agente');

        if (error) {
            console.error('Erro ao buscar riscos:', error);
        } else {
            setRiscos(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este risco?')) return;

        const { error } = await supabase
            .from('catalogo_riscos')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir risco');
        } else {
            fetchRiscos();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Catálogo de Riscos"
                subtitle="Gerenciamento de agentes de risco"
                icon={AlertTriangle}
                backLink="/"
                actionLabel="Novo Risco"
                actionLink="/riscos/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={riscos}
                        columns={[
                            { header: 'Agente de Risco', accessorKey: 'nome_agente' },
                            { header: 'Categoria', accessorKey: 'categoria' },
                            { header: 'Cód. eSocial', accessorKey: 'cod_esocial' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/riscos/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
                                    <Pencil size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.id)}
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
