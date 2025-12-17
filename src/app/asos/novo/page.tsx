'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FileCheck } from 'lucide-react';

const RESULTADOS = [
    { id: 'APTO', label: 'Apto' },
    { id: 'INAPTO', label: 'Inapto' },
    { id: 'APTO_COM_RESTRICAO', label: 'Apto com Restrição' },
];

export default function NovoExameRealizadoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [exames, setExames] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        funcionario_id: '',
        exame_id: '',
        data_realizacao: '',
        resultado: 'APTO',
        medico_responsavel: '',
        crm_medico: '',
        data_vencimento: '' // Should be calculated
    });

    useEffect(() => {
        async function loadData() {
            const { data: funcData } = await supabase
                .from('funcionarios')
                .select(`id, nome_completo, empresas(razao_social)`);

            const formattedFuncs = (funcData || []).map((f: any) => ({
                id: f.id,
                label: `${f.nome_completo} (${f.empresas?.razao_social})`
            }));
            setFuncionarios(formattedFuncs);

            const { data: examesData } = await supabase
                .from('catalogo_exames')
                .select('id, nome_exame')
                .order('nome_exame');

            setExames((examesData || []).map((e: any) => ({ id: e.id, label: e.nome_exame })));
        }
        loadData();
    }, []);

    // Use Effect to Auto-Calculate Due Date
    useEffect(() => {
        async function calculateVencimento() {
            if (!formData.funcionario_id || !formData.exame_id || !formData.data_realizacao) return;

            // 1. Get Employee GHE
            const { data: func } = await supabase.from('funcionarios').select('ghe_id').eq('id', formData.funcionario_id).single();
            if (!func) return;

            // 2. Find Protocol for GHE + Exame
            const { data: protocol } = await supabase
                .from('pcmso_protocolos')
                .select('periodicidade_meses')
                .eq('ghe_id', func.ghe_id)
                .eq('exame_id', formData.exame_id)
                .single();

            // 3. Calculate Date
            if (protocol && protocol.periodicidade_meses) {
                const date = new Date(formData.data_realizacao);
                date.setMonth(date.getMonth() + protocol.periodicidade_meses);
                setFormData(prev => ({ ...prev, data_vencimento: date.toISOString().split('T')[0] }));
            } else {
                // Default 12 months if no protocol? Or leave empty? Let's default to empty or user input
                // setFormData(prev => ({ ...prev, data_vencimento: '' }));
            }
        }
        calculateVencimento();
    }, [formData.funcionario_id, formData.exame_id, formData.data_realizacao]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('exames_realizados')
            .insert([formData]);

        if (error) {
            alert('Erro ao registrar exame: ' + error.message);
            setLoading(false);
        } else {
            router.push('/asos');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Registrar Novo Exame"
                icon={FileCheck}
                backLink="/asos"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Funcionário"
                            value={formData.funcionario_id}
                            onChange={(e) => setFormData({ ...formData, funcionario_id: e.target.value })}
                            options={funcionarios}
                            required
                        />
                        <Select
                            label="Exame Realizado"
                            value={formData.exame_id}
                            onChange={(e) => setFormData({ ...formData, exame_id: e.target.value })}
                            options={exames}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Data de Realização"
                            value={formData.data_realizacao}
                            onChange={(e) => setFormData({ ...formData, data_realizacao: e.target.value })}
                            required
                        />
                        <Input
                            type="date"
                            label="Data de Vencimento"
                            value={formData.data_vencimento}
                            onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                            placeholder="Calculado automaticamente"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Médico Responsável"
                            value={formData.medico_responsavel}
                            onChange={(e) => setFormData({ ...formData, medico_responsavel: e.target.value })}
                            required
                        />
                        <Input
                            label="CRM"
                            value={formData.crm_medico}
                            onChange={(e) => setFormData({ ...formData, crm_medico: e.target.value })}
                            required
                        />
                    </div>

                    <Select
                        label="Resultado"
                        value={formData.resultado}
                        onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                        options={RESULTADOS}
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
                            Salvar Registro
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
