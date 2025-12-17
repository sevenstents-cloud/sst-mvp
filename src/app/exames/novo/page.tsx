'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Stethoscope } from 'lucide-react';

export default function NovoExamePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nome_exame: '',
        cod_esocial: ''
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('catalogo_exames')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar exame: ' + error.message);
            setLoading(false);
        } else {
            router.push('/exames');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Novo Exame"
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
                        placeholder="Ex: Audiometria Tonal"
                    />

                    <Input
                        label="Código eSocial"
                        value={formData.cod_esocial}
                        onChange={(e) => setFormData({ ...formData, cod_esocial: e.target.value })}
                        placeholder="Ex: 0201"
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
                            Salvar Exame
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
