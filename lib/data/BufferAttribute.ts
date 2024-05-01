type TypedArray = Float32Array | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;


export class BufferAttribute {
    private _data: TypedArray;
    private _size: number;
    private _dtype: number;
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
        data: TypedArray,
        size: number,
        options: {
            dtype?: number,
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

        this._data = data;
        this._size = size;
        this._dtype = options.dtype || WebGLRenderingContext.FLOAT;
        this._normalize = options.normalize || false;
        this._stride = options.stride || size;
        this._offset = offset;
    }


    // Public get accessor to private properties.
    get data() { return this._data; }
    get size() { return this._size; }
    get dtype() { return this._dtype; }
    get normalize() { return this._normalize; }
    get stride() { return this._stride; }
    get offset() { return this._offset; }
    get isDirty() { return this._isDirty; }
    // Public set accessor to private properties.
    // Should toggle isDirty flag to true.
    set data(data: TypedArray) {
        this._data = data;
        this._isDirty = true;
    }
    set size(size: number) {
        if (size < 1) {
            throw new Error(`Size must be greater than zero.`);
        }

        if (this._stride < size) {
            throw new Error(`Stride must be greater than or equal to size.`);
        }

        if (this._offset + size > this._data.length) {
            throw new Error(`Size is too large for current offset and data length.`);
        }

        this._size = size;
        this._isDirty = true;

        if (this._stride < this._size) {
            this._stride = this._size;
        }
    }
    set dtype(dtype: number) {
        this._dtype = dtype;
        this._isDirty = true;
    }
    set normalize(normalize: boolean) {
        this._normalize = normalize;
        this._isDirty = true;
    }
    set stride(stride: number) {
        if (stride < this._size) {
            throw new Error(`Stride must be greater than or equal to size.`);
        }

        if (stride + this._offset > this._data.length) {
            throw new Error(`Stride is too large for current offset and data length.`);
        }

        const lengthWithStride = this._data.length - this._offset - this._size;

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
        if (offset < 0) {
            throw new Error(`Offset must be greater than or equal to zero.`);
        }

        if (offset + this.stride > this._data.length) {
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
        // account for stride, take note that no padding at the end of the buffer
        const lengthWithStride = this._data.length - this._offset - this._size;

        if (lengthWithStride < 0) {
            return 0;
        }

        return lengthWithStride / this._stride + 1;
    }


    /**
     * Panjang dari buffer (data.length = elemen * size).
     */
    get length(): number {
        return this._data.length;
    }


    set(index: number, data: number[]) {
        if (data.length !== this._size) {
            throw new Error(`Data size mismatch. Expected ${this._size}, got ${data.length}`);
        }

        this._isDirty = true;

        const stride = this._stride;
        const offset = this._offset;
        const dataSize = data.length;

        const baseOffset = offset + (index * stride);

        if (baseOffset + dataSize > this._data.length) {
            throw new Error(`Index out of range. Buffer size is ${this._data.length}, got ${baseOffset + dataSize}`);
        }

        for (let i = 0; i < dataSize; i++) {
            this._data[baseOffset + i] = data[i];
        }
    }


    get(index: number, size?: number) {
        const dataSize = size || this._size;
        const stride = this._stride;
        const offset = this._offset;
        const baseIndex = index * stride + offset;

        const data: number[] = [];

        for (let i = 0; i < dataSize; i++) {
            const bufferIndex = baseIndex + i;

            // Make sure bufferIndex is within the bounds of the data
            if (bufferIndex >= 0 && bufferIndex < this._data.length) {
                data.push(this._data[bufferIndex]);
            } else {
                // Handle out-of-bounds access
                throw new Error(`Index out of range. Buffer size is ${this._data.length}, got ${bufferIndex}`);
            }
        }

        return data;
    }
}


