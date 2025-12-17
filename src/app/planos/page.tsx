'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { CheckSquare, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface PlanoAcao {
    id: string;
    descricao_acao: string;
    responsavel: string;
    data_fim_prevista: string;
    status: string;
    documento_sst: { tipo_documento: string; empresa: { razao_social: string } };
}

export default function PlanosPage() {
    const [planos, setPlanos] = useState<PlanoAcao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlanos();
    }, []);

    async function fetchPlanos() {
        setLoading(true);
        const { data, error } = await supabase
            .from('plano_acao')
            .select(`
        id, 
        descricao_acao, 
        responsavel, 
        data_fim_prevista,
        status,
        documento_sst:documentos_sst(
          tipo_documento,
          empresa:empresas(razao_social)
        )
      `)
            .order('data_fim_prevista');

        if (error) {
            console.error('Erro ao buscar planos:', error);
        } else {
            // @ts-ignore
            setPlanos(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta ação?')) return;

        const { error } = await supabase
            .from('plano_acao')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir plano de ação');
        } else {
            fetchPlanos();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Planos de Ação"
                subtitle="Controle de ações corretivas e preventivas"
                icon={CheckSquare}
                backLink="/"
                actionLabel="Nova Ação"
                actionLink="/planos/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={planos}
                        columns={[
                            { header: 'Ação', accessorKey: 'descricao_acao' },
                            {
                                header: 'Status', cell: (item) => (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' :
                                            item.status === 'ATRASADO' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                )
                            },
                            { header: 'Responsável', accessorKey: 'responsavel' },
                            { header: 'Prazo', cell: (item) => item.data_fim_prevista ? new Date(item.data_fim_prevista).toLocaleDateString('pt-BR') : '-' },
                            { header: 'Origem', cell: (item) => `${item.documento_sst?.tipo_documento} (${item.documento_sst?.empresa?.razao_social})` },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/planos/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
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
