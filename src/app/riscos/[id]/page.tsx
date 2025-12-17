'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

const CATEGORIAS = [
    { id: 'Físico', label: 'Físico' },
    { id: 'Químico', label: 'Químico' },
    { id: 'Biológico', label: 'Biológico' },
    { id: 'Ergonômico', label: 'Ergonômico' },
    { id: 'Acidentes', label: 'Acidentes/Mecânico' },
];

export default function EditarRiscoPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        nome_agente: '',
        categoria: '',
        cod_esocial: ''
    });

    useEffect(() => {
        async function loadData() {
            const { data, error } = await supabase
                .from('catalogo_riscos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Risco não encontrado');
                router.push('/riscos');
            } else {
                setFormData(data);
                setFetching(false);
            }
        }
        loadData();
    }, [id, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('catalogo_riscos')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar risco: ' + error.message);
            setLoading(false);
        } else {
            router.push('/riscos');
        }
    }

    if (fetching) return <div className="container py-8">Carregando...</div>;

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Editar Risco"
                icon={AlertTriangle}
                backLink="/riscos"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nome do Agente"
                        value={formData.nome_agente}
                        onChange={(e) => setFormData({ ...formData, nome_agente: e.target.value })}
                        required
                    />

                    <Select
                        label="Categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        options={CATEGORIAS}
                        required
                    />

                    <Input
                        label="Código eSocial"
                        value={formData.cod_esocial || ''}
                        onChange={(e) => setFormData({ ...formData, cod_esocial: e.target.value })}
                    />

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
