import { BufferViewType } from "../types/gltftypes";
import { GLTFBuffer } from "./GLTFBuffer";

export class BufferView implements ArrayBufferView {
    private _buffer: GLTFBuffer;
    private _byteOffset: number;
    private _byteLength: number;
    private _target: number;

    constructor(buffer: GLTFBuffer, byteOffset: number, byteLength: number, target: number) {
        this._buffer = buffer;
        this._byteOffset = byteOffset;
        this._byteLength = byteLength;
        this._target = target;
    }

    get buffer() { return this._buffer; }

    get byteOffset() { return this._byteOffset; }

    get byteLength() { return this._byteLength; }

    get target() { return this._target; }

    get data(): Uint8Array { 
        // Note: this will create new array every time it's called 
        return this._buffer.data.slice(this._byteOffset, this._byteOffset + this._byteLength);
    }

    setData(data: Uint8Array, byteOffset: number = 0): void {
        if (byteOffset < 0) {
            throw new Error(`Offset must be greater than or equal to zero.`);
        }

        if (data.byteLength + byteOffset > this._byteLength) {
            throw new Error(`Data size is too large for current buffer view`);
        }

        this._buffer.setData(data, this._byteOffset + byteOffset);
    }

    static fromRaw(raw: BufferViewType, buffers: GLTFBuffer[]): BufferView {
        return new BufferView(
            buffers[raw.buffer],
            raw.byteOffset,
            raw.byteLength,
            raw.target
        );
    }

    toRaw(bufferIndex: number): BufferViewType {
        return {
            buffer: bufferIndex,
            byteOffset: this._byteOffset,
            byteLength: this._byteLength,
            target: this._target
        };
    }
}