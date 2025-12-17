'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FileText } from 'lucide-react';

const TIPOS_DOC = [
    { id: 'PGR', label: 'PGR - Programa de Gerenciamento de Riscos' },
    { id: 'PCMSO', label: 'PCMSO - Programa de Controle Médico de Saúde Ocupacional' },
    { id: 'LTCAT', label: 'LTCAT - Laudo Técnico das Condições Ambientais do Trabalho' },
    { id: 'Laudo Ergonômico', label: 'AET - Análise Ergonômica do Trabalho' },
    { id: 'Outros', label: 'Outros' },
];

export default function NovoDocumentoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [empresas, setEmpresas] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        tipo_documento: '',
        empresa_id: '',
        data_base: '',
        data_validade: '',
        responsavel_tecnico: '',
        versao: '1.0'
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
            .from('documentos_sst')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar documento: ' + error.message);
            setLoading(false);
        } else {
            router.push('/documentos');
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Novo Documento SST"
                icon={FileText}
                backLink="/documentos"
            />

            <div className="card max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Tipo de Documento"
                            value={formData.tipo_documento}
                            onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                            options={TIPOS_DOC}
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
                        <Input
                            type="date"
                            label="Data Base (Início)"
                            value={formData.data_base}
                            onChange={(e) => setFormData({ ...formData, data_base: e.target.value })}
                            required
                        />
                        <Input
                            type="date"
                            label="Data de Validade"
                            value={formData.data_validade}
                            onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Responsável Técnico"
                            value={formData.responsavel_tecnico}
                            onChange={(e) => setFormData({ ...formData, responsavel_tecnico: e.target.value })}
                            placeholder="Nome do Eng. ou Médico"
                        />
                        <Input
                            label="Versão"
                            value={formData.versao}
                            onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
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
                            Salvar Documento
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
