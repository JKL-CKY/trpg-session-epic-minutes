import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

const CustomNode = ({ data }) => {
  const nodeTypeIcons = {
    location: '📍',
    event: '⚔️',
    npc: '👤'
  };

  return (
    <div className={`react-flow__node-custom ${data.type}`}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
        {nodeTypeIcons[data.type] || '📌'}
      </div>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode
};

function StoryMap({ nodes, edges, onNodesChange, onEdgesChange }) {
  const [nodeType, setNodeType] = useState('location');

  const handleNodesChange = useCallback(
    (changes) => onNodesChange(applyNodeChanges(changes, nodes)),
    [nodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => onEdgesChange(applyEdgeChanges(changes, edges)),
    [edges, onEdgesChange]
  );

  const handleConnect = useCallback(
    (params) => onEdgesChange(addEdge(params, edges)),
    [edges, onEdgesChange]
  );

  const addNode = () => {
    const labels = {
      location: '新地点',
      event: '新事件',
      npc: '新NPC'
    };

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: labels[nodeType] || '新节点',
        type: nodeType,
        description: ''
      }
    };
    onNodesChange([...nodes, newNode]);
  };

  const nodeTypeLabels = {
    location: '📍 地点',
    event: '⚔️ 事件',
    npc: '👤 NPC'
  };

  return (
    <div>
      <div className="section-header">
        <h2>剧情地图</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="info-badge info">{nodes.length} 个节点</span>
          <span className="info-badge warning">{edges.length} 条连接</span>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#e0e0e0', fontWeight: '500' }}>节点类型：</label>
        <select
          value={nodeType}
          onChange={(e) => setNodeType(e.target.value)}
          className="node-type-select"
        >
          <option value="location">📍 地点</option>
          <option value="event">⚔️ 事件</option>
          <option value="npc">👤 NPC</option>
        </select>
        
        <button onClick={addNode} className="add-node-btn">
          ➕ 添加节点
        </button>
        
        <span style={{ color: '#a0a0a0', fontSize: '0.9rem', marginLeft: 'auto' }}>
          💡 拖拽节点移动位置，点击节点底部圆点连接其他节点
        </span>
      </div>
      
      <div className="story-map-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data.type) {
                case 'location': return '#3498db';
                case 'event': return '#e74c3c';
                case 'npc': return '#9b59b6';
                default: return '#ffd700';
              }
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px'
            }}
          />
          <Controls 
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px'
            }}
          />
          <Background color="#333" gap={20} />
        </ReactFlow>
      </div>
      
      <div className="nodes-list">
        <h3>📋 节点列表</h3>
        {nodes.length === 0 ? (
          <p style={{ color: '#a0a0a0', padding: '20px 0' }}>暂无节点，请添加地点、事件或NPC来构建你的剧情地图</p>
        ) : (
          <ul>
            {nodes.map(node => (
              <li key={node.id}>
                <span className="node-type-icon">
                  {node.data.type === 'location' && '📍'}
                  {node.data.type === 'event' && '⚔️'}
                  {node.data.type === 'npc' && '👤'}
                </span>
                <span style={{ flex: 1 }}>
                  <strong>{node.data.label}</strong>
                  <span style={{ color: '#a0a0a0', marginLeft: '10px', fontSize: '0.85rem' }}>
                    ({nodeTypeLabels[node.data.type] || node.data.type})
                  </span>
                </span>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>
                  ID: {node.id}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default StoryMap;
