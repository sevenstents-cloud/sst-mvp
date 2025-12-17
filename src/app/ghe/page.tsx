'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { Users, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface GHE {
    id: string;
    nome_ghe: string;
    codigo_ghe: string;
    local_trabalho: { nome_local: string; empresa: { razao_social: string } };
}

export default function GhePage() {
    const [ghes, setGhes] = useState<GHE[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGhes();
    }, []);

    async function fetchGhes() {
        setLoading(true);
        const { data, error } = await supabase
            .from('ghe')
            .select(`
        id, 
        nome_ghe, 
        codigo_ghe,
        local_trabalho:locais_trabalho(
          nome_local,
          empresa:empresas(razao_social)
        )
      `)
            .order('nome_ghe');

        if (error) {
            console.error('Erro ao buscar GHEs:', error);
        } else {
            // @ts-ignore
            setGhes(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este GHE?')) return;

        const { error } = await supabase
            .from('ghe')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir GHE');
        } else {
            fetchGhes();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="GHE"
                subtitle="Grupos Homogêneos de Exposição"
                icon={Users}
                backLink="/"
                actionLabel="Novo GHE"
                actionLink="/ghe/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={ghes}
                        columns={[
                            { header: 'Nome GHE', accessorKey: 'nome_ghe' },
                            { header: 'Código', accessorKey: 'codigo_ghe' },
                            { header: 'Local', cell: (item) => item.local_trabalho?.nome_local || '-' },
                            { header: 'Empresa', cell: (item) => item.local_trabalho?.empresa?.razao_social || '-' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/ghe/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
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
