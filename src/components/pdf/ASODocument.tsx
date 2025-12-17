import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a font (optional, using standard fonts for now for simplicity/speed reliability)
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
    },
    header: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 10,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#eee',
        padding: 4,
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 100,
        fontWeight: 'bold',
        fontSize: 9,
        color: '#555',
    },
    value: {
        flex: 1,
        fontSize: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#888',
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    signatureBlock: {
        alignItems: 'center',
        width: '40%',
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 5,
    },
});

interface ASOProps {
    funcionario: any;
    empresa: any;
    exame: any;
    exameRealizado: any;
    riscos: any[];
    medico: any; // Se houver cadastro de médico coordenador
}

export const ASODocument = ({ funcionario, empresa, exame, exameRealizado, riscos }: ASOProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Atestado de Saúde Ocupacional</Text>
                    <Text style={{ fontSize: 12, textAlign: 'center' }}>ASO</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9 }}>Nr. Controle: {exameRealizado.id.slice(0, 8)}</Text>
                </View>
            </View>

            {/* Identificação do Funcionário */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Identificação do Trabalhador</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nome:</Text>
                    <Text style={styles.value}>{funcionario.nome_completo}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>CPF:</Text>
                    <Text style={styles.value}>{funcionario.cpf}</Text>
                    <Text style={styles.label}>Data Nasc:</Text>
                    <Text style={styles.value}>{new Date(funcionario.data_nascimento).toLocaleDateString()}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Cargo/Função:</Text>
                    <Text style={styles.value}>{funcionario.cargo?.nome_cargo}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Setor/GHE:</Text>
                    <Text style={styles.value}>{funcionario.ghe?.nome_ghe} (Cod: {funcionario.ghe?.codigo_ghe})</Text>
                </View>
            </View>

            {/* Identificação da Empresa */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Identificação da Empresa</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Razão Social:</Text>
                    <Text style={styles.value}>{empresa.razao_social}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>CNPJ:</Text>
                    <Text style={styles.value}>{empresa.cnpj}</Text>
                </View>
            </View>

            {/* Riscos Ocupacionais */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Riscos Ocupacionais Específicos</Text>
                {riscos && riscos.length > 0 ? (
                    riscos.map((risco, idx) => (
                        <View key={idx} style={styles.row}>
                            <Text style={{ width: 80, fontSize: 9 }}>{risco.categoria}:</Text>
                            <Text style={styles.value}>{risco.nome_agente}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontSize: 9, fontStyle: 'italic', padding: 5 }}>Ausência de riscos ocupacionais específicos.</Text>
                )}
            </View>

            {/* Procedimentos Médicos */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Procedimentos Médicos Realizados</Text>
                <View style={styles.row}>
                    <Text style={{ width: '50%', fontWeight: 'bold', fontSize: 9 }}>Exame</Text>
                    <Text style={{ width: '25%', fontWeight: 'bold', fontSize: 9 }}>Data</Text>
                    <Text style={{ width: '25%', fontWeight: 'bold', fontSize: 9 }}>Resultado</Text>
                </View>
                <View style={styles.row}>
                    <Text style={{ width: '50%', fontSize: 9 }}>{exame.nome_exame} ({exameRealizado.tipo_exame || 'Clínico'})</Text>
                    <Text style={{ width: '25%', fontSize: 9 }}>{new Date(exameRealizado.data_realizacao).toLocaleDateString()}</Text>
                    <Text style={{ width: '25%', fontSize: 9 }}>{exameRealizado.resultado || 'Não Informado'}</Text>
                </View>
            </View>

            {/* Conclusão */}
            <View style={{ ...styles.section, marginTop: 10, borderColor: '#000', borderWidth: 2 }}>
                <Text style={{ ...styles.sectionTitle, backgroundColor: '#ddd', textAlign: 'center', fontSize: 12 }}>5. Conclusão Médica</Text>
                <View style={{ padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
                        {exameRealizado.resultado === 'APTO' ? 'APTO' : 'INAPTO'}
                    </Text>
                    <Text style={{ marginTop: 5, fontSize: 10 }}>Para a função específica</Text>
                </View>
            </View>

            {/* Assinaturas */}
            <View style={styles.signatureRow}>
                <View style={styles.signatureBlock}>
                    <Text>{exameRealizado.medico_responsavel}</Text>
                    <Text style={{ fontSize: 8 }}>Médico Examinador</Text>
                    <Text style={{ fontSize: 8 }}>CRM: {exameRealizado.crm_medico}</Text>
                </View>
                <View style={styles.signatureBlock}>
                    <Text> </Text>
                    <Text style={{ fontSize: 8 }}>Assinatura do Trabalhador</Text>
                    <Text style={{ fontSize: 8 }}>{funcionario.nome_completo}</Text>
                </View>
            </View>

            <Text style={styles.footer}>
                Documento gerado eletronicamente pelo Sistema SST Platform em {new Date().toLocaleDateString()}.
            </Text>

        </Page>
    </Document>
);
