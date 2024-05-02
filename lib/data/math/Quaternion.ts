import { Matrix4 } from "./Matrix4";
import { Vector3 } from "./Vector";

export class Quaternion {
    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
    }

    get X() {
        return this._x;
    }

    get Y() {
        return this._y;
    }

    get Z() {
        return this._z;
    }

    get W() {
        return this._w;
    }

    set X(value: number) {
        this._x = value;
    }

    set Y(value: number) {
        this._y = value;
    }

    set Z(value: number) {
        this._z = value;
    }

    set W(value: number) {
        this._w = value;
    }

    set(x: number, y: number, z: number, w: number): Quaternion {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;

        return this;
    }

    setFromEuler(v: Vector3): Quaternion {
        const c1 = Math.cos(v.X / 2);
        const c2 = Math.cos(v.Y / 2);
        const c3 = Math.cos(v.Z / 2);
        const s1 = Math.sin(v.X / 2);
        const s2 = Math.sin(v.Y / 2);
        const s3 = Math.sin(v.Z / 2);

        this._x = s1 * c2 * c3 + c1 * s2 * s3;
        this._y = c1 * s2 * c3 - s1 * c2 * s3;
        this._z = c1 * c2 * s3 + s1 * s2 * c3;
        this._w = c1 * c2 * c3 - s1 * s2 * s3;

        return this;
    }

    normalize(inplace: Boolean = false): Quaternion {
        const l = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
        if (l === 0) {
            throw new Error("Division by zero");
        }

        if (inplace) {
            this._x /= l;
            this._y /= l;
            this._z /= l;
            this._w /= l;
            return this;
        }

        return new Quaternion(this._x / l, this._y / l, this._z / l, this._w / l);
    }

    toMatrix4(): Matrix4 {
        const x = this._x;
        const y = this._y;
        const z = this._z;
        const w = this._w;

        return new Matrix4([
            [1 - 2 * y * y - 2 * z * z, 2 * x * y - 2 * z * w, 2 * x * z + 2 * y * w, 0],
            [2 * x * y + 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z - 2 * x * w, 0],
            [2 * x * z - 2 * y * w, 2 * y * z + 2 * x * w, 1 - 2 * x * x - 2 * y * y, 0],
            [0, 0, 0, 1]
        ]);
    }

    clone(): Quaternion {
        return new Quaternion(this._x, this._y, this._z, this._w);
    }
}