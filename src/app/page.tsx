import Link from 'next/link';
import styles from './page.module.css';
import { UserNav } from '@/components/layout/UserNav';
import {
  Building2,
  MapPin,
  Layers,
  Briefcase,
  Users,
  Stethoscope,
  AlertTriangle,
  FileText,
  ClipboardList,
  FileCheck,
  CheckSquare
} from 'lucide-react';

const modules = [
  { name: 'Empresas', href: '/empresas', icon: Building2, desc: 'Gerenciar empresas clientes' },
  { name: 'Locais de Trabalho', href: '/locais', icon: MapPin, desc: 'Gerenciar unidades e locais' },
  { name: 'Setores', href: '/setores', icon: Layers, desc: 'Gerenciar setores e ambientes' },
  { name: 'Cargos', href: '/cargos', icon: Briefcase, desc: 'Gerenciar cargos e funções' },
  { name: 'GHE', href: '/ghe', icon: Users, desc: 'Grupos Homogêneos de Exposição' },
  { name: 'Funcionários', href: '/funcionarios', icon: Users, desc: 'Cadastro de funcionários' },
  { name: 'Catálogo de Exames', href: '/exames', icon: Stethoscope, desc: 'Gerenciar exames disponíveis' },
  { name: 'Catálogo de Riscos', href: '/riscos', icon: AlertTriangle, desc: 'Gerenciar agentes de risco' },
  { name: 'Documentos SST', href: '/documentos', icon: FileText, desc: 'PGR, PCMSO e outros docs' },
  { name: 'Protocolos PCMSO', href: '/protocolos', icon: ClipboardList, desc: 'Definir exames por GHE' },
  { name: 'Exames Realizados / ASO', href: '/asos', icon: FileCheck, desc: 'Emissão de ASO e histórico' },
  { name: 'Planos de Ação', href: '/planos', icon: CheckSquare, desc: 'Gerenciar ações corretivas' },
];

export default function Home() {
  return (
    <main className={`container ${styles.main}`}>
      <header className={`${styles.header} flex flex-col md:flex-row justify-between items-center gap-4`}>
        <div className="text-center md:text-left">
          <h1 className={styles.title}>SST Platform</h1>
          <p className={styles.subtitle}>
            Sistema de Gestão de Segurança e Saúde no Trabalho.
          </p>
        </div>
        <UserNav />
      </header>

      <div className={styles.grid}>
        {modules.map((module) => (
          <Link href={module.href} key={module.href} className={styles.cardLink}>
            <div className={`card ${styles.cardContent}`}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <module.icon size={24} />
                </div>
                <h2 className={styles.cardTitle}>{module.name}</h2>
              </div>
              <p className={styles.cardDescription}>{module.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
