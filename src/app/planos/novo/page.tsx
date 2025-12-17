'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CheckSquare } from 'lucide-react';

const STATUS_OPTS = [
    { id: 'PENDENTE', label: 'Pendente' },
    { id: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { id: 'CONCLUIDO', label: 'Concluído' },
    { id: 'ATRASADO', label: 'Atrasado' },
];

export default function NovoPlanoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [documentos, setDocumentos] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        descricao_acao: '',
        documento_id: '',
        responsavel: '',
        data_inicio: '',
        data_fim_prevista: '',
        status: 'PENDENTE'
    });

    useEffect(() => {
        async function loadDocs() {
            const { data } = await supabase
                .from('documentos_sst')
                .select(`id, tipo_documento, empresas(razao_social)`);

            const formatted = (data || []).map((d: any) => ({
                id: d.id,
                label: `${d.tipo_documento} - ${d.empresas?.razao_social}`
            }));
            setDocumentos(formatted);
        }
        loadDocs();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('plano_acao')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar plano: ' + error.message);
            setLoading(false);
        } else {
            router.push('/planos');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Nova Ação"
                icon={CheckSquare}
                backLink="/planos"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Descrição da Ação</label>
                        <textarea
                            className="form-textarea w-full p-3 h-24"
                            value={formData.descricao_acao}
                            onChange={(e) => setFormData({ ...formData, descricao_acao: e.target.value })}
                            required
                            placeholder="Descreva a ação a ser realizada..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Documento de Origem"
                            value={formData.documento_id}
                            onChange={(e) => setFormData({ ...formData, documento_id: e.target.value })}
                            options={documentos}
                        />
                        <Input
                            label="Responsável"
                            value={formData.responsavel}
                            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                            placeholder="Nome do Responsável"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Data Início"
                            value={formData.data_inicio}
                            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                        />
                        <Input
                            type="date"
                            label="Prazo (Fim Previsto)"
                            value={formData.data_fim_prevista}
                            onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
                        />
                    </div>

                    <Select
                        label="Status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        options={STATUS_OPTS}
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
                            Salvar Ação
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
