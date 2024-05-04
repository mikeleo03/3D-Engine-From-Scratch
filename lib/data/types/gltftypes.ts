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
export enum AccessorComponentType {
    SCALAR = "SCALAR",
    VEC2 = "VEC2",
    VEC3 = "VEC3",
    VEC4 = "VEC4",
    MAT2 = "MAT2",
    MAT3 = "MAT3",
    MAT4 = "MAT4"
}

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

export type GLTFType = {
    buffers: BufferType[],
    bufferViews: BufferViewType[],
    accessors: AccessorType[],
    meshes: MeshType[],
    cameras: CameraType[],
    nodes: SceneNodeType[],
    scenes: SceneType[],
    scene: number
};