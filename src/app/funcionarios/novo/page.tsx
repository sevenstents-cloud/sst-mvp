'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoFuncionarioPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Lists for selects
    const [empresas, setEmpresas] = useState<{ id: string, label: string }[]>([]);
    const [cargos, setCargos] = useState<{ id: string, label: string }[]>([]);
    const [ghe, setGhe] = useState<{ id: string, label: string }[]>([]);

    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        data_nascimento: '',
        data_admissao: '',
        empresa_id: '',
        cargo_id: '',
        ghe_id: '',
        rg: '',
        sexo: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    // Load dependent data when empresa_id changes
    useEffect(() => {
        if (formData.empresa_id) {
            loadCompanyData(formData.empresa_id);
        } else {
            setCargos([]);
            setGhe([]);
        }
    }, [formData.empresa_id]);

    async function loadInitialData() {
        const { data: empData } = await supabase.from('empresas').select('id, nome_fantasia').order('nome_fantasia');
        if (empData) setEmpresas(empData.map(e => ({ id: e.id, label: e.nome_fantasia })));
    }

    async function loadCompanyData(empresaId: string) {
        // Load Cargos for this company
        const { data: cargoData } = await supabase
            .from('cargos')
            .select('id, nome')
            .eq('empresa_id', empresaId)
            .order('nome');
        if (cargoData) setCargos(cargoData.map(c => ({ id: c.id, label: c.nome })));

        // Load GHE (usually linked to local, but simplified here or fetch all for company's workspaces)
        // Assuming GHE has direct link or via local. Prompt says GHE selector for local_trabalho_id.
        // For simplicity, we might need to select Local first? 
        // Prompt says: "Funcionarios (with selectors for empresa_id, cargo_id, ghe_id...)"
        // It doesn't strictly say Local selector. But GHE belongs to local.
        // I'll fetch ALL GHEs or try to filter if possible. For now fetching all.
        const { data: gheData } = await supabase.from('ghe').select('id, nome').order('nome'); // Schema might filter by local linked to empresa
        if (gheData) setGhe(gheData.map(g => ({ id: g.id, label: g.nome })));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('funcionarios')
            .insert([formData]);

        if (error) {
            alert('Erro ao criar funcionário: ' + error.message);
            setLoading(false);
        } else {
            router.push('/funcionarios');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/funcionarios">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Novo Funcionário</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="form-group md:col-span-3">
                            <Select
                                label="Empresa"
                                name="empresa_id"
                                required
                                value={formData.empresa_id}
                                onChange={handleChange}
                                options={empresas}
                            />
                        </div>

                        <div className="form-group md:col-span-2">
                            <label className="form-label">Nome Completo</label>
                            <input type="text" name="nome" required className="form-input" value={formData.nome} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">CPF</label>
                            <input type="text" name="cpf" required className="form-input" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">RG</label>
                            <input type="text" name="rg" className="form-input" value={formData.rg} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Data de Nascimento</label>
                            <input type="date" name="data_nascimento" className="form-input" value={formData.data_nascimento} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Sexo</label>
                            <select name="sexo" className="form-select" value={formData.sexo} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Data de Admissão</label>
                            <input type="date" name="data_admissao" required className="form-input" value={formData.data_admissao} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <Select
                                label="Cargo"
                                name="cargo_id"
                                value={formData.cargo_id}
                                onChange={handleChange}
                                options={cargos}
                            />
                        </div>

                        <div className="form-group">
                            <Select
                                label="GHE"
                                name="ghe_id"
                                value={formData.ghe_id}
                                onChange={handleChange}
                                options={ghe}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Link href="/funcionarios">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" isLoading={loading}>
                            Salvar Funcionário
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
