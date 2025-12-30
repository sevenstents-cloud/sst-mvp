'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoCargoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [empresas, setEmpresas] = useState<{ id: string, label: string }[]>([]);

    const [formData, setFormData] = useState({
        nome: '',
        cbo: '',
        descricao: '',
        empresa_id: ''
    });

    useEffect(() => {
        async function loadEmpresas() {
            const { data } = await supabase.from('empresas').select('id, nome_fantasia').order('nome_fantasia');
            if (data) setEmpresas(data.map(e => ({ id: e.id, label: e.nome_fantasia })));
        }
        loadEmpresas();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('cargos')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar cargo: ' + error.message);
            setLoading(false);
        } else {
            router.push('/cargos');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/cargos">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Novo Cargo</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-group">
                        <Select
                            label="Empresa"
                            name="empresa_id"
                            required
                            value={formData.empresa_id}
                            onChange={handleChange}
                            options={empresas}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Nome do Cargo</label>
                            <input
                                type="text"
                                name="nome"
                                required
                                className="form-input"
                                value={formData.nome}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">CBO</label>
                            <input
                                type="text"
                                name="cbo"
                                className="form-input"
                                placeholder="0000-00"
                                value={formData.cbo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Descrição das Atividades</label>
                        <textarea
                            name="descricao"
                            className="form-textarea"
                            rows={4}
                            value={formData.descricao}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Link href="/cargos">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" isLoading={loading}>
                            Salvar Cargo
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
