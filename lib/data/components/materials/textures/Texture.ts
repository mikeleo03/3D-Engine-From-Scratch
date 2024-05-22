import { TextureType } from "@/lib/data/types/gltftypes";
import { Sampler } from "./Sampler";
import { TextureImage } from "./TextureImage";

export class Texture {
    private _sampler: Sampler;
    private _source: TextureImage;

    constructor(sampler: Sampler, source: TextureImage) {
        this._sampler = sampler;
        this._source = source;
    }

    get sampler() {
        return this._sampler;
    }

    get source() {
        return this._source;
    }

    set sampler(value: Sampler) {
        this._sampler = value;
    }

    set source(value: TextureImage) {
        this._source = value;
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
            source: sourceMap.get(this._source)!!
        };
    }

    static fromRaw(raw: TextureType, samplers: Sampler[], sources: TextureImage[]): Texture {
        return new Texture(samplers[raw.sampler], sources[raw.source]);
    }
}