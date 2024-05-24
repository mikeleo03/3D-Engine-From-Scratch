import { TextureType } from "@/lib/data/types/gltftypes";
import { Sampler } from "./Sampler";
import { TextureImage } from "./TextureImage";
import { Color } from "@/lib/cores";

export class Texture {
    private _sampler: Sampler;
    private _source: TextureImage;
    private _defaultColor: Color;

    private _texture: WebGLTexture | null = null; // JANGAN DIUBAH! Hanya untuk renderer.
    private _textureUnit: number = -1;  // JANGAN DIUBAH! Hanya untuk renderer.
    private _needUpload: boolean = true;  // Upload ulang gambar ke tekstur.
    private _parameterChanged: boolean = true;  // Ubah parameter tekstur di awal minimal sekali.

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

    get isLoaded() {
        return this._texture !== null;
    }

    get needUpload() {
        return this._needUpload;
    }

    get texture() {
        return this._texture;
    }

    get textureUnit() {
        return this._textureUnit;
    }

    get parameterChanged() {
        return this._parameterChanged;
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

    set texture(value: WebGLTexture | null) {
        this._texture = value;
    }

    set needUpload(value: boolean) {
        this._needUpload = value;
    }

    set parameterChanged(value: boolean) {
        this._parameterChanged = value;
    }

    set defaultColor(value: Color) {
        this._defaultColor = value;
    }

    set textureUnit(value: number) {
        this._textureUnit = value;
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