'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoExamePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        codigo_tuss: '',
        natureza: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('catalogo_exames')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar exame: ' + error.message);
            setLoading(false);
        } else {
            router.push('/exames');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/exames">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Novo Exame</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-group">
                        <label className="form-label">Nome do Exame</label>
                        <input
                            type="text"
                            name="nome"
                            required
                            className="form-input"
                            value={formData.nome}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Código TUSS (Opcional)</label>
                            <input
                                type="text"
                                name="codigo_tuss"
                                className="form-input"
                                value={formData.codigo_tuss}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Natureza</label>
                            <input
                                type="text"
                                name="natureza"
                                className="form-input"
                                placeholder="Ex: Clínico, Laboratorial"
                                value={formData.natureza}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Link href="/exames">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" isLoading={loading}>
                            Salvar Exame
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
