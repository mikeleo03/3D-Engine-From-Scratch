export type BufferType = { "byteLength": number, "uri": string };

export enum BufferViewTarget {
    ARRAY_BUFFER = WebGLRenderingContext.ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
}
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

export enum MeshPrimitiveAttribute {
    POSITION = "POSITION",
    NORMAL = "NORMAL"
}
export type MeshPrimitiveType = {
    attributes: {
        [key in keyof typeof MeshPrimitiveAttribute]?: number;
    };
    indices?: number;
}
export type MeshType = { "primitives": MeshPrimitiveType[] };

export enum CameraView {
    PERSPECTIVE = "perspective",
    ORTHOGRAPHIC = "orthographic"
}
export type CameraType = {
    "type": "perspective",
    "persepective": {
        "aspectRatio": number,
        "yfov": number,
        "znear": number,
        "zfar": number
    }
} | {
    "type": "orthographic",
    "orthographic": {
        "xmag": number,
        "ymag": number,
        "znear": number,
        "zfar": number
    }
};

export type SceneNodeType = {
    transalation: [number, number, number],
    rotation: [number, number, number, number],
    scale: [number, number, number]
    children: number[],
    mesh?: number,
    camera?: number
}

export type SceneType = {
    nodes: number[];
}