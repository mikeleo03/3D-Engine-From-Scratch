import { AccessorComponentType, BufferViewTarget, DisplacementDataType, MaterialType, MaterialTypeString, PhongMaterialUniformType, TextureDataType } from "../../types/gltftypes";
import { Color, UniformSingleDataType, WebGLType } from "../../../cores/index";
import { Vector3 } from "../../math/index";
import { ShaderMaterial } from "./index";
import phongFragment from "./shaders/PhongFragment";
import phongVertex from "./shaders/PhongVertex";
import { Texture } from "./textures/Texture";
import { Accessor } from "../../buffers/Accessor";
import { GLTFBuffer } from "../../buffers/GLTFBuffer";
import { BufferView } from "../../buffers/BufferView";
import { Float32ArrayConverter, Uint16ArrayConverter } from "../../buffers/typedarrayconverters";

export class TextureData {
    private _texture: Texture;
    private _texCoords: Accessor;

    // _texCoordsExpanded: whether the texCoords are specified for each vertex (false) or each index (true)
    // Note: texCoords must be expanded when this texture is passed as attribute to the shader
    private _texCoordsExpanded: boolean = false;

    constructor(
        texture: Texture,
        texCoords: Accessor,
        options: { texCoordsExpanded: boolean } = { texCoordsExpanded: false }
    ) {
        const { texCoordsExpanded } = options;

        if (texCoords.componentType !== WebGLType.UNSIGNED_SHORT) {
            throw new Error('Accessor component type must be UNSIGNED_SHORT.');
        }

        if (texCoords.type !== AccessorComponentType.VEC2) {
            throw new Error('Accessor type must be VEC2.');
        }

        this._texture = texture;
        this._texCoords = texCoords;

        this._texCoordsExpanded = texCoordsExpanded;
    }

    static new(texture: Texture, textCoords: [number, number][]): TextureData {
        const buffer = GLTFBuffer.empty(textCoords.length * 2 * 4);
        const bufferView = new BufferView(buffer, 0, buffer.byteLength, BufferViewTarget.ARRAY_BUFFER);
        const accessor = new Accessor(bufferView, 0, WebGLType.FLOAT, textCoords.length, AccessorComponentType.VEC2, [], []);
        const converter = new Float32ArrayConverter();
        accessor.setData(converter.tobytes(Float32Array.from(textCoords.flat())));

        return new TextureData(texture, accessor);
    }

    get texture() {
        return this._texture;
    }

    get textCoords() {
        return this._texCoords;
    }

    get texCoordsExpanded() {
        return this._texCoordsExpanded;
    }

    set texture(value: Texture) {
        this._texture = value;
    }

    setTexCoord(value: Accessor, expanded: boolean = false) {
        if (value.componentType !== WebGLType.UNSIGNED_SHORT) {
            throw new Error('Accessor component type must be UNSIGNED_SHORT.');
        }

        if (value.type !== AccessorComponentType.VEC2) {
            throw new Error('Accessor type must be VEC2.');
        }

        this._texCoords = value;
        this._texCoordsExpanded = expanded;
    }

    expandTexCoords(indices: number[], accessor?: Accessor) {
        if (this._texCoordsExpanded) {
            throw new Error('Texture coordinates are already expanded.');
        }

        for (const index of indices) {
            if (index < 0 || index >= this._texCoords.count) {
                throw new Error('Index out of bounds.');
            }
        }

        if (accessor) {
            if (accessor.count !== indices.length) {
                throw new Error('Accessor count does not match indices length.');
            }

            if (accessor.componentType !== WebGLType.UNSIGNED_SHORT) {
                throw new Error('Accessor component type must be UNSIGNED_SHORT.');
            }

            if (accessor.type !== AccessorComponentType.VEC2) {
                throw new Error('Accessor type must be VEC2.');
            }
        }

        else {
            const buffer = GLTFBuffer.empty(indices.length * 2 * 2);
            const bufferView = new BufferView(buffer, 0, buffer.byteLength, BufferViewTarget.ARRAY_BUFFER);
            accessor = new Accessor(bufferView, 0, WebGLType.UNSIGNED_SHORT, indices.length, AccessorComponentType.VEC2, [], []);
        }

        const converter = new Uint16ArrayConverter();
        const originaTexCoords = this._texCoords.getData(converter);

        const data = new Uint16Array(indices.length * 2);

        for (let i = 0; i < indices.length; i++) {
            data[i * 2] = originaTexCoords[indices[i] * 2];
            data[i * 2 + 1] = originaTexCoords[indices[i] * 2 + 1];
        }

        accessor.setData(converter.tobytes(data));

        this._texCoords = accessor;
    }

