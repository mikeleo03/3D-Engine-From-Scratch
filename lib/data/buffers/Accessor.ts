import { getByteCountForWebGLType } from "@/lib/cores/gltypes";
import { AccessorComponentType, AccessorType, getAccessorComponentType, getByteCountForComponentType } from "../types/gltftypes";
import { BufferView } from "./BufferView";
import { TypedArrayConverter } from "./typedarrayconverters";

export class Accessor {
    private _bufferView: BufferView;
    private _byteOffset: number;
    private _componentType: number;
    private _count: number;
    private _type: AccessorComponentType;
    private _max: number[];
    private _min: number[];
    
    constructor(
        bufferView: BufferView, 
        byteOffset: number, 
        componentType: number, 
        count: number, 
        type: AccessorComponentType, 
        max: number[], 
        min: number[]
    ) {
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

    setData(data: Uint8Array, elementOffset: number = 0): void {

        const singleByteCount = this.getSingleByteCount();
        
        if (data.length % singleByteCount !== 0) {
            throw new Error(`Data size is not a multiple of the byte count for the component type`);
        }

        const count = data.length / singleByteCount;
        const singleElementByte = this.getSingleElementByteCount();
        const byteCount = this.getByteCount();

        if (elementOffset < 0) {
            throw new Error(`Offset must be greater than or equal to zero.`);
        }

        if (count + (elementOffset * singleElementByte / byteCount) > this._count) {
            throw new Error(`Data size is too large for current accessor count`);
        }

        if (data.length + elementOffset * singleElementByte < count * byteCount) {
            throw new Error(`Data size is too small for current accessor count`);
        }
        

        this.bufferView.setData(
            data, 
            this._byteOffset + elementOffset * singleElementByte
        );
    }

    getData(converter?: TypedArrayConverter, elementOffset: number = 0): ArrayLike<number> {
        // Note: this will create new array every time it's called
        const offset = this._byteOffset + elementOffset * this.getSingleElementByteCount();
        const data = this._bufferView.data.slice(
            offset, 
            offset + this._count * this.getSingleByteCount()
        );

        if (!converter) {
            return data;
        }

        return converter.from(data);
    }

    getByteCount(): number {
        return this._count * this.getSingleByteCount();
    }

    getSingleByteCount(): number {
        return getByteCountForComponentType(this._componentType, this._type);
    }

    getSingleElementByteCount(): number {
        return getByteCountForWebGLType(this._componentType);
    }

    static fromRaw(raw: AccessorType, bufferViews: BufferView[]): Accessor {
        return new Accessor(
            bufferViews[raw.bufferView],
            raw.byteOffset,
            raw.componentType,
            raw.count,
            getAccessorComponentType(raw.type),
            raw.max,
            raw.min
        );
    }

    toRaw(bufferViewIndex: number): AccessorType {
        return {
            bufferView: bufferViewIndex,
            byteOffset: this._byteOffset,
            componentType: this._componentType,
            count: this._count,
            type: this._type,
            max: this._max,
            min: this._min
        };
    }
}