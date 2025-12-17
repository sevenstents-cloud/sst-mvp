interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { id: string; label: string }[];
    error?: string;
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
    return (
        <div className={`form-group ${className}`}>
            <label className="form-label" htmlFor={props.id || props.name}>
                {label}
            </label>
            <select
                className={`form-select ${error ? 'border-destructive' : ''}`}
                {...props}
            >
                <option value="">Selecione...</option>
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className="text-xs text-destructive mt-1 block">{error}</span>}
        </div>
    );
}
