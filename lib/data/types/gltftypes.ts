export type SceneType = { "nodes": number[] };
export type NodeType = { "name": string, "children": number[], "mesh": number, "camera": number };
export type BufferType = { "byteLength": number, "uri": string };
export type BufferViewType = { "buffer": number, "byteOffset": number, "byteLength": number, "target": number };
export type AccessorType = {
    "bufferView": number,
    "byteOffset": number,
    "componentType": number,
    "count": number,
    "type": string,
    "max": number[],
    "min": number[]
};
export type MeshType = { "primitives": { "attributes": { "POSITION": number, "NORMAL": number }, "indices": number }[] };