import { useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    MiniMap,
    Position,
    useEdgesState,
    useNodesState,
    type Node,
    type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { useTheme } from '@/components/theme-provider';
import { AnimatedSvgEdge } from './AnimatedSvgEdge';

interface Column {
    name: string;
    type: string;
}

interface ForeignKey {
    constrained_columns: string[];
    referred_table: string;
    referred_columns: string[];
}

interface TableData {
    name: string;
    columns: Column[];
    foreign_keys?: ForeignKey[];
}

interface SchemaVisualizerProps {
    tables: TableData[];
}

const TableNode = ({ data }: { data: TableData }) => {
    return (
        <div className="border rounded-md bg-card text-card-foreground min-w-[180px] shadow-sm">
            <div className="p-2 border-b font-bold bg-muted/50 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {data.name}
            </div>
            <div className="p-2 space-y-1">
                {data.columns.map((col) => (
                    <div key={col.name} className="flex justify-between text-xs items-center group">
                        <span className="font-mono text-foreground/80 group-hover:text-foreground transition-colors">{col.name}</span>
                        <span className="text-muted-foreground text-[10px]">{col.type}</span>
                    </div>
                ))}
            </div>
            <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
            <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
        </div>
    );
};

const nodeTypes = {
    table: TableNode,
};

const edgeTypes = {
    animatedSvgEdge: AnimatedSvgEdge,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 200;
    const nodeHeight = 200; // Approximate

    dagreGraph.setGraph({ rankdir: 'LR' });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

export function SchemaVisualizer({ tables }: SchemaVisualizerProps) {
    const { theme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (!tables.length) return;

        const initialNodes: Node[] = tables.map((table) => ({
            id: table.name,
            type: 'table',
            data: table,
            position: { x: 0, y: 0 },
        }));

        const initialEdges: Edge[] = [];
        tables.forEach((table) => {
            if (table.foreign_keys) {
                table.foreign_keys.forEach((fk) => {
                    initialEdges.push({
                        id: `${table.name}-${fk.referred_table}`,
                        source: table.name,
                        target: fk.referred_table,
                        type: 'animatedSvgEdge', // Changed to custom edge type
                        animated: true,
                        style: { stroke: 'hsl(var(--primary))' },
                        // markerEnd: { // Removed markerEnd as it's handled by custom edge
                        //     type: MarkerType.ArrowClosed,
                        //     color: 'hsl(var(--primary))',
                        // },
                    });
                });
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [tables, setNodes, setEdges]);

    return (
        <div className="h-full w-full bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes} // Added edgeTypes prop
                fitView
                className={theme === 'dark' ? 'dark' : ''}
            >
                <Background color={theme === 'dark' ? '#333' : '#ddd'} gap={16} />
                <Controls className="!bg-card !border-border !text-card-foreground" />
                <MiniMap
                    nodeColor={theme === 'dark' ? '#333' : '#eee'}
                    maskColor={theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)'}
                    className="!bg-card !border-border"
                />
            </ReactFlow>
        </div>
    );
}
