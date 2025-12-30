'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function DetalheCargoPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        cbo: '',
        descricao: '',
        empresa_id: ''
    });

    // Also need empresa name for display if read-only, but assume we just edit everything?
    // Let's just do basics.

    useEffect(() => {
        if (id) fetchCargo();
    }, [id]);

    async function fetchCargo() {
        setLoading(true);
        const { data, error } = await supabase
            .from('cargos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
            alert('Erro ao carregar cargo');
        } else {
            setFormData(data);
        }
        setLoading(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase
            .from('cargos')
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
                <Link href="/cargos">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Editar Cargo</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Nome do Cargo</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">CBO</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.cbo}
                                onChange={e => setFormData({ ...formData, cbo: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Descrição</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                        />
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
