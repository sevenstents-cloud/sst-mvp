interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className={`form-group ${className}`}>
            <label className="form-label" htmlFor={props.id || props.name}>
                {label}
            </label>
            <input
                className={`form-input ${error ? 'border-destructive' : ''}`}
                {...props}
            />
            {error && <span className="text-xs text-destructive mt-1 block">{error}</span>}
        </div>
    );
}
