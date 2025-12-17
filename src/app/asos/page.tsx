'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Table } from '@/components/ui/Table';
import { FileCheck, Pencil, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ASODocument } from '@/components/pdf/ASODocument';

interface ExameRealizado {
    id: string;
    data_realizacao: string;
    resultado: string;
    tipo_exame: string; // Not in DB but useful context if added to protocols or hardcoded
    funcionario: {
        id: string;
        nome_completo: string;
        cpf: string;
        data_nascimento: string;
        cargo: { nome_cargo: string };
        ghe: { nome_ghe: string; codigo_ghe: string };
        empresa: { razao_social: string; cnpj: string };
    };
    exame: { nome_exame: string };
    medico_responsavel: string;
    crm_medico: string;
}

export default function ASOsPage() {
    const [exames, setExames] = useState<ExameRealizado[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExames();
    }, []);

    async function fetchExames() {
        setLoading(true);

        // 1. Fetch exames realizados (raw data with foreign keys)
        const { data: examesRealizadosData, error: examesError } = await supabase
            .from('exames_realizados')
            .select(`
                id, 
                data_realizacao, 
                resultado,
                medico_responsavel,
                crm_medico,
                funcionario_id,
                exame_id
            `)
            .order('data_realizacao', { ascending: false });

        if (examesError) {
            console.error('Erro ao buscar exames realizados:', JSON.stringify(examesError, null, 2));
            alert('Erro ao buscar exames: ' + examesError.message);
            setLoading(false);
            return;
        }

        if (!examesRealizadosData || examesRealizadosData.length === 0) {
            setExames([]);
            setLoading(false);
            return;
        }

        // 2. Extract IDs to fetch related data
        // @ts-ignore
        const funcionarioIds = Array.from(new Set(examesRealizadosData.map(e => e.funcionario_id).filter(Boolean)));
        // @ts-ignore
        const exameIds = Array.from(new Set(examesRealizadosData.map(e => e.exame_id).filter(Boolean)));

        // 3. Fetch Funcionarios (with their relations)
        const { data: funcionariosData, error: funcError } = await supabase
            .from('funcionarios')
            .select(`
                id,
                nome_completo,
                cpf,
                data_nascimento,
                cargo:cargos(nome_cargo),
                ghe:ghe(nome_ghe, codigo_ghe),
                empresa:empresas(razao_social, cnpj)
            `)
            .in('id', funcionarioIds);

        if (funcError) {
            console.error('Erro ao buscar detalhes dos funcionários:', funcError);
        }

        // 4. Fetch Catalogo de Exames
        const { data: catalogoData, error: catError } = await supabase
            .from('catalogo_exames')
            .select('id, nome_exame')
            .in('id', exameIds);

        if (catError) {
            console.error('Erro ao buscar detalhes dos exames:', catError);
        }

        // 5. Manual Join
        const funcionariosMap = new Map((funcionariosData || []).map((f: any) => [f.id, f]));
        const catalogoMap = new Map((catalogoData || []).map((c: any) => [c.id, c]));

        const joinedData = examesRealizadosData.map((item: any) => {
            const func = funcionariosMap.get(item.funcionario_id);
            const ex = catalogoMap.get(item.exame_id);

            // Safely handle missing relations if any
            if (!func) return null;

            return {
                id: item.id,
                data_realizacao: item.data_realizacao,
                resultado: item.resultado,
                medico_responsavel: item.medico_responsavel,
                crm_medico: item.crm_medico,
                tipo_exame: '', // Placeholder
                funcionario: {
                    id: func.id,
                    nome_completo: func.nome_completo,
                    cpf: func.cpf,
                    data_nascimento: func.data_nascimento,
                    cargo: func.cargo,
                    ghe: func.ghe,
                    empresa: func.empresa
                },
                exame: ex ? { nome_exame: ex.nome_exame } : { nome_exame: 'Exame Desconhecido' }
            };
        }).filter(Boolean); // Remove items where funcionario was not found

        // @ts-ignore
        setExames(joinedData);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este registro de exame?')) return;

        const { error } = await supabase
            .from('exames_realizados')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir exame');
        } else {
            fetchExames();
        }
    }

    return (
        <main className="container py-8 fade-in">
            <ModuleHeader
                title="Exames Realizados & ASO"
                subtitle="Emissão de Atestados de Saúde Ocupacional"
                icon={FileCheck}
                backLink="/"
                actionLabel="Registrar Novo Exame"
                actionLink="/asos/novo"
            />

            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : (
                    <Table
                        data={exames}
                        columns={[
                            { header: 'Funcionário', cell: (item) => item.funcionario?.nome_completo },
                            { header: 'Exame', cell: (item) => item.exame?.nome_exame },
                            { header: 'Data', cell: (item) => new Date(item.data_realizacao).toLocaleDateString('pt-BR') },
                            { header: 'Resultado', accessorKey: 'resultado' },
                        ]}
                        actions={(item) => (
                            <>
                                <PDFDownloadLink
                                    document={
                                        <ASODocument
                                            funcionario={item.funcionario}
                                            empresa={item.funcionario.empresa}
                                            exame={item.exame}
                                            exameRealizado={item}
                                            riscos={[]} // Idealmente buscaria os riscos do GHE do funcionário aqui
                                            medico={null}
                                        />
                                    }
                                    fileName={`ASO_${item.funcionario.nome_completo}_${item.data_realizacao}.pdf`}
                                    className="btn btn-secondary p-2 h-auto"
                                >
                                    <Download size={16} />
                                </PDFDownloadLink>

                                <Link href={`/asos/${item.id}`} className="btn btn-outline p-2 h-auto" title="Editar">
                                    <Pencil size={16} />
                                </Link>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="btn btn-destructive p-2 h-auto"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    />
                )}
            </div>
        </main>
    );
}
