'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { Stethoscope, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Exame {
    id: string;
    nome_exame: string;
    cod_esocial: string;
}

export default function ExamesPage() {
    const [exames, setExames] = useState<Exame[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExames();
    }, []);

    async function fetchExames() {
        setLoading(true);
        const { data, error } = await supabase
            .from('catalogo_exames')
            .select('*')
            .order('nome_exame');

        if (error) {
            console.error('Erro ao buscar exames:', error);
        } else {
            setExames(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este exame?')) return;

        const { error } = await supabase
            .from('catalogo_exames')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir exame');
        } else {
            fetchExames();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Catálogo de Exames"
                subtitle="Gerenciamento de tipos de exames"
                icon={Stethoscope}
                backLink="/"
                actionLabel="Novo Exame"
                actionLink="/exames/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={exames}
                        columns={[
                            { header: 'Nome do Exame', accessorKey: 'nome_exame' },
                            { header: 'Cód. eSocial', accessorKey: 'cod_esocial' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/exames/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
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
