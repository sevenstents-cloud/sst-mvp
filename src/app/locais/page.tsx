'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface LocalTrabalho {
    id: string;
    nome: string;
    empresa_id: string;
    descricao?: string;
    empresas?: { // Joined
        nome_fantasia: string;
    };
}

export default function LocaisPage() {
    const [locais, setLocais] = useState<LocalTrabalho[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLocais();
    }, []);

    async function fetchLocais() {
        setLoading(true);
        // Fetch locais fetching related empresa name
        const { data, error } = await supabase
            .from('locais_trabalho')
            .select(`
                *,
                empresas (
                    nome_fantasia
                )
            `)
            .order('nome');

        if (error) {
            console.error(error);
            alert('Erro ao carregar locais de trabalho');
        } else {
            setLocais(data as any || []);
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
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchLocais();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Locais de Trabalho</h1>
                <Link href="/locais/novo">
                    <Button className="gap-2">
                        <Plus size={18} /> Novo Local
                    </Button>
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Carregando...</p>
                ) : (
                    <Table
                        data={locais}
                        columns={[
                            { header: 'Nome do Local', accessorKey: 'nome' },
                            { header: 'Empresa', cell: (item) => item.empresas?.nome_fantasia || 'N/A' },
                            { header: 'Descrição', accessorKey: 'descricao' },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/locais/${item.id}`}>
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
