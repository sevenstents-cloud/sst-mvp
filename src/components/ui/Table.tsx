import { Action } from "@radix-ui/react-toast";

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: (item: T) => React.ReactNode;
}

export function Table<T extends { id: string }>({ columns, data, actions }: TableProps<T>) {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx}>{col.header}</th>
                        ))}
                        {actions && <th className="w-24 text-center">Ações</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                                Nenhum registro encontrado.
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr key={item.id}>
                                {columns.map((col, idx) => (
                                    <td key={idx}>
                                        {col.cell
                                            ? col.cell(item)
                                            : (col.accessorKey ? String(item[col.accessorKey]) : '')}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {actions(item)}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
