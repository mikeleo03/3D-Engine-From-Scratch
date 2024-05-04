export abstract class TypedArrayConverter {
    abstract from(array: Uint8Array): ArrayLike<number>;
    abstract tobytes(array: ArrayLike<number>): Uint8Array;
}

export class Float32ArrayConverter extends TypedArrayConverter {
    from(array: Uint8Array): Float32Array {
        if (array.length % 4 !== 0) {
            throw new Error('Invalid array length');
        }

        const float32Array = new Float32Array(array.length / 4);

        for (let i = 0; i < array.length; i += 4) {
            const view = new DataView(array.buffer, i, 4);
            float32Array[i / 4] = view.getFloat32(0, true);
        }

        return float32Array;
    }

    tobytes(array: Float32Array): Uint8Array {
        const buffer = new ArrayBuffer(array.length * 4);
        const view = new DataView(buffer);

        for (let i = 0; i < array.length; i++) {
            view.setFloat32(i * 4, array[i], true);
        }

        return new Uint8Array(buffer);
    }
}


export class Uint16ArrayConverter extends TypedArrayConverter {
    from(array: Uint8Array): Uint16Array {
        if (array.length % 2 !== 0) {
            throw new Error('Invalid array length');
        }

        const uint16Array = new Uint16Array(array.length / 2);

        for (let i = 0; i < array.length; i += 2) {
            const view = new DataView(array.buffer, i, 2);
            uint16Array[i / 2] = view.getUint16(0, true);
        }

        return uint16Array;
    }

    tobytes(array: Uint16Array): Uint8Array {
        const buffer = new ArrayBuffer(array.length * 2);
        const view = new DataView(buffer);

        for (let i = 0; i < array.length; i++) {
            view.setUint16(i * 2, array[i], true);
        }

        return new Uint8Array(buffer);
    }  
}

export class Uint32ArrayConverter extends TypedArrayConverter {
    from(array: Uint8Array): Uint32Array {
        if (array.length % 4 !== 0) {
            throw new Error('Invalid array length');
        }

        const uint32Array = new Uint32Array(array.length / 4);

        for (let i = 0; i < array.length; i += 4) {
            const view = new DataView(array.buffer, i, 4);
            uint32Array[i / 4] = view.getUint32(0, true);
        }

        return uint32Array;
    }

    tobytes(array: Uint32Array): Uint8Array {
        const buffer = new ArrayBuffer(array.length * 4);
        const view = new DataView(buffer);

        for (let i = 0; i < array.length; i++) {
            view.setUint32(i * 4, array[i], true);
        }

        return new Uint8Array(buffer);
    }
}


export class Int16ArrayConverter extends TypedArrayConverter {
    from(array: Uint8Array): Int16Array {
        if (array.length % 2 !== 0) {
            throw new Error('Invalid array length');
        }

        const int16Array = new Int16Array(array.length / 2);

        for (let i = 0; i < array.length; i += 2) {
            const view = new DataView(array.buffer, i, 2);
            int16Array[i / 2] = view.getInt16(0, true);
        }

        return int16Array;
    }

    tobytes(array: Int16Array): Uint8Array {
        const buffer = new ArrayBuffer(array.length * 2);
        const view = new DataView(buffer);

        for (let i = 0; i < array.length; i++) {
            view.setInt16(i * 2, array[i], true);
        }

        return new Uint8Array(buffer);
    }  
}

export class Int32ArrayConverter extends TypedArrayConverter {
    from(array: Uint8Array): Int32Array {
        if (array.length % 4 !== 0) {
            throw new Error('Invalid array length');
        }

        const int32Array = new Int32Array(array.length / 4);

        for (let i = 0; i < array.length; i += 4) {
            const view = new DataView(array.buffer, i, 4);
            int32Array[i / 4] = view.getInt32(0, true);
        }

        return int32Array;
    }

    tobytes(array: Int32Array): Uint8Array {
        const buffer = new ArrayBuffer(array.length * 4);
        const view = new DataView(buffer);

        for (let i = 0; i < array.length; i++) {
            view.setInt32(i * 4, array[i], true);
        }

        return new Uint8Array(buffer);
    }
}