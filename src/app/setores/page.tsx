'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { Layers, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Setor {
    id: string;
    nome_setor: string;
    descricao_ambiente: string;
    local_trabalho: { nome_local: string; empresa: { razao_social: string } };
}

export default function SetoresPage() {
    const [setores, setSetores] = useState<Setor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSetores();
    }, []);

    async function fetchSetores() {
        setLoading(true);
        const { data, error } = await supabase
            .from('setores')
            .select(`
        id, 
        nome_setor, 
        descricao_ambiente,
        local_trabalho:locais_trabalho(
          nome_local,
          empresa:empresas(razao_social)
        )
      `)
            .order('nome_setor');

        if (error) {
            console.error('Erro ao buscar setores:', error);
        } else {
            // @ts-ignore
            setSetores(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este setor?')) return;

        const { error } = await supabase
            .from('setores')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir setor');
        } else {
            fetchSetores();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Setores"
                subtitle="Gerenciamento de setores e ambientes"
                icon={Layers}
                backLink="/"
                actionLabel="Novo Setor"
                actionLink="/setores/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={setores}
                        columns={[
                            { header: 'Setor', accessorKey: 'nome_setor' },
                            { header: 'Local', cell: (item) => item.local_trabalho?.nome_local || '-' },
                            { header: 'Empresa', cell: (item) => item.local_trabalho?.empresa?.razao_social || '-' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/setores/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
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
