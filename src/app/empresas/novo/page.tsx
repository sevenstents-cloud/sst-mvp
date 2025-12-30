'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovaEmpresaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        endereco: '',
        cidade: '',
        estado: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('empresas')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar empresa: ' + error.message);
            setLoading(false);
        } else {
            router.push('/empresas');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/empresas">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Nova Empresa</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Razão Social</label>
                            <input
                                type="text"
                                name="razao_social"
                                required
                                className="form-input"
                                value={formData.razao_social}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nome Fantasia</label>
                            <input
                                type="text"
                                name="nome_fantasia"
                                required
                                className="form-input"
                                value={formData.nome_fantasia}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">CNPJ</label>
                            <input
                                type="text"
                                name="cnpj"
                                required
                                className="form-input"
                                placeholder="00.000.000/0000-00"
                                value={formData.cnpj}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Endereço</label>
                            <input
                                type="text"
                                name="endereco"
                                className="form-input"
                                value={formData.endereco}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cidade</label>
                            <input
                                type="text"
                                name="cidade"
                                className="form-input"
                                value={formData.cidade}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado</label>
                            <input
                                type="text"
                                name="estado"
                                className="form-input"
                                maxLength={2}
                                placeholder="UF"
                                value={formData.estado}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Link href="/empresas">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" isLoading={loading}>
                            Salvar Empresa
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
