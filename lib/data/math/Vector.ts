export class Vector3 {
    private x;
    private y;
    private z;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get X() { return this.x; }
    get Y() { return this.y; }
    get Z() { return this.z; }

    set X(x) { this.x = x; }
    set Y(y) { this.y = y; }
    set Z(z) { this.z = z; }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    static zero(): Vector3 {
        return new Vector3();
    }

    static one(): Vector3 {
        return new Vector3(1, 1, 1);
    }

    static add(...vectors: Vector3[]): Vector3 {
        let sum = new Vector3();

        for (let i = 0; i < vectors.length; i++) {
            sum.add(vectors[i], true);
        }

        return sum;
    }

    static sub(v1: Vector3, v2: Vector3): Vector3 {
        return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    static mul(v: Vector3, s: number): Vector3 {
        return new Vector3(v.x * s, v.y * s, v.z * s);
    }

    static div(v: Vector3, s: number): Vector3 {
        if (s === 0) {
            throw new Error("Division by zero");
        }

        return new Vector3(v.x / s, v.y / s, v.z / s);
    }

    static dot(v1: Vector3, v2: Vector3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static cross(v1: Vector3, v2: Vector3): Vector3 {
        const x = v1.y * v2.z - v1.z * v2.y;
        const y = v1.z * v2.x - v1.x * v2.z;
        const z = v1.x * v2.y - v1.y * v2.x;

        return new Vector3(x, y, z);
    }

    add(v: Vector3, inplace: Boolean = false): Vector3 {
        if (inplace) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
            return this;
        }

        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v: Vector3, inplace: Boolean = false): Vector3 {
        if (inplace) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
            return this;
        }

        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    mul(s: number, inplace: Boolean = false): Vector3 {
        if (inplace) {
            this.x *= s;
            this.y *= s;
            this.z *= s;
            return this;
        }

        return new Vector3(this.x * s, this.y * s, this.z * s);
    }

    div(s: number, inplace: Boolean = false): Vector3 {
        if (s === 0) {
            throw new Error("Division by zero");
        }

        if (inplace) {
            this.x /= s;
            this.y /= s;
            this.z /= s;
            return this;
        }

        return new Vector3(this.x / s, this.y / s, this.z / s);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(inplace: Boolean = false): Vector3 {
        const len = this.length();

        if (inplace) {
            if (len > 0) {
                this.div(len);
            }
            return this;
        }

        const newVector = this.clone();

        if (len > 0) {
            newVector.div(len);
        }

        return newVector;
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vector3, inplace: Boolean = false): Vector3 {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;

        if (inplace) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }

        return new Vector3(x, y, z);
    }

    toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    toRaw() : number[] {
        return this.toArray();
    }

    static fromRaw(arr: number[]) : Vector3 {
        return new Vector3(...arr);
    }
}