import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Clock, Database } from "lucide-react";
import { motion } from "framer-motion";

interface ResultsTableProps {
    results: any[] | null;
    error: string | null;
    executionTime?: number;
}

export function ResultsTable({ results, error, executionTime }: ResultsTableProps) {
    if (error) {
        return (
            <div className="h-full p-4 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <h3 className="font-semibold text-sm">Execution Error</h3>
                        <p className="text-sm font-mono whitespace-pre-wrap">{error}</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                <Database className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Run a query to see results</p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="h-full flex flex-col p-4 bg-background">
                {executionTime !== undefined && (
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Executed in {executionTime.toFixed(2)}ms
                    </div>
                )}
                <div className="flex-1 flex items-center justify-center text-muted-foreground border rounded-lg bg-card border-dashed">
                    <p className="text-sm">Query executed successfully. No rows returned.</p>
                </div>
            </div>
        );
    }

    const columns = Object.keys(results[0]);

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-2 border-b bg-card flex items-center justify-between">
                <div className="text-sm font-medium text-card-foreground px-2">Query Results</div>
                {executionTime !== undefined && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 px-2">
                        <Clock className="w-3 h-3" />
                        {executionTime.toFixed(2)}ms
                    </div>
                )}
            </div>
            <ScrollArea className="flex-1">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="min-w-max"
                >
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow className="hover:bg-transparent border-b border-border">
                                {columns.map((col, i) => (
                                    <TableHead
                                        key={col}
                                        className={`h-9 px-4 text-xs font-semibold text-muted-foreground border-border ${i !== columns.length - 1 ? 'border-r' : ''}`}
                                    >
                                        {col}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((row, i) => (
                                <TableRow key={i} className="hover:bg-muted/50 border-b border-border group">
                                    {columns.map((col, j) => (
                                        <TableCell
                                            key={`${i}-${col}`}
                                            className={`py-2 px-4 text-sm text-card-foreground border-border ${j !== columns.length - 1 ? 'border-r' : ''}`}
                                        >
                                            {row[col] === null ? (
                                                <span className="text-muted-foreground opacity-50 italic">NULL</span>
                                            ) : (
                                                String(row[col])
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </motion.div>
            </ScrollArea>
        </div>
    );
}
