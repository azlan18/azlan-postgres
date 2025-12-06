import { useEffect, useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Column {
    name: string;
    type: string;
}

interface TableInfo {
    name: string;
    columns: Column[];
    rows?: any[];
}

interface SidebarProps {
    onSelectTable: (tableName: string) => void;
    refreshTrigger?: number;
}

export function Sidebar({ onSelectTable, refreshTrigger }: SidebarProps) {
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:8000/tables")
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ detail: "Unknown error" }));
                    throw new Error(errData.detail || "Failed to fetch tables");
                }
                return res.json();
            })
            .then((data) => {
                setTables(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching tables:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [refreshTrigger]); // Re-fetch when trigger changes

    return (
        <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
            <div className="p-4 border-b border-sidebar-border bg-sidebar">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-sidebar-foreground">
                    <Database className="w-5 h-5 text-primary" />
                    SQL Playground
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Connected to azlan-db</p>
            </div>

            <ScrollArea className="flex-1 p-4">
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
                                        <table className="w-full text-[10px] text-left">
                                            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                                <tr>
                                                    {table.columns.slice(0, 3).map((col) => (
                                                        <th key={col.name} className="px-2 py-1 whitespace-nowrap">
                                                            {col.name}
                                                        </th>
                                                    ))}
                                                    {table.columns.length > 3 && <th className="px-2 py-1">...</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {table.rows && table.rows.length > 0 ? (
                                                    table.rows.map((row, i) => (
                                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                            {table.columns.slice(0, 3).map((col) => (
                                                                <td key={`${i}-${col.name}`} className="px-2 py-1 whitespace-nowrap text-card-foreground truncate max-w-[80px]">
                                                                    {row[col.name] === null ? <span className="text-muted-foreground opacity-50">NULL</span> : String(row[col.name])}
                                                                </td>
                                                            ))}
                                                            {table.columns.length > 3 && <td className="px-2 py-1 text-muted-foreground">...</td>}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={Math.min(table.columns.length, 4)} className="px-2 py-2 text-center text-muted-foreground italic">
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
            </ScrollArea>
        </div>
    );
}
