'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2 } from 'lucide-react';

export default function EditarEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        razao_social: '',
        nome_fantasia: '',
        cnpj: ''
    });

    useEffect(() => {
        async function loadEmpresa() {
            const { data, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Empresa não encontrada');
                router.push('/empresas');
            } else {
                setFormData(data);
                setFetching(false);
            }
        }
        loadEmpresa();
    }, [id, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('empresas')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar empresa: ' + error.message);
            setLoading(false);
        } else {
            router.push('/empresas');
        }
    }

    if (fetching) return <div className="container py-8">Carregando...</div>;

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Editar Empresa"
                icon={Building2}
                backLink="/empresas"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Razão Social"
                        value={formData.razao_social}
                        onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                        required
                    />

                    <Input
                        label="Nome Fantasia"
                        value={formData.nome_fantasia || ''}
                        onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                    />

                    <Input
                        label="CNPJ"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        required
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
