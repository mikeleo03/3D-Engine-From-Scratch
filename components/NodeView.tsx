import React from 'react';
import { SceneNode } from '@/lib/data/SceneNode';

export default function NodeView({ node, clickCallback } : { node: SceneNode, clickCallback: (node: SceneNode) => void }) {
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
                <button onClick={() => {clickCallback(node)}}>{node.name}</button>
            </div>
            
            {isOpen && (
                <div>
                    {node.children.map(child => (
                        <NodeView key={node.id} node={child} clickCallback={clickCallback} />
                    ))}
                </div>
            )}
        </div>
    );
};