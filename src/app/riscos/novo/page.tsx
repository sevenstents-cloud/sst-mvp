'use client';

import { useState } from 'react';
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

export default function NovoRiscoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nome_agente: '',
        categoria: '',
        cod_esocial: ''
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('catalogo_riscos')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar risco: ' + error.message);
            setLoading(false);
        } else {
            router.push('/riscos');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Novo Risco"
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
                        placeholder="Ex: Ruído Contínuo"
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
                        value={formData.cod_esocial}
                        onChange={(e) => setFormData({ ...formData, cod_esocial: e.target.value })}
                        placeholder="Ex: 01.01.002"
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
                            Salvar Risco
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
