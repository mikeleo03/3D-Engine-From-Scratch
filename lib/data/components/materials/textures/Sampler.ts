import { ImageFormat, MagFilter, MinFilter, WrapMode } from "@/lib/cores";
import { SamplerType } from "@/lib/data/types/gltftypes";
import { ValueOf } from "next/dist/shared/lib/constants";


export class Sampler {
    private _magFilter: ValueOf<typeof MagFilter>;
    private _minFilter: ValueOf<typeof MinFilter>;
    private _wrapS: ValueOf<typeof WrapMode>;
    private _wrapT: ValueOf<typeof WrapMode>;

    constructor(
        magFilter: ValueOf<typeof MagFilter>,
        minFilter: ValueOf<typeof MinFilter>,
        wrapS: ValueOf<typeof WrapMode>,
        wrapT: ValueOf<typeof WrapMode>
    ) {
        this._magFilter = magFilter;
        this._minFilter = minFilter;
        this._wrapS = wrapS;
        this._wrapT = wrapT;
    }

    get magFilter() {
        return this._magFilter;
    }

    get minFilter() {
        return this._minFilter;
    }

    get wrapS() {
        return this._wrapS;
    }

    get wrapT() {
        return this._wrapT;
    }

    set magFilter(value: ValueOf<typeof MagFilter>) {
        this._magFilter = value;
    }

    set minFilter(value: ValueOf<typeof MinFilter>) {
        this._minFilter = value;
    }

    set wrapS(value: ValueOf<typeof WrapMode>) {
        this._wrapS = value;
    }

    set wrapT(value: ValueOf<typeof WrapMode>) {
        this._wrapT = value;
    }

    toRaw(): SamplerType {
        return {
            magFilter: this._magFilter,
            minFilter: this._minFilter,
            wrapS: this._wrapS,
            wrapT: this._wrapT
        };
    }

    static fromRaw(raw: SamplerType): Sampler {
        return new Sampler(
            raw.magFilter,
            raw.minFilter,
            raw.wrapS,
            raw.wrapT
        );
    }
}