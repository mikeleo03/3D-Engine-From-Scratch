"use client";

import { GLBufferAttribute } from "../data/buffers/GLBufferAttribute";

export enum ShaderType {
    VERTEX = WebGLRenderingContext.VERTEX_SHADER,
    FRAGMENT = WebGLRenderingContext.FRAGMENT_SHADER,
};

export const WebGLType = {
    UNSIGNED_BYTE: WebGLRenderingContext.UNSIGNED_BYTE,
    UNSIGNED_SHORT: WebGLRenderingContext.UNSIGNED_SHORT,
    UNSIGNED_INT: WebGLRenderingContext.UNSIGNED_INT,
    BYTE: WebGLRenderingContext.BYTE,
    SHORT: WebGLRenderingContext.SHORT,
    INT: WebGLRenderingContext.INT,
    INT_VEC2: WebGLRenderingContext.INT_VEC2,
    INT_VEC3: WebGLRenderingContext.INT_VEC3,
    INT_VEC4: WebGLRenderingContext.INT_VEC4,
    FLOAT: WebGLRenderingContext.FLOAT,
    FLOAT_MAT2: WebGLRenderingContext.FLOAT_MAT2,
    FLOAT_MAT3: WebGLRenderingContext.FLOAT_MAT3,
    FLOAT_MAT4: WebGLRenderingContext.FLOAT_MAT4,
    FLOAT_VEC2: WebGLRenderingContext.FLOAT_VEC2,
    FLOAT_VEC3: WebGLRenderingContext.FLOAT_VEC3,
    FLOAT_VEC4: WebGLRenderingContext.FLOAT_VEC4,
    BOOL: WebGLRenderingContext.BOOL,
    BOOL_VEC2: WebGLRenderingContext.BOOL_VEC2,
    BOOL_VEC3: WebGLRenderingContext.BOOL_VEC3,
    BOOL_VEC4: WebGLRenderingContext.BOOL_VEC4,
    SAMPLER_2D: WebGLRenderingContext.SAMPLER_2D,
    SAMPLER_CUBE: WebGLRenderingContext.SAMPLER_CUBE,
}

export function getByteCountForWebGLType(type: number): number {
    switch (type) {
        case WebGLType.UNSIGNED_BYTE:
        case WebGLType.BYTE:
        case WebGLType.BOOL:
            return 1;
        case WebGLType.UNSIGNED_SHORT:
        case WebGLType.SHORT:
        case WebGLType.FLOAT_VEC2:
        case WebGLType.BOOL_VEC2:
            return 2;
        case WebGLType.UNSIGNED_INT:
        case WebGLType.INT:
        case WebGLType.FLOAT:
        case WebGLType.FLOAT_VEC3:
        case WebGLType.BOOL_VEC3:
            return 4;
        case WebGLType.INT_VEC2:
        case WebGLType.FLOAT_VEC4:
        case WebGLType.BOOL_VEC4:
            return 4 * 2;
        case WebGLType.INT_VEC3:
            return 4 * 3;
        case WebGLType.INT_VEC4:
            return 4 * 4;
        case WebGLType.FLOAT_MAT2:
            return 4 * 2 * 2;
        case WebGLType.FLOAT_MAT3:
            return 4 * 3 * 3;
        case WebGLType.FLOAT_MAT4:
            return 4 * 4 * 4;
        case WebGLType.SAMPLER_2D:
        case WebGLType.SAMPLER_CUBE:
            return -1; // It depends on texture format and size
        default:
            return 0; // Unknown type
    }
}

export type AttributeSingleDataType = GLBufferAttribute | Float32Array | number[];
export type AttributeDataType = [AttributeSingleDataType] | number[];
export type AttributeSetters = (...v: AttributeDataType) => void;
export type AttributeMapSetters = { [key: string]: AttributeSetters };

export type UniformSetters = (...v: any) => void;
export type UniformMapSetters = { [key: string]: UniformSetters };

export type ProgramInfo = {
    program: WebGLProgram,
    uniformSetters: UniformMapSetters,
    attributeSetters: AttributeMapSetters,
};

export const UniformSetterWebGLType: { [key: number]: string } = {
    [WebGLRenderingContext.FLOAT]: "1f",
    [WebGLRenderingContext.FLOAT_VEC2]: "2f",
    [WebGLRenderingContext.FLOAT_VEC3]: "3f",
    [WebGLRenderingContext.FLOAT_VEC4]: "4f",
    [WebGLRenderingContext.INT]: "1i",
    [WebGLRenderingContext.INT_VEC2]: "2i",
    [WebGLRenderingContext.INT_VEC3]: "3i",
    [WebGLRenderingContext.INT_VEC4]: "4i",
    [WebGLRenderingContext.BOOL]: "1i",
    [WebGLRenderingContext.BOOL_VEC2]: "2i",
    [WebGLRenderingContext.BOOL_VEC3]: "3i",
    [WebGLRenderingContext.BOOL_VEC4]: "4i",
    [WebGLRenderingContext.FLOAT_MAT2]: "Matrix2fv",
    [WebGLRenderingContext.FLOAT_MAT3]: "Matrix3fv",
    [WebGLRenderingContext.FLOAT_MAT4]: "Matrix4fv",
}

