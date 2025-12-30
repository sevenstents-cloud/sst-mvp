'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function NovoGHEPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [locais, setLocais] = useState<{ id: string, label: string }[]>([]);

    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        local_trabalho_id: ''
    });

    useEffect(() => {
        async function loadLocais() {
            const { data } = await supabase
                .from('locais_trabalho')
                .select('id, nome, empresas(nome_fantasia)')
                .order('nome');

            if (data) {
                setLocais(data.map((l: any) => ({
                    id: l.id,
                    label: `${l.nome} (${l.empresas?.nome_fantasia})`
                })));
            }
        }
        loadLocais();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('ghe')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar GHE: ' + error.message);
            setLoading(false);
        } else {
            router.push('/ghe');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/ghe">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Novo GHE</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-group">
                        <Select
                            label="Local de Trabalho"
                            name="local_trabalho_id"
                            required
                            value={formData.local_trabalho_id}
                            onChange={handleChange}
                            options={locais}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nome do GHE</label>
                        <input
                            type="text"
                            name="nome"
                            required
                            className="form-input"
                            placeholder="Ex: GHE 01 - Administrativo"
                            value={formData.nome}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Descrição</label>
                        <input
                            type="text"
                            name="descricao"
                            className="form-input"
                            value={formData.descricao}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Link href="/ghe">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" isLoading={loading}>
                            Salvar GHE
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
