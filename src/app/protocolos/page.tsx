'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { ClipboardList, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Protocolo {
    id: string;
    periodicidade_meses: number;
    tipo_exame: string;
    ghe: { nome_ghe: string; local_trabalho: { empresa: { razao_social: string } } };
    exame: { nome_exame: string };
}

export default function ProtocolosPage() {
    const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProtocolos();
    }, []);

    async function fetchProtocolos() {
        setLoading(true);
        const { data, error } = await supabase
            .from('pcmso_protocolos')
            .select(`
        id, 
        periodicidade_meses, 
        tipo_exame,
        ghe:ghe(
          nome_ghe,
          local_trabalho:locais_trabalho(empresa:empresas(razao_social))
        ),
        exame:catalogo_exames(nome_exame)
      `)
            .order('id');

        if (error) {
            console.error('Erro ao buscar protocolos:', error);
        } else {
            // @ts-ignore
            setProtocolos(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este protocolo?')) return;

        const { error } = await supabase
            .from('pcmso_protocolos')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir protocolo');
        } else {
            fetchProtocolos();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Protocolos PCMSO"
                subtitle="Definição de exames por GHE"
                icon={ClipboardList}
                backLink="/"
                actionLabel="Novo Protocolo"
                actionLink="/protocolos/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={protocolos}
                        columns={[
                            { header: 'GHE', cell: (item) => item.ghe?.nome_ghe || '-' },
                            { header: 'Empresa', cell: (item) => item.ghe?.local_trabalho?.empresa?.razao_social || '-' },
                            { header: 'Exame', cell: (item) => item.exame?.nome_exame || '-' },
                            { header: 'Tipo', accessorKey: 'tipo_exame' },
                            { header: 'Periodicidade (meses)', accessorKey: 'periodicidade_meses' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/protocolos/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
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
