import { Color } from "@/lib/cores";
import { getByteCountForWebGLType } from "@/lib/cores/gltypes";
import { Vector3 } from "../math";

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

export type MaterialType = {
    "type": string,
    "name": string,
    "vertexShader": string, 
    "fragmentShader": string, 
    "uniforms": {
        [key: string]: number[] | Color | Vector3 | number;
    },
} 

export enum MeshPrimitiveAttribute {
    POSITION = "position",
    NORMAL = "normal"
}
export type MeshPrimitiveType = {
    attributes: {
        [key in keyof typeof MeshPrimitiveAttribute]?: number;
    };
    material: number;
    indices?: number;
}
export type MeshType = { "primitives": MeshPrimitiveType[] };

export enum CameraView {
    PERSPECTIVE = "perspective",
    ORTHOGRAPHIC = "orthographic"
}

export enum CameraTypeString {
    PERSPECTIVE = "perspective",
    ORTHOGRAPHIC = "orthographic",
    OBLIQUE = "oblique"

}
export type CameraType = {
    "type": CameraTypeString.PERSPECTIVE,
    "perspective": {
        "aspectRatio": number,
        "yfov": number,
        "znear": number,
        "zfar": number,
        "zoom": number,
    }
} | {
    "type": CameraTypeString.ORTHOGRAPHIC,
    "orthographic": {
        "top": number,
        "bottom": number,
        "left": number,
        "right": number,
        "znear": number,
        "zfar": number,
        "zoom": number
    }
} | {
    "type": CameraTypeString.OBLIQUE,
    "oblique": {
        "top": number,
        "bottom": number,
        "left": number,
        "right": number,
        "znear": number,
        "zfar": number,
        "angleX": number,
        "angleY": number,
        "zoom": number
    }
};

export enum LightTypeString {
    DIRECTIONAL = "directional"
}

export type LightType = {
    "type": LightTypeString.DIRECTIONAL,
    "directional": {
        "color": Color,
        "intensity": number,
        "target": Vector3,
        "ambientColor": Color,
        "diffuseColor": Color,
        "specularColor": Color
    }
}

export type SceneNodeType = {
    id: string,
    name: string,
    translation: [number, number, number],
    rotation: [number, number, number, number],
    scale: [number, number, number]
    children: number[],
    mesh?: number,
    camera?: number,
    light?: number
}

export type SceneType = {
    nodes: number[];
    activeCamera: number;
    activeLight: number
}

export type AnimationTRS = {
    translation?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  }
  
export type AnimationPathType = {
    nodeKeyframePairs?: Array<{node: number, keyframe: AnimationTRS}>
}
export type AnimationClipType = {
    name: string;
    frames: AnimationPathType[];
}

export type GLTFType = {
    buffers: BufferType[],
    bufferViews: BufferViewType[],
    accessors: AccessorType[],
    materials: MaterialType[],
    meshes: MeshType[],
    cameras: CameraType[],
    nodes: SceneNodeType[],
    scenes: SceneType[],
    animations: AnimationClipType[],
    scene: number
};