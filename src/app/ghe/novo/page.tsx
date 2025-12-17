'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Users } from 'lucide-react';

export default function NovoGhePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [locais, setLocais] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nome_ghe: '',
        codigo_ghe: '',
        local_trabalho_id: ''
    });

    useEffect(() => {
        async function loadLocais() {
            const { data } = await supabase
                .from('locais_trabalho')
                .select(`id, nome_local, empresas(razao_social)`);

            const formattedLocais = (data || []).map((l: any) => ({
                id: l.id,
                label: `${l.nome_local} (${l.empresas?.razao_social})`
            }));
            setLocais(formattedLocais);
        }
        loadLocais();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('ghe')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar GHE: ' + error.message);
            setLoading(false);
        } else {
            router.push('/ghe');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Novo GHE"
                icon={Users}
                backLink="/ghe"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nome do GHE"
                        value={formData.nome_ghe}
                        onChange={(e) => setFormData({ ...formData, nome_ghe: e.target.value })}
                        required
                        placeholder="Ex: Administrativo"
                    />

                    <Input
                        label="Código"
                        value={formData.codigo_ghe}
                        onChange={(e) => setFormData({ ...formData, codigo_ghe: e.target.value })}
                        placeholder="Ex: GHE-01"
                    />

                    <Select
                        label="Local de Trabalho"
                        value={formData.local_trabalho_id}
                        onChange={(e) => setFormData({ ...formData, local_trabalho_id: e.target.value })}
                        options={locais}
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
                            Salvar GHE
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
