'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Briefcase } from 'lucide-react';

export default function NovoCargoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [empresas, setEmpresas] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nome_cargo: '',
        cbo: '',
        empresa_id: ''
    });

    useEffect(() => {
        async function loadEmpresas() {
            const { data } = await supabase.from('empresas').select('id, razao_social');
            setEmpresas(data || []);
        }
        loadEmpresas();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('cargos')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar cargo: ' + error.message);
            setLoading(false);
        } else {
            router.push('/cargos');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Novo Cargo"
                icon={Briefcase}
                backLink="/cargos"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nome do Cargo"
                        value={formData.nome_cargo}
                        onChange={(e) => setFormData({ ...formData, nome_cargo: e.target.value })}
                        required
                        placeholder="Ex: Desenvolvedor Senior"
                    />

                    <Input
                        label="CBO"
                        value={formData.cbo}
                        onChange={(e) => setFormData({ ...formData, cbo: e.target.value })}
                        placeholder="0000-00"
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
                            Salvar Cargo
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
