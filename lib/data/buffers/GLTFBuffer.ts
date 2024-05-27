import { BufferType } from "../types/gltftypes";

export class GLTFBuffer implements ArrayBuffer {
    private _data: Uint8Array;

    [Symbol.toStringTag]: string = "ArrayBuffer";

    constructor(data: Uint8Array) {
        this._data = data;
    }

    get data() { 
        // Note: this will return original array, be careful with mutation
        return this._data; 
    }

    get size() { return this._data.length; }

    get byteLength() { return this._data.byteLength; }

    get dtype() { return Uint8Array; }

    setData(data: Uint8Array, byteOffset: number = 0): void {
        if (byteOffset < 0) {
            throw new Error(`Offset must be greater than or equal to zero.`);
        }

        if (data.byteLength + byteOffset > this._data.byteLength) {
            throw new Error(`Data size is too large for current buffer`);
        }

        this._data.set(data, byteOffset);
    }

    static fromRaw(raw: BufferType): GLTFBuffer {
        const data = new Uint8Array(raw.byteLength);

        for (let i = 0; i < raw.byteLength; i++) {
            data[i] = raw.uri.charCodeAt(i);
        }

        return new GLTFBuffer(data);
    }

    toRaw(): BufferType {

        const uri = `data:application/octet-stream;base64,${Buffer.from(this._data).toString('base64')}`;

        return {
            uri: uri,
            byteLength: this._data.length
        };
    }

    slice(begin: number, end?: number | undefined): ArrayBuffer {
        return this._data.slice(begin, end);
    }
}