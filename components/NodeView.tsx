import React from 'react';
import { SceneNode } from '@/lib/data/SceneNode';

export default function NodeView({ 
    node, 
    clickCallback, 
    selectedNode 
} : { 
    node: SceneNode, 
    clickCallback: (node: SceneNode) => void 
    selectedNode?: SceneNode
}) {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className='ml-4'>
            <div className='flex flex-row gap-1'>
                <button onClick={handleToggle} style={{ cursor: 'pointer' }}>
                    {isOpen ? '▼' : '▶'}
                </button>
                <button className={`${selectedNode == node ? 'text-blue-500' : ''}`} onClick={() => {clickCallback(node)}}>{node.name}</button>
            </div>
            
            {isOpen && (
                <div>
                    {node.children.map(child => (
                        <NodeView key={node.id} node={child} clickCallback={clickCallback} selectedNode={selectedNode} />
                    ))}
                </div>
            )}
        </div>
    );
};