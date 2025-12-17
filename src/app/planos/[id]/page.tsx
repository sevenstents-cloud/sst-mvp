'use client';

import { useEffect, useState, use } from 'react';
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

export default function EditarPlanoPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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
        async function loadData() {
            const { data: docData } = await supabase
                .from('documentos_sst')
                .select(`id, tipo_documento, empresas(razao_social)`);

            const formatted = (docData || []).map((d: any) => ({
                id: d.id,
                label: `${d.tipo_documento} - ${d.empresas?.razao_social}`
            }));
            setDocumentos(formatted);

            const { data, error } = await supabase
                .from('plano_acao')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Plano não encontrado');
                router.push('/planos');
            } else {
                setFormData(data);
                setFetching(false);
            }
        }
        loadData();
    }, [id, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('plano_acao')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar plano: ' + error.message);
            setLoading(false);
        } else {
            router.push('/planos');
        }
    }

    if (fetching) return <div className="container py-8">Carregando...</div>;

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Editar Ação"
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
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Documento de Origem"
                            value={formData.documento_id || ''}
                            onChange={(e) => setFormData({ ...formData, documento_id: e.target.value })}
                            options={documentos}
                        />
                        <Input
                            label="Responsável"
                            value={formData.responsavel || ''}
                            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Data Início"
                            value={formData.data_inicio || ''}
                            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                        />
                        <Input
                            type="date"
                            label="Prazo (Fim Previsto)"
                            value={formData.data_fim_prevista || ''}
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
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
