'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Users } from 'lucide-react';

export default function EditarFuncionarioPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [empresas, setEmpresas] = useState<any[]>([]);
    const [cargos, setCargos] = useState<any[]>([]);
    const [ghes, setGhes] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nome_completo: '',
        cpf: '',
        data_nascimento: '',
        data_admissao: '',
        empresa_id: '',
        cargo_id: '',
        ghe_id: ''
    });

    useEffect(() => {
        async function loadDependencies() {
            const { data: empData } = await supabase.from('empresas').select('id, razao_social');
            setEmpresas(empData || []);

            const { data: gheData } = await supabase.from('ghe').select('id, nome_ghe');
            setGhes(gheData || []);
        }
        loadDependencies();
    }, []);

    useEffect(() => {
        async function loadFuncionario() {
            const { data, error } = await supabase
                .from('funcionarios')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Funcionário não encontrado');
                router.push('/funcionarios');
            } else {
                setFormData(data);
                setFetching(false);
            }
        }
        loadFuncionario();
    }, [id, router]);

    useEffect(() => {
        async function loadCargos() {
            if (!formData.empresa_id) {
                setCargos([]);
                return;
            }
            const { data } = await supabase
                .from('cargos')
                .select('id, nome_cargo')
                .eq('empresa_id', formData.empresa_id);
            setCargos(data || []);
        }
        if (formData.empresa_id) loadCargos();
    }, [formData.empresa_id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('funcionarios')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar funcionário: ' + error.message);
            setLoading(false);
        } else {
            router.push('/funcionarios');
        }
    }

    if (fetching) return <div className="container py-8">Carregando...</div>;

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Editar Funcionário"
                icon={Users}
                backLink="/funcionarios"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nome Completo"
                        value={formData.nome_completo}
                        onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="CPF"
                            value={formData.cpf}
                            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                            required
                        />
                        <Select
                            label="Empresa"
                            value={formData.empresa_id}
                            onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                            options={empresas.map(e => ({ id: e.id, label: e.razao_social }))}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Cargo"
                            value={formData.cargo_id}
                            onChange={(e) => setFormData({ ...formData, cargo_id: e.target.value })}
                            options={cargos.map(c => ({ id: c.id, label: c.nome_cargo }))}
                            required
                        />
                        <Select
                            label="GHE"
                            value={formData.ghe_id}
                            onChange={(e) => setFormData({ ...formData, ghe_id: e.target.value })}
                            options={ghes.map(g => ({ id: g.id, label: g.nome_ghe }))}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Data de Nascimento"
                            value={formData.data_nascimento}
                            onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                            required
                        />
                        <Input
                            type="date"
                            label="Data de Admissão"
                            value={formData.data_admissao}
                            onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                            required
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
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
