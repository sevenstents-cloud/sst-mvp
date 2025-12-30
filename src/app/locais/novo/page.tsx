'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoLocalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [empresas, setEmpresas] = useState<{ id: string, label: string }[]>([]);

    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        empresa_id: ''
    });

    useEffect(() => {
        async function loadEmpresas() {
            const { data } = await supabase.from('empresas').select('id, nome_fantasia').order('nome_fantasia');
            if (data) {
                setEmpresas(data.map(e => ({ id: e.id, label: e.nome_fantasia })));
            }
        }
        loadEmpresas();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('locais_trabalho')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar local: ' + error.message);
            setLoading(false);
        } else {
            router.push('/locais');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/locais">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Novo Local de Trabalho</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group col-span-2">
                            <Select
                                label="Empresa Vinculada"
                                name="empresa_id"
                                required
                                value={formData.empresa_id}
                                onChange={handleChange}
                                options={empresas}
                            />
                        </div>
                        <div className="form-group md:col-span-2">
                            <label className="form-label">Nome do Local</label>
                            <input
                                type="text"
                                name="nome"
                                required
                                className="form-input"
                                placeholder="Ex: Galpão Principal, Escritório Central"
                                value={formData.nome}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group md:col-span-2">
                            <label className="form-label">Descrição</label>
                            <input
                                type="text"
                                name="descricao"
                                className="form-input"
                                value={formData.descricao}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Link href="/locais">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" isLoading={loading}>
                            Salvar Local
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
