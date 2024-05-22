import { SamplerType } from "@/lib/data/types/gltftypes";

export class Sampler {
    private _magFilter: number;
    private _minFilter: number;
    private _wrapS: number;
    private _wrapT: number;

    constructor(
        magFilter: number,
        minFilter: number,
        wrapS: number,
        wrapT: number
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

    set magFilter(value: number) {
        this._magFilter = value;
    }

    set minFilter(value: number) {
        this._minFilter = value;
    }

    set wrapS(value: number) {
        this._wrapS = value;
    }

    set wrapT(value: number) {
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