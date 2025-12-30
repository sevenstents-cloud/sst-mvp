'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Eye, Trash2 } from 'lucide-react';

interface Cargo {
    id: string;
    nome: string;
    cbo?: string;
    empresa_id: string;
    empresas?: { nome_fantasia: string };
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
                *,
                empresas (nome_fantasia)
            `)
            .order('nome');

        if (error) {
            console.error(error);
            alert('Erro ao carregar cargos');
        } else {
            setCargos(data as any || []);
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
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchCargos();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Cargos e Funções</h1>
                <Link href="/cargos/novo">
                    <Button className="gap-2">
                        <Plus size={18} /> Novo Cargo
                    </Button>
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Carregando...</p>
                ) : (
                    <Table
                        data={cargos}
                        columns={[
                            { header: 'Nome do Cargo', accessorKey: 'nome' },
                            { header: 'CBO', accessorKey: 'cbo' },
                            { header: 'Empresa', cell: (item) => item.empresas?.nome_fantasia || '-' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/cargos/${item.id}`}>
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                                        <Eye size={18} />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
                    />
                )}
            </div>
        </div>
    );
}
