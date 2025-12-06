import { Play, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { motion } from "framer-motion";

interface QueryEditorProps {
    query: string;
    onQueryChange: (query: string) => void;
    onRunQuery: () => void;
    isExecuting: boolean;
}

export function QueryEditor({ query, onQueryChange, onRunQuery, isExecuting }: QueryEditorProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            onRunQuery();
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-2 border-b border-border flex items-center justify-between bg-card">
                <div className="text-sm font-medium text-card-foreground px-2">SQL Editor</div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQueryChange("")}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Eraser className="w-4 h-4 mr-2" />
                        Clear
                    </Button>
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            size="sm"
                            onClick={onRunQuery}
                            disabled={isExecuting || !query.trim()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                        >
                            {isExecuting ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center"
                                >
                                    Running...
                                </motion.div>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Run Query
                                </>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </div>
            <div className="flex-1 p-0 relative overflow-hidden" onKeyDown={handleKeyDown}>
                <CodeMirror
                    value={query}
                    height="100%"
                    theme="none"
                    extensions={[sql()]}
                    onChange={(value) => onQueryChange(value)}
                    className="h-full text-sm font-mono"
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        history: true,
                        foldGutter: true,
                        drawSelection: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        syntaxHighlighting: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        defaultKeymap: true,
                        searchKeymap: true,
                        historyKeymap: true,
                        foldKeymap: true,
                        completionKeymap: true,
                        lintKeymap: true,
                    }}
                />
                <div className="absolute bottom-2 right-4 text-xs text-muted-foreground pointer-events-none z-10 bg-background/80 px-2 rounded border border-border">
                    Cmd + Enter to run
                </div>
            </div>
        </div>
    );
}
