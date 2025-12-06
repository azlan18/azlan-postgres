import { Database, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Column {
    name: string;
    type: string;
}

export interface TableInfo {
    name: string;
    columns: Column[];
    rows?: any[];
    foreign_keys?: any[];
}

interface SidebarProps {
    onSelectTable: (tableName: string) => void;
    tables: TableInfo[];
    loading: boolean;
    error: string | null;
}

export function Sidebar({ onSelectTable, tables, loading, error }: SidebarProps) {

    return (
        <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
            <div className="p-4 border-b border-sidebar-border bg-sidebar">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-sidebar-foreground">
                    <Database className="w-5 h-5 text-primary" />
                    SQL Playground
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Connected to azlan-db</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading && (
                    <div className="flex items-center justify-center p-4 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading schema...
                    </div>
                )}

                {error && (
                    <div className="p-4 text-destructive text-sm bg-destructive/10 rounded-md">
                        Error: {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                            Available Tables ({tables.length})
                        </h3>
                        {tables.map((table) => (
                            <div key={table.name} className="space-y-2">
                                <div
                                    className="flex items-center justify-between px-2 py-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded cursor-pointer group transition-colors"
                                    onClick={() => onSelectTable(table.name)}
                                >
                                    <span className="font-medium text-sm text-sidebar-foreground group-hover:text-primary">{table.name}</span>
                                    <Badge variant="outline" className="text-[10px] h-5 bg-background text-muted-foreground">
                                        {table.columns.length} cols
                                    </Badge>
                                </div>

                                {/* Mini Table Preview */}
                                <div className="border border-border rounded-md overflow-hidden bg-card shadow-sm mx-1">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-[10px] text-left">
                                            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                                <tr>
                                                    {table.columns.map((col) => (
                                                        <th key={col.name} className="px-2 py-1 whitespace-nowrap">
                                                            {col.name}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {table.rows && table.rows.length > 0 ? (
                                                    table.rows.map((row, i) => (
                                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                            {table.columns.map((col) => (
                                                                <td key={`${i}-${col.name}`} className="px-2 py-1 whitespace-nowrap text-card-foreground">
                                                                    {row[col.name] === null ? <span className="text-muted-foreground opacity-50">NULL</span> : String(row[col.name])}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={table.columns.length} className="px-2 py-2 text-center text-muted-foreground italic">
                                                            No data
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
