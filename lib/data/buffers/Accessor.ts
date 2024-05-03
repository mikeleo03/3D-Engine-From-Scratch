import { AccessorType } from "../types/gltftypes";
import { BufferView } from "./BufferView";

export class Accessor {
    private _bufferView: BufferView;
    private _byteOffset: number;
    private _componentType: number;
    private _count: number;
    private _type: string;
    private _max: number[];
    private _min: number[];
    
    constructor(bufferView: BufferView, byteOffset: number, componentType: number, count: number, type: string, max: number[], min: number[]) {
        this._bufferView = bufferView;
        this._byteOffset = byteOffset;
        this._componentType = componentType;
        this._count = count;
        this._type = type;
        this._max = max;
        this._min = min;
    }

    get bufferView(): BufferView {
        return this._bufferView;
    }

    get byteOffset(): number {
        return this._byteOffset;
    }

    get componentType(): number {
        return this._componentType;
    }

    get count(): number {
        return this._count;
    }

    get type(): string {
        return this._type;
    }

    get max(): number[] {
        return this._max;
    }

    get min(): number[] {
        return this._min;
    }

    static fromRaw(raw: AccessorType, bufferViews: BufferView[]): Accessor {
        return new Accessor(
            bufferViews[raw.bufferView],
            raw.byteOffset,
            raw.componentType,
            raw.count,
            raw.type,
            raw.max,
            raw.min
        );
    }

    toRaw(bufferIndex: number): AccessorType {
        return {
            bufferView: bufferIndex,
            byteOffset: this._byteOffset,
            componentType: this._componentType,
            count: this._count,
            type: this._type,
            max: this._max,
            min: this._min
        };
    }
}