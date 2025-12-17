'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ClipboardList } from 'lucide-react';

const TIPOS_EXAME = [
    { id: 'Admissional', label: 'Admissional' },
    { id: 'Periódico', label: 'Periódico' },
    { id: 'Retorno ao Trabalho', label: 'Retorno ao Trabalho' },
    { id: 'Mudança de Risco', label: 'Mudança de Risco' },
    { id: 'Demissional', label: 'Demissional' },
    { id: 'Todos', label: 'Todos' },
];

export default function EditarProtocoloPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [ghes, setGhes] = useState<any[]>([]);
    const [exames, setExames] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        ghe_id: '',
        exame_id: '',
        periodicidade_meses: '',
        tipo_exame: 'Periódico'
    });

    useEffect(() => {
        async function loadData() {
            const { data: gheData } = await supabase
                .from('ghe')
                .select(`id, nome_ghe, locais_trabalho(nome_local, empresas(razao_social))`);

            const formattedGhes = (gheData || []).map((g: any) => ({
                id: g.id,
                label: `${g.nome_ghe} - ${g.locais_trabalho?.empresas?.razao_social}`
            }));
            setGhes(formattedGhes);

            const { data: examesData } = await supabase
                .from('catalogo_exames')
                .select('id, nome_exame')
                .order('nome_exame');

            setExames((examesData || []).map((e: any) => ({ id: e.id, label: e.nome_exame })));

            const { data, error } = await supabase
                .from('pcmso_protocolos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Protocolo não encontrado');
                router.push('/protocolos');
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
            .from('pcmso_protocolos')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar protocolo: ' + error.message);
            setLoading(false);
        } else {
            router.push('/protocolos');
        }
    }

    if (fetching) return <div className="container py-8">Carregando...</div>;

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Editar Protocolo PCMSO"
                icon={ClipboardList}
                backLink="/protocolos"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="GHE"
                            value={formData.ghe_id}
                            onChange={(e) => setFormData({ ...formData, ghe_id: e.target.value })}
                            options={ghes}
                            required
                        />
                        <Select
                            label="Exame"
                            value={formData.exame_id}
                            onChange={(e) => setFormData({ ...formData, exame_id: e.target.value })}
                            options={exames}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Tipo de Exame"
                            value={formData.tipo_exame}
                            onChange={(e) => setFormData({ ...formData, tipo_exame: e.target.value })}
                            options={TIPOS_EXAME}
                            required
                        />
                        <Input
                            type="number"
                            label="Periodicidade (Meses)"
                            value={formData.periodicidade_meses}
                            onChange={(e) => setFormData({ ...formData, periodicidade_meses: e.target.value })}
                            placeholder="Ex: 12"
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
