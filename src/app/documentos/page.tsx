'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface DocumentoSST {
    id: string;
    tipo_documento: string;
    data_base: string;
    data_validade: string;
    empresa: { razao_social: string };
    versao: string;
}

export default function DocumentosPage() {
    const [docs, setDocs] = useState<DocumentoSST[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocs();
    }, []);

    async function fetchDocs() {
        setLoading(true);
        const { data, error } = await supabase
            .from('documentos_sst')
            .select(`
        id, 
        tipo_documento, 
        data_base, 
        data_validade,
        versao,
        empresa:empresas(razao_social)
      `)
            .order('data_base', { ascending: false });

        if (error) {
            console.error('Erro ao buscar documentos:', JSON.stringify(error, null, 2));
            alert('Erro ao buscar documentos: ' + error.message);
        } else {
            // @ts-ignore
            setDocs(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este documento?')) return;

        const { error } = await supabase
            .from('documentos_sst')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir documento');
        } else {
            fetchDocs();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Documentos SST"
                subtitle="Gestão de PGR, PCMSO, LTCAT, etc."
                icon={FileText}
                backLink="/"
                actionLabel="Novo Documento"
                actionLink="/documentos/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={docs}
                        columns={[
                            { header: 'Tipo', accessorKey: 'tipo_documento' },
                            { header: 'Empresa', cell: (item) => item.empresa?.razao_social || '-' },
                            { header: 'Data Base', cell: (item) => new Date(item.data_base).toLocaleDateString('pt-BR') },
                            { header: 'Validade', cell: (item) => item.data_validade ? new Date(item.data_validade).toLocaleDateString('pt-BR') : '-' },
                            { header: 'Versão', accessorKey: 'versao' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/documentos/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
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