    toRaw(textureMap: Map<Texture, number>, accessorMap: Map<Accessor, number>): TextureDataType {
        if (!textureMap.has(this._texture)) {
            throw new Error('Texture not found in map.');
        }

        if (!accessorMap.has(this._texCoords)) {
            throw new Error('Accessor not found in map.');
        }

        return {
            texture: textureMap.get(this._texture)!!,
            texCoords: accessorMap.get(this._texCoords)!!,
            texCoordsExpanded: this._texCoordsExpanded
        };
    }

    static fromRaw(raw: TextureDataType, textures: Texture[], accessors: Accessor[]): TextureData {
        return new TextureData(textures[raw.texture], accessors[raw.texCoords], { texCoordsExpanded: raw.texCoordsExpanded });
    }
}

export class DisplacementData {
    private _textureData: TextureData;
    private _scale: number;
    private _bias: number;

    constructor(textureData: TextureData, scale: number, bias: number) {
        this._textureData = textureData;
        this._scale = scale;
        this._bias = bias;
    }

    get textureData() {
        return this._textureData;
    }

    get scale() {
        return this._scale;
    }

    get bias() {
        return this._bias;
    }

    set scale(value: number) {
        this._scale = value;
    }

    set bias(value: number) {
        this._bias = value;
    }

    toRaw(textureMap: Map<Texture, number>, accessorMap: Map<Accessor, number>): DisplacementDataType {
        return {
            textureData: this._textureData.toRaw(textureMap, accessorMap),
            scale: this._scale,
            bias: this._bias
        };
    }

    static fromRaw(raw: DisplacementDataType, textures: Texture[], accessors: Accessor[]): DisplacementData {
        return new DisplacementData(TextureData.fromRaw(raw.textureData, textures, accessors), raw.scale, raw.bias);
    }

    static new(texture: Texture, textCoords: [number, number][], scale: number, bias: number): DisplacementData {
        return new DisplacementData(TextureData.new(texture, textCoords), scale, bias);
    }
}

class NormalDataType {
    textureData: TextureDataType;
    tangent: number[];
    bitangent: number[];
}

export class PhongMaterial extends ShaderMaterial {
    public static readonly DEFAULT_NAME = 'Phong Material';

    private _ambientColor: Color;
    private _diffuseColor: Color;
    private _specularColor: Color;
    private _shininess: number;
    private _diffuseMap?: TextureData;
    private _normalMap?: TextureData;
    private _displacementMap?: DisplacementData;
    private _specularMap?: TextureData;

    private _diffuseMaps: TextureData[] = [];
    private _normalMaps: TextureData[] = [];
    private _displacementMaps: DisplacementData[] = [];
    private _specularMaps: TextureData[] = [];

    constructor(
        options: {
            name?: string,
            ambientColor?: Color;
            diffuseColor?: Color;
            specularColor?: Color;
            shininess?: number;
            diffuseMap?: TextureData;
            normalMap?: TextureData;
            displacementMap?: DisplacementData;
            specularMap?: TextureData;
            diffuseMaps?: TextureData[];
            normalMaps?: TextureData[];
            displacementMaps?: DisplacementData[];
            specularMaps?: TextureData[];
        } = {
            diffuseMaps: [],
            normalMaps: [],
            displacementMaps: [],
            specularMaps: []
        }
    ) {
        const {
            ambientColor,
            diffuseColor,
            specularColor,
            shininess,
            diffuseMap,
            normalMap,
            displacementMap,
            specularMap
        } = options;

        const name = options.name || PhongMaterial.DEFAULT_NAME;

        super(
            name,
            MaterialTypeString.PHONG,
            phongVertex,
            phongFragment
        );

        this._ambientColor = ambientColor || Color.white();
        this._diffuseColor = diffuseColor || Color.white();
        this._specularColor = specularColor || Color.white();
        this._shininess = shininess || 30;
        this._diffuseMap = diffuseMap;
        this._normalMap = normalMap;
        this._displacementMap = displacementMap;
        this._specularMap = specularMap;

        this._diffuseMaps = options.diffuseMaps || [];
        this._normalMaps = options.normalMaps || [];
        this._displacementMaps = options.displacementMaps || [];
        this._specularMaps = options.specularMaps || [];

        if (this._diffuseMap && !this._diffuseMaps.includes(this._diffuseMap)) {
            this._diffuseMaps.push(this._diffuseMap);
        }

        if (this._normalMap && !this._normalMaps.includes(this._normalMap)) {
            this._normalMaps.push(this._normalMap);
        }

        if (this._displacementMap && !this._displacementMaps.includes(this._displacementMap)) {
            this._displacementMaps.push(this._displacementMap);
        }

        if (this._specularMap && !this._specularMaps.includes(this._specularMap)) {
            this._specularMaps.push(this._specularMap);
        }
    }

