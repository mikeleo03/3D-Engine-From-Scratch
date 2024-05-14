import { Accessor } from "./Accessor";
import { TypedArrayConverter } from "./typedarrayconverters";

export class MeshBufferAttribute {
    private _accessor: Accessor;
    private _size: number;
    private _converter: TypedArrayConverter;
    private _normalize = false;
    private _stride = 0;
    private _offset = 0;

    /**
     * Creates an instance of BufferAttribute.
     * @param {TypedArray} data Typed array data.
     * @param {number} size Size of each element in the buffer.
     * @param {object} options Options for attribute.
     * @memberof BufferAttribute
     */
    constructor(
        accessor: Accessor,
        size: number,
        conveter: TypedArrayConverter,
        options: {
            normalize?: boolean,
            stride?: number,
            offset?: number,
        } = {},
    ) {
        if (options.offset && options.offset < 0) {
            throw new Error(`Offset must be greater than or equal to zero.`);
            
        }

        const data = accessor.getData(conveter);

        if (size < 1) {
            throw new Error(`Size must be greater than zero.`);
        }

        if (size > data.length) {
            throw new Error(`Buffer size is too small for current offset and data length.`);
        }

        if (options.stride && options.stride < size) {
            throw new Error(`Stride must be greater than or equal to size`);
        }
        
        this._accessor = accessor;
        this._size = size;
        this._converter = conveter;
        this._normalize = options.normalize || false;
        this._stride = options.stride || this._size;
        this._offset = options.offset || 0;
    }

    get accessor() { return this._accessor; }
    get data() {
        // NOTE: This creates a new array every time it's called.
        return this.accessor.getData(this._converter, this._offset);
    }
    get dtype() { return this._accessor.componentType; }
    get size() {
        return this._size;
    }
    get normalize() { return this._normalize; }
    get stride() { return this._stride; }
    get offset() { return this._offset; }

    getSingleElementByteCount() {
        return this._accessor.getSingleElementByteCount();
    }

    // Should toggle isDirty flag to true.
    setData(data: ArrayLike<number>) {
        const bytes = this._converter.tobytes(data);
        const arrays = this._converter.from(bytes);

        if (arrays.length !== this._accessor.count - this._offset) {
            throw new Error(`Data size does not match accessor count and offset.`);
        }

        this._accessor.setData(bytes, this._offset);
    }
    set size(size: number) {
        if (size < 1) {
            throw new Error(`Size must be greater than zero.`);
        }

        if (this._stride < size) {
            throw new Error(`Stride must be greater than or equal to size.`);
        }

        this._size = size;

        if (this._stride < this._size) {
            this._stride = this._size;
        }
    }
    set normalize(normalize: boolean) {
        this._normalize = normalize;
    }
    set stride(stride: number) {
        if (stride < this._size) {
            throw new Error(`Stride must be greater than or equal to size.`);
        }

        this._stride = stride;
    }
    set offset(offset: number) {
        if (offset < 0) {
            throw new Error(`Offset must be greater than or equal to zero.`);
        }

        this._offset = offset;
    }


    /**
     * Tandai buffer sebagai bersih
     * (tidak perlu di-copy kembali ke GPU)
     *
     * Hanya dipanggil pada attribute setter.
     */


    /**
     * Jumlah elemen dalam buffer
     */
    get count(): number {
        const data = this.data;
        return data.length / this._size;
    }


    /**
     * Panjang dari buffer (data.length = elemen * size).
     */
    get length(): number {
        return this.data.length;
    }


    set(index: number, data: ArrayLike<number>): void {
        if (data.length !== this._size) {
            throw new Error(`Data size mismatch. Expected ${this._size}, got ${data.length}`);
        }

        const dataSize = data.length;
        const currentData = this.data;

        let baseOffset = index * this.size;

        if (baseOffset + dataSize > currentData.length) {
            throw new Error(`Index out of range.`);
        }

        const bytes = this._converter.tobytes(data);
        const singleElementByteCount = this.getSingleElementByteCount();
        const singleByteCount = singleElementByteCount * this._size;

        for (let i = 0; i < dataSize; i += singleByteCount) {
            const newElementArray = bytes.slice(i, i + singleByteCount);
            this._accessor.setData(newElementArray, baseOffset + i);
        }
    }


    get(index: number, size?: number): number[] {
        const dataSize = size || this._size;

        if (index < 0) {
            throw new Error(`Index must be greater than or equal to zero.`);
        }

        if (dataSize < 1) {
            throw new Error(`Size must be greater than zero.`);
        }

        const baseIndex = index * this.size;
        
        const data = this.data;

        if (baseIndex + dataSize > data.length) {
            throw new Error(`Index out of range.`);
        }
    
        const result: number[] = [];

        for (let i = 0; i < dataSize; i++) {
            const bufferIndex = baseIndex + i;
            result.push(data[bufferIndex]);
        
        }

        return result;
    }
}


