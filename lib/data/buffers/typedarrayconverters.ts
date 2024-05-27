export abstract class TypedArrayConverter {
    abstract from(buffer: ArrayBufferLike): ArrayLike<number>;
    tobytes(buffer: ArrayBufferLike): Uint8Array {
        // Convert the data to Uint8Array and return
        return new Uint8Array(buffer);
    }
}

export class Float32ArrayConverter extends TypedArrayConverter {
    from(buffer: ArrayBufferLike): Float32Array {
        // Convert the Uint8Array to Float32Array and return
        return new Float32Array(buffer);
    }
}

export class Float64ArrayConverter extends TypedArrayConverter {
    from(buffer: ArrayBufferLike): Float64Array {
        // Convert the Uint8Array to Float64Array and return
        return new Float64Array(buffer);
    }
}

export class Uint8ArrayConverter extends TypedArrayConverter {
    from(buffer: ArrayBufferLike): Uint8Array {
        // Convert the Uint8Array to Uint8Array and return
        return new Uint8Array(buffer);
    }
}

export class Uint16ArrayConverter extends TypedArrayConverter {
    from(buffer: ArrayBufferLike): Uint16Array {
        // Convert the Uint8Array to Uint16Array and return
        return new Uint16Array(buffer);
    }
}

export class Uint32ArrayConverter extends TypedArrayConverter {
    from(buffer: ArrayBufferLike): Uint32Array {
        // Convert the Uint8Array to Uint32Array and return
        return new Uint32Array(buffer);
    }
}

export class Int8ArrayConverter extends TypedArrayConverter {
    from(buffer: ArrayBufferLike): Int8Array {
        // Convert the Uint8Array to Int8Array and return
        return new Int8Array(buffer);
    }
}

export class Int16ArrayConverter extends TypedArrayConverter {
    from(buffer: ArrayBufferLike): Int16Array {
        // Convert the Uint8Array to Int16Array and return
        return new Int16Array(buffer);
    }
}

export class Int32ArrayConverter extends TypedArrayConverter {
    from(buffer: ArrayBufferLike): Int32Array {
        // Convert the Uint8Array to Int32Array and return
        return new Int32Array(buffer);
    }
}