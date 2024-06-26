import { Color, MagFilter, MinFilter, WrapMode } from "@/lib/cores";
import { WebGLType, getByteCountForWebGLType } from "@/lib/cores/gltypes";
import { Vector3 } from "../math";
import { ValueOf } from "next/dist/shared/lib/constants";

export type BufferType = { "byteLength": number, "uri": string };

export enum BufferViewTarget {
    ARRAY_BUFFER = WebGLRenderingContext.ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
}
export type BufferViewType = { "buffer": number, "byteOffset": number, "byteLength": number, "target": number };

export type AccessorType = {
    "bufferView": number,
    "byteOffset": number,
    "componentType": ValueOf<typeof WebGLType>,
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

export type SamplerType = {
    "magFilter": ValueOf<typeof MagFilter>,
    "minFilter": ValueOf<typeof MinFilter>,
    "wrapS": ValueOf<typeof WrapMode>,
    "wrapT": ValueOf<typeof WrapMode>
}

export type TextureArrayDataType = {
    "bytes": number[],
    "width": number,
    "height": number
}
export type TextureImageType = {
    "data": {
        "image"?: string,
        "arrayData"?: TextureArrayDataType
    },
    "type": number,
    "format": number,
}

export type TextureType = {
    "sampler": number,
    "source": number,
    "defaultColor": number[]
}

export type TextureDataType = {
    "texture": number,
    "texCoords": number,
    "texCoordsExpanded": boolean,
}

export type SpecularDataType = {
    "textureData": TextureDataType,
    "shininess": number
}

export type DisplacementDataType = {
    "textureData": TextureDataType,
    "scale": number,
    "bias": number
}

export enum MaterialTypeString {
    BASIC = "Basic Material",
    PHONG = "Phong Material"
}

export type BasicMaterialUniformType = {
    "color": number[]
}

export type PhongMaterialUniformType = {
    "ambientColor": number[],
    "diffuseColor": number[],
    "specularColor": number[],
    "shininess": number,
    "diffuseMap": number,
    "normalMap": number,
    "displacementMap": number,
    "specularMap": number,
    "diffuseMaps": TextureDataType[],
    "normalMaps": TextureDataType[],
    "displacementMaps": DisplacementDataType[],
    "specularMaps": TextureDataType[]
}

export type MaterialType = {
    "type": MaterialTypeString.BASIC,
    "name": string,
    "vertexShader": string,
    "fragmentShader": string,
    "uniforms": BasicMaterialUniformType
} | {
    "type": MaterialTypeString.PHONG,
    "name": string,
    "vertexShader": string,
    "fragmentShader": string,
    "uniforms": PhongMaterialUniformType

}

export enum MeshPrimitiveAttribute {
    POSITION = "position",
    FACE_NORMAL = "faceNormal",
    VERTEX_NORMAL = "vertexNormal",
    TANGENT = "tangent",
    BITANGENT = "bitangent",
}

export enum MeshMaterialAttribute {
    DISPLACEMENT_UV = "displacementUV",
    DIFFUSE_UV = "diffuseUV",
    SPECULAR_UV = "specularUV",
    NORMAL_UV = "normalUV",
}

export type MeshPrimitiveType = {
    attributes: {
        [key in keyof typeof MeshPrimitiveAttribute]?: number;
    };
    basicMaterial?: number;
    phongMaterial?: number;
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
    DIRECTIONAL = "directional",
    POINT = "point",
}

export type LightType = {
    "type": LightTypeString.DIRECTIONAL,
    "directional": {
        "color": number[],
        "intensity": number,
        "target": number[],
        "ambientColor": number[],
        "diffuseColor": number[],
        "specularColor": number[]
    }
} | {
    "type": LightTypeString.POINT,
    "point": {
        "color": number[],
        "intensity": number,
        "ambientColor": number[],
        "diffuseColor": number[],
        "specularColor": number[]
        "constant": number,
        "linear": number,
        "quadratic": number
    }
};

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
    activeLight: number[]
}

export type AnimationTRS = {
    translation?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
}

export type AnimationPathType = {
    nodeKeyframePairs?: Array<{ node: number, keyframe: AnimationTRS }>
}
export type AnimationClipType = {
    name: string;
    frames: AnimationPathType[];
}

export enum AnimationEasingTypeString {
    LINEAR = "Linear",
    SINE = "Sine",
    QUAD = "Quad",
    CUBIC = "Cubic",
    QUART = "Quart",
    EXPO = "Expo",
    CIRC = "Circ",
    NONE = "None"
}

export type GLTFType = {
    buffers: BufferType[],
    bufferViews: BufferViewType[],
    accessors: AccessorType[],
    samplers: SamplerType[],
    images: TextureImageType[],
    textures: TextureType[],
    materials: MaterialType[],
    meshes: MeshType[],
    cameras: CameraType[],
    lights: LightType[],
    nodes: SceneNodeType[],
    scenes: SceneType[],
    animations: AnimationClipType[],
    scene: number
};