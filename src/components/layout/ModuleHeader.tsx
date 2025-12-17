import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ModuleHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    backLink?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionLink?: string;
}

export function ModuleHeader({
    title,
    subtitle,
    icon: Icon,
    backLink,
    actionLabel,
    onAction,
    actionLink
}: ModuleHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 fade-in">
            <div className="flex items-center gap-4">
                {backLink && (
                    <Link href={backLink} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                )}
                {Icon && (
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Icon size={28} />
                    </div>
                )}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
                </div>
            </div>

            <div className="flex gap-2">
                {actionLabel && actionLink && (
                    <Link href={actionLink} className="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        {actionLabel}
                    </Link>
                )}
                {actionLabel && onAction && (
                    <button onClick={onAction} className="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
