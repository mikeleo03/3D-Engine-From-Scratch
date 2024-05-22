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
import { Float32ArrayConverter } from "../../buffers/typedarrayconverters";

export class TextureData {
    private _texture: Texture;
    private _textCoords: Accessor;

    constructor(texture: Texture, textCoords: Accessor) {
        this._texture = texture;
        this._textCoords = textCoords;
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
        return this._textCoords;
    }

    set texture(value: Texture) {
        this._texture = value;
    }

    set textCoords(value: Accessor) {
        this._textCoords = value;
    }

    toRaw(textureMap: Map<Texture, number>, accessorMap: Map<Accessor, number>): TextureDataType {
        if (!textureMap.has(this._texture)) {
            throw new Error('Texture not found in map.');
        }

        if (!accessorMap.has(this._textCoords)) {
            throw new Error('Accessor not found in map.');
        }

        return {
            texture: textureMap.get(this._texture)!!,
            textCoords: accessorMap.get(this._textCoords)!!
        };
    }

    static fromRaw(raw: TextureDataType, textures: Texture[], accessors: Accessor[]): TextureData {
        return new TextureData(textures[raw.texture], accessors[raw.textCoords]);
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
        } = {}
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

        const uniforms: PhongMaterialUniformType = {
            ambientColor: this._ambientColor.toRaw(),
            diffuseColor: this._diffuseColor.toRaw(),
            specularColor: this._specularColor.toRaw(),
            shininess: this._shininess
        };

        if (this._diffuseMap) {
            uniforms.diffuseMap = this._diffuseMap.toRaw(options.textureMap, options.accessorMap);
        }

        if (this._normalMap) {
            uniforms.normalMap = this._normalMap.toRaw(options.textureMap, options.accessorMap);
        }

        if (this._displacementMap) {
            uniforms.displacementMap = this._displacementMap.toRaw(options.textureMap, options.accessorMap);
        }

        if (this._specularMap) {
            uniforms.specularMap = this._specularMap.toRaw(options.textureMap, options.accessorMap);
        }

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
