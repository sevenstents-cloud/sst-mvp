'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button'; // Assuming Button component exists
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Empresa {
    id: string;
    nome_fantasia: string;
    razao_social: string;
    cnpj: string;
    cidade: string;
    estado: string;
}

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchEmpresas();
    }, []);

    async function fetchEmpresas() {
        setLoading(true);
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('nome_fantasia');

        if (error) {
            console.error(error);
            alert('Erro ao carregar empresas');
        } else {
            setEmpresas(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

        const { error } = await supabase
            .from('empresas')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchEmpresas();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Empresas Clients</h1>
                <Link href="/empresas/novo">
                    <Button className="gap-2">
                        <Plus size={18} /> Nova Empresa
                    </Button>
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Carregando...</p>
                ) : (
                    <Table
                        data={empresas}
                        columns={[
                            { header: 'Nome Fantasia', accessorKey: 'nome_fantasia' },
                            { header: 'Razão Social', accessorKey: 'razao_social' },
                            { header: 'CNPJ', accessorKey: 'cnpj' },
                            { header: 'Cidade/UF', cell: (item) => `${item.cidade || ''} / ${item.estado || ''}` },
                        ]}
                        actions={(item) => (
                            <>
                                <Link href={`/empresas/${item.id}`} title="Ver Detalhes">
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                                        <Eye size={18} />
                                    </button>
                                </Link>
                                <Link href={`/empresas/${item.id}?edit=true`} title="Editar">
                                    <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-md">
                                        <Edit size={18} />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                    title="Excluir"
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
