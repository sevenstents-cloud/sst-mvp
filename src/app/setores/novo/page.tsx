'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Layers } from 'lucide-react';

export default function NovoSetorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [locais, setLocais] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nome_setor: '',
        descricao_ambiente: '',
        local_trabalho_id: ''
    });

    useEffect(() => {
        async function loadLocais() {
            // Fetching locais with Empresa name for better context
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
            .from('setores')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar setor: ' + error.message);
            setLoading(false);
        } else {
            router.push('/setores');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Novo Setor"
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
                        placeholder="Ex: Recepção"
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
                            value={formData.descricao_ambiente}
                            onChange={(e) => setFormData({ ...formData, descricao_ambiente: e.target.value })}
                            placeholder="Descreva o ambiente físico, iluminação, ventilação, etc."
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
                            Salvar Setor
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
