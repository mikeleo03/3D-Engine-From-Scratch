import { getByteCountForWebGLType } from "@/lib/cores/gltypes";

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
export const getAccessorComponentType = (type: string): AccessorComponentType => {
    switch (type) {
        case "SCALAR":
            return AccessorComponentType.SCALAR;
        case "VEC2":
            return AccessorComponentType.VEC2;
        case "VEC3":
            return AccessorComponentType.VEC3;
        case "VEC4":
            return AccessorComponentType.VEC4;
        case "MAT2":
            return AccessorComponentType.MAT2;
        case "MAT3":
            return AccessorComponentType.MAT3;
        case "MAT4":
            return AccessorComponentType.MAT4;
        default:
            throw new Error(`Unknown accessor component type: ${type}`);
    }
}

export function getByteCountForComponentType(elementType: number, accessorType: AccessorComponentType): number {
    const elementByteCount = getByteCountForWebGLType(elementType);

    switch (accessorType) {
        case AccessorComponentType.SCALAR:
            return elementByteCount;
        case AccessorComponentType.VEC2:
            return elementByteCount * 2;
        case AccessorComponentType.VEC3:
            return elementByteCount * 3;
        case AccessorComponentType.VEC4:
            return elementByteCount * 4;
        case AccessorComponentType.MAT2:
            return elementByteCount * 4;
        case AccessorComponentType.MAT3:
            return elementByteCount * 9;
        case AccessorComponentType.MAT4:
            return elementByteCount * 16;
    }
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
    "perspective": {
        "aspectRatio": number,
        "yfov": number,
        "znear": number,
        "zfar": number
    }
} | {
    "type": "orthographic",
    "orthographic": {
        "top": number,
        "bottom": number,
        "left": number,
        "right": number,
        "znear": number,
        "zfar": number,
    }
} | {
    "type": "oblique",
    "oblique": {
        "top": number,
        "bottom": number,
        "left": number,
        "right": number,
        "znear": number,
        "zfar": number,
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