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

    static empty(size: number): GLTFBuffer {
        return new GLTFBuffer(new Uint8Array(size));
    }
    
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

        // read the byte uri
        const byteString = atob(raw.uri.split(',')[1]);

        // write the byte string into the buffer
        for (let i = 0; i < byteString.length; i++) {
            data[i] = byteString.charCodeAt(i);
        }

        return new GLTFBuffer(data);
    }

    toRaw(): BufferType {

        const uri = `data:application/octet-stream;base64,${Buffer.from(this._data.buffer).toString('base64')}`;

        return {
            uri: uri,
            byteLength: this._data.length
        };
    }

    slice(begin: number, end?: number | undefined): ArrayBuffer {
        return this._data.slice(begin, end);
    }
}