'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Users } from 'lucide-react';
import Link from 'next/link';

export default function DetalheGHEPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [ghe, setGhe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Association State
    const [allCargos, setAllCargos] = useState<any[]>([]);
    const [selectedCargos, setSelectedCargos] = useState<string[]>([]);
    const [savingAssoc, setSavingAssoc] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    async function fetchData() {
        setLoading(true);
        // Fetch GHE
        const { data: gheData } = await supabase
            .from('ghe')
            .select('*, locais_trabalho(nome, empresas(id))')
            .eq('id', id)
            .single();

        setGhe(gheData);

        if (gheData?.locais_trabalho?.empresas?.id) {
            // Fetch Cargos of the SAME company
            const empresaId = gheData.locais_trabalho.empresas.id;
            const { data: cargosData } = await supabase
                .from('cargos')
                .select('id, nome')
                .eq('empresa_id', empresaId)
                .order('nome');
            setAllCargos(cargosData || []);
        }

        // Fetch Existing Associations
        const { data: assocData } = await supabase
            .from('ghe_cargos')
            .select('cargo_id')
            .eq('ghe_id', id);

        if (assocData) {
            setSelectedCargos(assocData.map((a: any) => a.cargo_id));
        }

        setLoading(false);
    }

    async function handleSaveAssociations() {
        setSavingAssoc(true);

        // 1. Delete all existing for this GHE (simple way)
        await supabase.from('ghe_cargos').delete().eq('ghe_id', id);

        // 2. Insert new ones
        if (selectedCargos.length > 0) {
            const records = selectedCargos.map(cargoId => ({
                ghe_id: id,
                cargo_id: cargoId
            }));

            const { error } = await supabase.from('ghe_cargos').insert(records);
            if (error) {
                alert('Erro ao salvar associações: ' + error.message);
            } else {
                alert('Associações atualizadas com sucesso!');
            }
        } else {
            alert('Associações removidas.');
        }
        setSavingAssoc(false);
    }

    const toggleCargo = (cargoId: string) => {
        setSelectedCargos(prev =>
            prev.includes(cargoId)
                ? prev.filter(p => p !== cargoId)
                : [...prev, cargoId]
        );
    };

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/ghe">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">
                    GHE: {ghe?.nome}
                </h1>
            </div>

            {/* GHE Details Card */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500 text-sm">Local de Trabalho</span>
                        <p className="font-medium">{ghe?.locais_trabalho?.nome}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-sm">Descrição</span>
                        <p className="font-medium">{ghe?.descricao || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Association Component */}
            <div className="card space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Vincular Cargos
                    </h2>
                    <span className="text-sm text-gray-500">
                        Selecione os cargos que pertencem a este GHE
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2">
                    {allCargos.length > 0 ? allCargos.map(cargo => (
                        <div
                            key={cargo.id}
                            onClick={() => toggleCargo(cargo.id)}
                            className={`
                                cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all
                                ${selectedCargos.includes(cargo.id)
                                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                                    : 'hover:bg-gray-50 border-gray-200'}
                            `}
                        >
                            <span className="font-medium text-sm">{cargo.nome}</span>
                            <div className={`
                                w-5 h-5 rounded border flex items-center justify-center
                                ${selectedCargos.includes(cargo.id) ? 'bg-primary border-primary text-white' : 'border-gray-300'}
                            `}>
                                {selectedCargos.includes(cargo.id) && <Users size={12} />}
                            </div>
                        </div>
                    )) : (
                        <p className="col-span-3 text-center text-gray-500 py-4">
                            Nenhum cargo encontrado para a empresa deste local.
                        </p>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveAssociations} isLoading={savingAssoc} className="gap-2">
                        <Save size={18} /> Salvar Vínculos
                    </Button>
                </div>
            </div>
        </div>
    );
}
