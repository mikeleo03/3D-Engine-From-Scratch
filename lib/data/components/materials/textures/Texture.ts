import { TextureType } from "@/lib/data/types/gltftypes";
import { Sampler } from "./Sampler";
import { TextureImage } from "./TextureImage";
import { Color } from "@/lib/cores";

export type TextureRecord = {
    texture: WebGLTexture | null;
    unit: number;
}
export class Texture {
    private _sampler: Sampler;
    private _source: TextureImage;
    private _defaultColor: Color;

    private _textureRecordMap: Map<string, TextureRecord> = new Map(); // Don't modify, only for renderer.
    private _needUploadMap: Map<string, boolean> = new Map();  // Don't modify, only for renderer.
    private _parameterChangedMap: Map<string, boolean> = new Map();  // Don't modify, only for renderer.

    constructor(sampler: Sampler, source: TextureImage, defaultColor: Color = Color.white()) {
        this._sampler = sampler;
        this._source = source;
        this._defaultColor = defaultColor;
    }

    get width(): number {
        return this._source.arrayData?.width ?? this._source.image?.width ?? -1;
    }

    get height(): number {
        return this._source.arrayData?.height ?? this._source.image?.height ?? -1;
    }

    get sampler() {
        return this._sampler;
    }

    get source() {
        return this._source;
    }

    get isLoaded(): boolean {
        return this._source.arrayData !== undefined || this._source.image !== undefined;
    }

    isNeedUpload(rendererId: string) {
        return this._needUploadMap.has(rendererId) ? this._needUploadMap.get(rendererId)!! : true;
    }

    getTextureRecord(rendererId: string): TextureRecord | null {
        return this._textureRecordMap.get(rendererId) ?? null;
    }

    getTexture(rendererId: string): WebGLTexture | null {
        return this._textureRecordMap.get(rendererId)?.texture ?? null;
    }

    getTextureUnit(rendererId: string): number {
        return this._textureRecordMap.get(rendererId)?.unit ?? -1;
    }

    isParameterChanged(rendererId: string) {
        return this._parameterChangedMap.has(rendererId) ? this._parameterChangedMap.get(rendererId)!! : true;
    }

    get defaultColor() {
        return this._defaultColor.clone();
    }

    set sampler(value: Sampler) {
        this._sampler = value;
    }

    set source(value: TextureImage) {
        this._source = value;
    }

    setTexture(rendererId: string, texture: WebGLTexture | null) {
        const unit = this._textureRecordMap.has(rendererId) ? this._textureRecordMap.get(rendererId)!!.unit : -1;
        this._textureRecordMap.set(rendererId, { texture, unit });
    }

    setTextureUnit(rendererId: string, unit: number) {
        const texture = this._textureRecordMap.has(rendererId) ? this._textureRecordMap.get(rendererId)!!.texture : null;
        this._textureRecordMap.set(rendererId, { texture, unit });
    }

    setNeedUpload(rendererId: string, value: boolean) {
        this._needUploadMap.set(rendererId, value);
    }

    setParameterChanged(rendererId: string, value: boolean) {
        this._parameterChangedMap.set(rendererId, value);
    }

    set defaultColor(value: Color) {
        this._defaultColor = value;
    }

    toRaw(samplerMap: Map<Sampler, number>, sourceMap: Map<TextureImage, number>): TextureType {
        // check if the sampler and source are in the maps
        if (!samplerMap.has(this._sampler)) {
            throw new Error('Sampler not found in map.');
        }

        if (!sourceMap.has(this._source)) {
            throw new Error('Source not found in map.');
        }

        return {
            sampler: samplerMap.get(this._sampler)!!,
            source: sourceMap.get(this._source)!!,
            defaultColor: this._defaultColor.toRaw()
        };
    }

    static fromRaw(raw: TextureType, samplers: Sampler[], sources: TextureImage[]): Texture {
        return new Texture(samplers[raw.sampler], sources[raw.source], Color.fromRaw(raw.defaultColor));
    }
}