    get ambientColor(): Color {
        return this._ambientColor.clone();
    }

    get diffuseColor(): Color {
        return this._diffuseColor.clone();
    }

    get specularColor(): Color {
        return this._specularColor.clone();
    }

    get shininess(): number {
        return this._shininess;
    }

    get diffuseMap(): TextureData | undefined {
        return this._diffuseMap;
    }

    get normalMap(): TextureData | undefined {
        return this._normalMap;
    }

    get displacementMap(): DisplacementData | undefined {
        return this._displacementMap;
    }

    get specularMap(): TextureData | undefined {
        return this._specularMap;
    }

    get diffuseMaps(): TextureData[] {
        return this._diffuseMaps.slice();
    }

    get normalMaps(): TextureData[] {
        return this._normalMaps.slice();
    }

    get displacementMaps(): DisplacementData[] {
        return this._displacementMaps.slice();
    }

    get specularMaps(): TextureData[] {
        return this._specularMaps.slice();
    }

    set diffuseColor(val: Color) {
        this._diffuseColor = val.clone();
    }

    set ambientColor(val: Color) {
        this._ambientColor = val.clone();
    }

    set specularColor(val: Color) {
        this._specularColor = val.clone();
    }

    set shininess(val: number) {
        this._shininess = val;
    }

    set diffuseMap(val: TextureData | undefined) {
        this._diffuseMap = val;
    }

    set normalMap(val: TextureData | undefined) {
        this._normalMap = val;
    }

    set displacementMap(val: DisplacementData | undefined) {
        this._displacementMap = val;
    }

    set specularMap(val: TextureData | undefined) {
        this._specularMap = val;
    }

    override toRaw(options: {
        textureMap?: Map<Texture, number>,
        accessorMap?: Map<Accessor, number>
    }): MaterialType {

        if (options.textureMap === undefined) {
            throw new Error('Texture map is required.');
        }

        if (options.accessorMap === undefined) {
            throw new Error('Accessor map is required.');
        }

        const diffuseMapRaws = this._diffuseMaps.map(
            (diffuseMap) => diffuseMap.toRaw(options.textureMap!, options.accessorMap!)
        );

        const normalMapRaws = this._normalMaps.map(
            (normalMap) => normalMap.toRaw(options.textureMap!, options.accessorMap!)
        );

        const displacementMapRaws = this._displacementMaps.map(
            (displacementMap) => displacementMap.toRaw(options.textureMap!, options.accessorMap!)
        );

        const specularMapRaws = this._specularMaps.map(
            (specularMap) => specularMap.toRaw(options.textureMap!, options.accessorMap!)
        );

        const uniforms: PhongMaterialUniformType = {
            ambientColor: this._ambientColor.toRaw(),
            diffuseColor: this._diffuseColor.toRaw(),
            specularColor: this._specularColor.toRaw(),
            shininess: this._shininess,
            diffuseMaps: diffuseMapRaws,
            normalMaps: normalMapRaws,
            displacementMaps: displacementMapRaws,
            specularMaps: specularMapRaws,
            diffuseMap: -1,
            normalMap: -1,
            displacementMap: -1,
            specularMap: -1
        };

        uniforms.diffuseMap = this._diffuseMap ? this._diffuseMaps.findIndex((map) => map === this._diffuseMap) : -1;
        uniforms.normalMap = this._normalMap ? this._normalMaps.findIndex((map) => map === this._normalMap) : -1;
        uniforms.displacementMap = this._displacementMap ? this._displacementMaps.findIndex((map) => map === this._displacementMap) : -1;
        uniforms.specularMap = this._specularMap ? this._specularMaps.findIndex((map) => map === this._specularMap) : -1;

        return {
            type: MaterialTypeString.PHONG,
            name: this.name,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            uniforms
        };
    }

    override getUniforms(): { [key: string]: any } {
        return {
            ambientColor: this._ambientColor,
            diffuseColor: this._diffuseColor,
            specularColor: this._specularColor,
            shininess: this._shininess,
            diffuseMap: this._diffuseMap?.texture,
            normalMap: this._normalMap?.texture,
            displacementMap: this._displacementMap?.textureData.texture,
            specularMap: this._specularMap?.texture
        };
    }

    override getBufferUniforms(): { [key: string]: UniformSingleDataType } {
        return {
            ambientColor: this._ambientColor.buffer,
            diffuseColor: this._diffuseColor.buffer,
            specularColor: this._specularColor.buffer,
            shininess: this._shininess,
        };
    }

}
