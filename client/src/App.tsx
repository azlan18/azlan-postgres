import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sidebar, type TableInfo } from "@/components/Sidebar";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsTable } from "@/components/ResultsTable";
import { SchemaVisualizer } from "@/components/SchemaVisualizer";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

function App() {
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10;");
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Table state lifted from Sidebar
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);

  useEffect(() => {
    setTablesLoading(true);
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
        setTablesLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching tables:", err);
        setTablesError(err.message);
        setTablesLoading(false);
      });
  }, [refreshTrigger]);

  const handleRunQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    setError(null);
    setResults(null);
    setExecutionTime(undefined);

    const startTime = performance.now();

    try {
      const response = await fetch("http://localhost:8000/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      if (!response.ok) {
        throw new Error(data.detail || "Failed to execute query");
      }

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }

      // Trigger sidebar refresh on successful query
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectTable = (tableName: string) => {
    const newQuery = `SELECT * FROM ${tableName} LIMIT 100;`;
    setQuery(newQuery);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
        {/* Header / Toolbar */}
        <div className="h-12 border-b flex items-center justify-between px-4 bg-card">
          <div className="font-semibold text-sm">SQL Playground</div>
          <ModeToggle />
        </div>

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-sidebar">
              <Sidebar
                onSelectTable={handleSelectTable}
                tables={tables}
                loading={tablesLoading}
                error={tablesError}
              />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={50}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={50} minSize={30}>
                  <QueryEditor
                    query={query}
                    onQueryChange={setQuery}
                    onRunQuery={handleRunQuery}
                    isExecuting={isExecuting}
                  />
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={50} minSize={30}>
                  <ResultsTable
                    results={results}
                    error={error}
                    executionTime={executionTime}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={30} minSize={20} collapsible={true} collapsedSize={0}>
              <div className="h-full border-l border-border bg-background">
                <div className="p-2 border-b border-border bg-card text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Schema Visualization
                </div>
                <SchemaVisualizer tables={tables} />
              </div>
            </ResizablePanel>

          </ResizablePanelGroup>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
