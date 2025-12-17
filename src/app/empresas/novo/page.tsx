'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2 } from 'lucide-react';

export default function NovaEmpresaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        razao_social: '',
        nome_fantasia: '',
        cnpj: ''
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('empresas')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar empresa: ' + error.message);
            setLoading(false);
        } else {
            router.push('/empresas');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Nova Empresa"
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
                        placeholder="Ex: Minha Empresa LTDA"
                    />

                    <Input
                        label="Nome Fantasia"
                        value={formData.nome_fantasia}
                        onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                        placeholder="Ex: Minha Empresa"
                    />

                    <Input
                        label="CNPJ"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        required
                        placeholder="00.000.000/0000-00"
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
                            Salvar Empresa
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
