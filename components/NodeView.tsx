// import React from 'react';
// import { SceneNode } from '@/lib/data/SceneNode';

// export default function NodeView({ node } : { node: SceneNode }) {
//     const [isOpen, setIsOpen] = React.useState(false);

//     const handleToggle = () => {
//         setIsOpen(!isOpen);
//     };

//     return (
//         <div style={{ marginLeft: 20 }}>  
//             <div>
//                 <div onClick={handleToggle} style={{ cursor: 'pointer' }}>
//                     {isOpen ? '▼' : '▶'} {node}
//                 </div>
//                 {isOpen && (
//                     <div>
//                         {node.nodes.map(child => (
//                             <NodeView node={child} />
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };