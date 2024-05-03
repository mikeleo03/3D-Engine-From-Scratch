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

    get data() { return new Uint8Array(this._buffer, this._byteOffset, this._byteLength); }

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