'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Eye, Trash2 } from 'lucide-react';

interface Exame {
    id: string;
    nome: string;
    codigo_tuss?: string;
    natureza?: string;
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
            .order('nome');

        if (error) {
            console.error(error);
            alert('Erro ao carregar exames');
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
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchExames();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Catálogo de Exames</h1>
                <Link href="/exames/novo">
                    <Button className="gap-2">
                        <Plus size={18} /> Novo Exame
                    </Button>
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Carregando...</p>
                ) : (
                    <Table
                        data={exames}
                        columns={[
                            { header: 'Nome', accessorKey: 'nome' },
                            { header: 'Código TUSS', accessorKey: 'codigo_tuss' },
                            { header: 'Natureza', accessorKey: 'natureza' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/exames/${item.id}`}>
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
