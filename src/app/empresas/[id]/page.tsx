'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Trash2, Home } from 'lucide-react';
import Link from 'next/link';

export default function DetalheEmpresaPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(searchParams.get('edit') === 'true');

    // Initial State
    const [formData, setFormData] = useState({
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        endereco: '',
        cidade: '',
        estado: ''
    });

    useEffect(() => {
        if (id) {
            fetchEmpresa();
        }
    }, [id]);

    async function fetchEmpresa() {
        setLoading(true);
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
            alert('Erro ao carregar empresa');
        } else {
            setFormData(data);
        }
        setLoading(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from('empresas')
            .update(formData)
            .eq('id', id);

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            setEditMode(false);
            // Update URL removing edit param
            router.replace(`/empresas/${id}`);
        }
        setSaving(false);
    }

    async function handleDelete() {
        if (!confirm('Tem certeza que deseja excluir esta empresa? Esta ação é irreversível.')) return;

        setSaving(true);
        const { error } = await supabase
            .from('empresas')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir: ' + error.message);
            setSaving(false);
        } else {
            router.push('/empresas');
        }
    }

    if (loading) return <div className="p-8 text-center">Carregando detalhes...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/empresas">
                        <Button variant="outline" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {editMode ? 'Editar Empresa' : formData.nome_fantasia}
                    </h1>
                </div>
                <div className="flex gap-2">
                    {!editMode ? (
                        <>
                            <Button onClick={() => setEditMode(true)}>
                                Editar
                            </Button>
                            <Button variant="destructive" size="icon" onClick={handleDelete} title="Excluir Empresa">
                                <Trash2 size={20} />
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => {
                            setEditMode(false);
                            fetchEmpresa(); // Reset form
                        }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </div>

            <div className="card">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Razão Social</label>
                            <input
                                type="text"
                                disabled={!editMode}
                                className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.razao_social}
                                onChange={e => setFormData({ ...formData, razao_social: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nome Fantasia</label>
                            <input
                                type="text"
                                disabled={!editMode}
                                className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.nome_fantasia}
                                onChange={e => setFormData({ ...formData, nome_fantasia: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">CNPJ</label>
                            <input
                                type="text"
                                disabled={!editMode}
                                className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.cnpj}
                                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Endereço</label>
                            <input
                                type="text"
                                disabled={!editMode}
                                className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.endereco}
                                onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cidade</label>
                            <input
                                type="text"
                                disabled={!editMode}
                                className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.cidade}
                                onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado</label>
                            <input
                                type="text"
                                disabled={!editMode}
                                className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                                maxLength={2}
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                            />
                        </div>
                    </div>

                    {editMode && (
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button type="submit" isLoading={saving} className="gap-2">
                                <Save size={18} /> Salvar Alterações
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
