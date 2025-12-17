'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { Briefcase, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Cargo {
    id: string;
    nome_cargo: string;
    cbo: string;
    empresa: { razao_social: string };
}

export default function CargosPage() {
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCargos();
    }, []);

    async function fetchCargos() {
        setLoading(true);
        const { data, error } = await supabase
            .from('cargos')
            .select(`
        id, 
        nome_cargo, 
        cbo,
        empresa:empresas(razao_social)
      `)
            .order('nome_cargo');

        if (error) {
            console.error('Erro ao buscar cargos:', error);
        } else {
            // @ts-ignore
            setCargos(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este cargo?')) return;

        const { error } = await supabase
            .from('cargos')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir cargo');
        } else {
            fetchCargos();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Cargos"
                subtitle="Gerenciamento de cargos e funções"
                icon={Briefcase}
                backLink="/"
                actionLabel="Novo Cargo"
                actionLink="/cargos/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={cargos}
                        columns={[
                            { header: 'Cargo', accessorKey: 'nome_cargo' },
                            { header: 'CBO', accessorKey: 'cbo' },
                            { header: 'Empresa', cell: (item) => item.empresa?.razao_social || '-' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/cargos/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
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
