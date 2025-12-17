'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MapPin } from 'lucide-react';

export default function EditarLocalPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [empresas, setEmpresas] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nome_local: '',
        empresa_id: ''
    });

    useEffect(() => {
        async function loadData() {
            const { data: empData } = await supabase.from('empresas').select('id, razao_social');
            setEmpresas(empData || []);

            const { data: localData, error } = await supabase
                .from('locais_trabalho')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Local não encontrado');
                router.push('/locais');
            } else {
                setFormData(localData);
                setFetching(false);
            }
        }
        loadData();
    }, [id, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('locais_trabalho')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar local: ' + error.message);
            setLoading(false);
        } else {
            router.push('/locais');
        }
    }

    if (fetching) return <div className="container py-8">Carregando...</div>;

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Editar Local de Trabalho"
                icon={MapPin}
                backLink="/locais"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nome do Local"
                        value={formData.nome_local}
                        onChange={(e) => setFormData({ ...formData, nome_local: e.target.value })}
                        required
                    />

                    <Select
                        label="Empresa"
                        value={formData.empresa_id}
                        onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                        options={empresas.map(e => ({ id: e.id, label: e.razao_social }))}
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
