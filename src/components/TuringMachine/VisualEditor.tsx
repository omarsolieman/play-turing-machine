import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TuringMachineConfig, TuringMachineState, TransitionRule } from '@/types/turing-machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trash2, Edit, Plus } from 'lucide-react';

interface VisualEditorProps {
  config: TuringMachineConfig;
  onConfigChange: (config: TuringMachineConfig) => void;
}

const VisualEditorComponent: React.FC<VisualEditorProps> = ({ config, onConfigChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [sourceNodeForTransition, setSourceNodeForTransition] = useState<Node | null>(null);

  useEffect(() => {
    const newNodes: Node[] = config.states.map((state, index) => ({
      id: state.name,
      type: 'default',
      data: { label: state.name },
      position: { x: 100 + (index % 4) * 200, y: 100 + Math.floor(index / 4) * 150 },
      style: {
        background: state.isAccept ? '#4CAF50' : state.isReject ? '#F44336' : '#2196F3',
        color: 'white',
        border: config.initialState === state.name ? '3px solid #FFC107' : sourceNodeForTransition?.id === state.name ? '3px solid #00BFFF' : 'none',
        borderRadius: '50%',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }));

    const newEdges: Edge[] = [];
    const transitionCounts: { [key: string]: number } = {};

    config.transitions.forEach((rule) => {
      const source = rule.currentState;
      const target = rule.nextState;
      const key = `${source}-${target}`;
      transitionCounts[key] = (transitionCounts[key] || 0) + 1;
    });

    const processedTransitions: { [key: string]: number } = {};

    config.transitions.forEach((rule, index) => {
      const source = rule.currentState;
      const target = rule.nextState;
      const key = `${source}-${target}`;
      const total = transitionCounts[key];
      processedTransitions[key] = (processedTransitions[key] || 0) + 1;
      const count = processedTransitions[key];

      const isLoop = source === target;
      const label = `${rule.readSymbol} -> ${rule.writeSymbol}, ${rule.moveDirection}`;

      if (isLoop) {
        newEdges.push({
          id: `e-${source}-${target}-${index}`,
          source,
          target,
          label,
          type: 'selfconnecting',
          data: {
            label,
          },
        });
      } else if (total > 1) {
        const curve = (count - (total + 1) / 2) * 0.5;
        newEdges.push({
          id: `e-${source}-${target}-${index}`,
          source,
          target,
          label,
          type: 'floating',
          data: {
            label,
          },
        });
      } else {
        newEdges.push({
          id: `e-${source}-${target}-${index}`,
          source,
          target,
          label,
          animated: true,
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [config, setNodes, setEdges, sourceNodeForTransition]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);

    if (!sourceNodeForTransition) {
      setSourceNodeForTransition(node);
    } else {
      const newRule: TransitionRule = {
        currentState: sourceNodeForTransition.id,
        readSymbol: ' ',
        nextState: node.id,
        writeSymbol: ' ',
        moveDirection: 'R',
      };
      const newConfig = {
        ...config,
        transitions: [...config.transitions, newRule],
      };
      onConfigChange(newConfig);
      setSourceNodeForTransition(null);
    }
  };

  const onPaneClick = () => {
    setSourceNodeForTransition(null);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const handleAddState = () => {
    const newStateName = `q${config.states.length}`;
    const newState: TuringMachineState = { name: newStateName };
    const newConfig = {
      ...config,
      states: [...config.states, newState],
    };
    onConfigChange(newConfig);
  };

  const handleDeleteNode = (nodeId: string) => {
    const newConfig = {
      ...config,
      states: config.states.filter(s => s.name !== nodeId),
      transitions: config.transitions.filter(t => t.currentState !== nodeId && t.nextState !== nodeId),
    };
    onConfigChange(newConfig);
  };

  const handleDeleteEdge = (edgeId: string) => {
    // This is a simplified example. You'll need a way to map edgeId back to a specific transition rule.
    // For now, let's assume the edge id is the index.
    const edgeIndex = parseInt(edgeId.split('-').pop() || '0', 10);
    const newTransitions = [...config.transitions];
    newTransitions.splice(edgeIndex, 1);
    const newConfig = {
      ...config,
      transitions: newTransitions,
    };
    onConfigChange(newConfig);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-4 flex gap-2">
        <Button onClick={handleAddState} size="sm"><Plus className="mr-2 h-4 w-4" /> Add State</Button>
        {selectedNode && (
          <Button variant="destructive" size="sm" onClick={() => handleDeleteNode(selectedNode.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete State
          </Button>
        )}
        {selectedEdge && (
          <Button variant="destructive" size="sm" onClick={() => handleDeleteEdge(selectedEdge.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Transition
          </Button>
        )}
      </div>
      <div className="flex-grow w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={(_, edge) => setSelectedEdge(edge)}
          onPaneClick={onPaneClick}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export const VisualEditor: React.FC<VisualEditorProps> = (props) => (
  <ReactFlowProvider>
    <VisualEditorComponent {...props} />
  </ReactFlowProvider>
);