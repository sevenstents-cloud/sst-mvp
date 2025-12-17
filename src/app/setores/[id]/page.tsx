'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Layers } from 'lucide-react';

export default function EditarSetorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [locais, setLocais] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nome_setor: '',
        descricao_ambiente: '',
        local_trabalho_id: ''
    });

    useEffect(() => {
        async function loadData() {
            const { data: locaisData } = await supabase
                .from('locais_trabalho')
                .select(`id, nome_local, empresas(razao_social)`);

            const formattedLocais = (locaisData || []).map((l: any) => ({
                id: l.id,
                label: `${l.nome_local} (${l.empresas?.razao_social})`
            }));
            setLocais(formattedLocais);

            const { data: setorData, error } = await supabase
                .from('setores')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Setor não encontrado');
                router.push('/setores');
            } else {
                setFormData(setorData);
                setFetching(false);
            }
        }
        loadData();
    }, [id, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('setores')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar setor: ' + error.message);
            setLoading(false);
        } else {
            router.push('/setores');
        }
    }

    if (fetching) return <div className="container py-8">Carregando...</div>;

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Editar Setor"
                icon={Layers}
                backLink="/setores"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nome do Setor"
                        value={formData.nome_setor}
                        onChange={(e) => setFormData({ ...formData, nome_setor: e.target.value })}
                        required
                    />

                    <Select
                        label="Local de Trabalho"
                        value={formData.local_trabalho_id}
                        onChange={(e) => setFormData({ ...formData, local_trabalho_id: e.target.value })}
                        options={locais}
                        required
                    />

                    <div className="form-group">
                        <label className="form-label">Descrição do Ambiente</label>
                        <textarea
                            className="form-textarea w-full p-3 h-32"
                            value={formData.descricao_ambiente || ''}
                            onChange={(e) => setFormData({ ...formData, descricao_ambiente: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
