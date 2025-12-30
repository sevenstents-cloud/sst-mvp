'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Building2, MapPin, Layers, Briefcase, Users, Stethoscope,
    AlertTriangle, FileText, ClipboardList, FileCheck, CheckSquare,
    LayoutDashboard, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Empresas', href: '/empresas', icon: Building2 },
    { name: 'Locais', href: '/locais', icon: MapPin },
    { name: 'Setores', href: '/setores', icon: Layers },
    { name: 'Cargos', href: '/cargos', icon: Briefcase },
    { name: 'GHE', href: '/ghe', icon: Users },
    { name: 'Funcionários', href: '/funcionarios', icon: Users },
    { name: 'Exames', href: '/exames', icon: Stethoscope },
    { name: 'Riscos', href: '/riscos', icon: AlertTriangle },
    { name: 'Documentos', href: '/documentos', icon: FileText },
    { name: 'Protocolos', href: '/protocolos', icon: ClipboardList },
    { name: 'ASO / Realizados', href: '/asos', icon: FileCheck },
    { name: 'Planos de Ação', href: '/planos', icon: CheckSquare },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md text-foreground"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen w-64 transition-transform duration-300 ease-in-out
                bg-white/80 backdrop-blur-md border-r border-gray-200
                lg:translate-x-0 lg:static lg:h-auto lg:min-h-screen lg:bg-transparent lg:border-r-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col p-4 glass-panel m-0 lg:m-4 lg:h-[calc(100vh-2rem)] rounded-xl overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                            SST
                        </div>
                        <span className="font-bold text-xl tracking-tight">SST Platform</span>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-md translate-x-1'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                    `}
                                >
                                    <item.icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-gray-200/50">
                        <p className="text-xs text-gray-500 text-center">
                            v1.0.0
                        </p>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
