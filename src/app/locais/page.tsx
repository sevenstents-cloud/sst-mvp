'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface LocalTrabalho {
    id: string;
    nome_local: string;
    empresa: { razao_social: string };
}

export default function LocaisPage() {
    const [locais, setLocais] = useState<LocalTrabalho[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLocais();
    }, []);

    async function fetchLocais() {
        setLoading(true);
        const { data, error } = await supabase
            .from('locais_trabalho')
            .select(`
        id, 
        nome_local, 
        empresa:empresas(razao_social)
      `)
            .order('nome_local');

        if (error) {
            console.error('Erro ao buscar locais:', error);
        } else {
            // @ts-ignore
            setLocais(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este local?')) return;

        const { error } = await supabase
            .from('locais_trabalho')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir local');
        } else {
            fetchLocais();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Locais de Trabalho"
                subtitle="Gerenciamento de unidades e locais"
                icon={MapPin}
                backLink="/"
                actionLabel="Novo Local"
                actionLink="/locais/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={locais}
                        columns={[
                            { header: 'Local', accessorKey: 'nome_local' },
                            { header: 'Empresa', cell: (item) => item.empresa?.razao_social || '-' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/locais/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
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
