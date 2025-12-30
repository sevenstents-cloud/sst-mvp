'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Eye, Trash2 } from 'lucide-react';

interface GHE {
    id: string;
    nome: string;
    descricao?: string;
    local_trabalho_id?: string;
    locais_trabalho?: { nome: string }; // Relation
}

export default function GHEPage() {
    const [gheList, setGheList] = useState<GHE[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGHE();
    }, []);

    async function fetchGHE() {
        setLoading(true);
        const { data, error } = await supabase
            .from('ghe')
            .select('*, locais_trabalho(nome)')
            .order('nome');

        if (error) {
            console.error(error);
            alert('Erro ao carregar GHEs');
        } else {
            setGheList(data as any || []);
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
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchGHE();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Grupos Homogêneos (GHE)</h1>
                <Link href="/ghe/novo">
                    <Button className="gap-2">
                        <Plus size={18} /> Novo GHE
                    </Button>
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Carregando...</p>
                ) : (
                    <Table
                        data={gheList}
                        columns={[
                            { header: 'Nome', accessorKey: 'nome' },
                            { header: 'Local de Trabalho', cell: (item) => item.locais_trabalho?.nome || '-' },
                            { header: 'Descrição', accessorKey: 'descricao' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/ghe/${item.id}`}>
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
