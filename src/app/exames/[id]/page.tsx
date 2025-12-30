'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function DetalheExamePage() {
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        codigo_tuss: '',
        natureza: ''
    });

    useEffect(() => {
        if (id) fetchExame();
    }, [id]);

    async function fetchExame() {
        setLoading(true);
        const { data, error } = await supabase
            .from('catalogo_exames')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
            alert('Erro ao carregar exame');
        } else {
            setFormData(data);
        }
        setLoading(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase
            .from('catalogo_exames')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            alert('Salvo com sucesso!');
        }
        setSaving(false);
    }

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/exames">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Editar Exame</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="form-group">
                        <label className="form-label">Nome do Exame</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Código TUSS</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.codigo_tuss}
                                onChange={e => setFormData({ ...formData, codigo_tuss: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Natureza</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.natureza}
                                onChange={e => setFormData({ ...formData, natureza: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" isLoading={saving} className="gap-2">
                            <Save size={18} /> Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
