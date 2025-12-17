'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Stethoscope } from 'lucide-react';

export default function EditarExamePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        nome_exame: '',
        cod_esocial: ''
    });

    useEffect(() => {
        async function loadData() {
            const { data, error } = await supabase
                .from('catalogo_exames')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Exame não encontrado');
                router.push('/exames');
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
            .from('catalogo_exames')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar exame: ' + error.message);
            setLoading(false);
        } else {
            router.push('/exames');
        }
    }

    if (fetching) return <div className="container py-8">Carregando...</div>;

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Editar Exame"
                icon={Stethoscope}
                backLink="/exames"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nome do Exame"
                        value={formData.nome_exame}
                        onChange={(e) => setFormData({ ...formData, nome_exame: e.target.value })}
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
