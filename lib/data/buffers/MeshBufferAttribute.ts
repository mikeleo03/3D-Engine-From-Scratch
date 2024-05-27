import { getByteCountForWebGLType } from "@/lib/cores/gltypes";
import { Accessor } from "./Accessor";
import { TypedArrayConverter } from "./typedarrayconverters";

export class MeshBufferAttribute {
    private _accessor: Accessor;
    private _size: number;
    private _converter: TypedArrayConverter;
    private _normalize = false;
    private _stride = 0;
    private _offset = 0;

    private _isDirty = true; // kita copy atribut minimal sekali di awal terlebih dahulu


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
        if (options.offset) {
            if (options.offset < 0) {
                throw new Error(`Offset must be greater than or equal to zero.`);
            }
        }

        const offset = options.offset ?? 0;
        const data = accessor.getData(conveter);

        if (size < 1) {
            throw new Error(`Size must be greater than zero.`);
        }

        if (size + offset > data.length) {
            throw new Error(`Buffer size is too small for current offset and data length.`);
        }

        if (options.stride) {
            if (options.stride < size) {
                throw new Error(`Stride must be greater than or equal to size`);
            }

            if (options.stride + offset > data.length) {
                throw new Error(`Stride is too large for current offset and data length.`);
            }

            const lengthWithStride = data.length - offset - size;

            if (lengthWithStride < 0 && lengthWithStride != -size) {
                throw new Error(`Data length does not match size and offset.`);
            }

            if (lengthWithStride % options.stride !== 0) {
                throw new Error(`Data length does not match stride.`);
            }
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
        return this.accessor.getData(this._converter);
    }
    get dtype() { return this._accessor.componentType; }
    get size() {
        return this._size;
    }
    get normalize() { return this._normalize; }
    get stride() { return this._stride; }
    get offset() { return this._offset; }
    get isDirty() { return this._isDirty; }

    getSingleElementByteCount() {
        return this._accessor.getSingleByteCount();
    }

    // Should toggle isDirty flag to true.
    setData(buffer: ArrayBufferLike) {
        const bytes = this._converter.tobytes(buffer);
        const arrays = this._converter.from(bytes);

        if (arrays.length !== this._accessor.count - this._offset) {
            throw new Error(`Data size does not match accessor count and offset.`);
        }

        this._accessor.setData(bytes, this._offset);

        this._isDirty = true;
    }
    set size(size: number) {
        const data = this.data;

        if (size < 1) {
            throw new Error(`Size must be greater than zero.`);
        }

        if (this._stride < size) {
            throw new Error(`Stride must be greater than or equal to size.`);
        }

        if (this._offset + size > data.length) {
            throw new Error(`Size is too large for current offset and data length.`);
        }

        this._size = size;
        this._isDirty = true;

        if (this._stride < this._size) {
            this._stride = this._size;
        }
    }
    set normalize(normalize: boolean) {
        this._normalize = normalize;
        this._isDirty = true;
    }
    set stride(stride: number) {
        if (stride < this._size) {
            throw new Error(`Stride must be greater than or equal to size.`);
        }

        const data = this.data;

        if (stride + this._offset > data.length) {
            throw new Error(`Stride is too large for current offset and data length.`);
        }

        const lengthWithStride = data.length - this._offset - this._size;

        if (lengthWithStride < 0 && lengthWithStride != -this._size) {
            throw new Error(`Data length does not match size and offset.`);
        }

        if (lengthWithStride % stride !== 0) {
            throw new Error(`Data length does not match stride.`);
        }

        this._stride = stride;
        this._isDirty = true;
    }
    set offset(offset: number) {
        const data = this.data;

        if (offset < 0) {
            throw new Error(`Offset must be greater than or equal to zero.`);
        }

        if (offset + this.stride > data.length) {
            throw new Error(`Offset is too large for current stride.`);
        }

        this._offset = offset;
        this._isDirty = true;
    }


    /**
     * Tandai buffer sebagai bersih
     * (tidak perlu di-copy kembali ke GPU)
     *
     * Hanya dipanggil pada attribute setter.
     */
    consume() {
        this._isDirty = false;
    }


    /**
     * Jumlah elemen dalam buffer
     */
    get count(): number {
        const data = this.data;

        // account for stride, take note that no padding at the end of the buffer
        const lengthWithStride = data.length - this._offset - this._size;

        if (lengthWithStride < 0) {
            return 0;
        }

        return lengthWithStride / this._stride + 1;
    }


    /**
     * Panjang dari buffer (data.length = elemen * size).
     */
    get length(): number {
        return this.data.length;
    }


    set(index: number, bufer: ArrayBufferLike): void {
        const data = this._converter.from(this._converter.tobytes(bufer));

        if (data.length !== this._size) {
            throw new Error(`Data size mismatch. Expected ${this._size}, got ${data.length}`);
        }

        this._isDirty = true;

        const stride = this._stride;
        const offset = this._offset;
        const dataSize = data.length;
        const currentData = this.data;

        const baseOffset = offset + (index * stride);

        if (baseOffset + dataSize > currentData.length) {
            throw new Error(`Index out of range. Buffer size is ${currentData.length}, got ${baseOffset + dataSize}`);
        }

        const bytes = this._converter.tobytes(bufer);
        const singleByteCount = this.getSingleElementByteCount();

        for (let i = 0; i < dataSize; i++) {
            // todo: fix byte conversion error
            const newElementArray = new Uint8Array(bytes, i, this._size * singleByteCount);
            this._accessor.setData(newElementArray, baseOffset + i);
        }
    }


    get(index: number, size?: number): number[] {
        const dataSize = size || this._size;
        const stride = this._stride;
        const offset = this._offset;
        const baseIndex = index * stride + offset;
        const data = this.data;

        const result: number[] = [];

        for (let i = 0; i < dataSize; i++) {
            const bufferIndex = baseIndex + i;

            // Make sure bufferIndex is within the bounds of the data
            if (bufferIndex >= 0 && bufferIndex < data.length) {
                result.push(data[bufferIndex]);
            } else {
                // Handle out-of-bounds access
                throw new Error(`Index out of range. Buffer size is ${data.length}, got ${bufferIndex}`);
            }
        }

        return result;
    }
}


