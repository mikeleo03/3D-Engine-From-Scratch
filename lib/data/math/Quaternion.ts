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

    static fromEuler(v: Vector3): Quaternion {
        const c1 = Math.cos(v.X / 2);
        const c2 = Math.cos(v.Y / 2);
        const c3 = Math.cos(v.Z / 2);
        const s1 = Math.sin(v.X / 2);
        const s2 = Math.sin(v.Y / 2);
        const s3 = Math.sin(v.Z / 2);

        return new Quaternion(
            s1 * c2 * c3 + c1 * s2 * s3,
            c1 * s2 * c3 - s1 * c2 * s3,
            c1 * c2 * s3 + s1 * s2 * c3,
            c1 * c2 * c3 - s1 * s2 * s3
        );
    }

    static fromDegrees(x: number, y: number, z: number): Quaternion {
        const euler = new Vector3(x, y, z).mul(Math.PI / 180);

        return Quaternion.fromEuler(euler);
    }

    static fromMatrix4(m: Matrix4): Quaternion {
        const m00 = m.get(0, 0);
        const m01 = m.get(0, 1);
        const m02 = m.get(0, 2);
        const m10 = m.get(1, 0);
        const m11 = m.get(1, 1);
        const m12 = m.get(1, 2);
        const m20 = m.get(2, 0);
        const m21 = m.get(2, 1);
        const m22 = m.get(2, 2);

        const trace = m00 + m11 + m22;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);

            return new Quaternion(
                (m21 - m12) * s,
                (m02 - m20) * s,
                (m10 - m01) * s,
                0.25 / s
            );
        } else if (m00 > m11 && m00 > m22) {
            const s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);

            return new Quaternion(
                0.25 * s,
                (m01 + m10) / s,
                (m02 + m20) / s,
                (m21 - m12) / s
            );
        } else if (m11 > m22) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);

            return new Quaternion(
                (m01 + m10) / s,
                0.25 * s,
                (m12 + m21) / s,
                (m02 - m20) / s
            );
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);

            return new Quaternion(
                (m02 + m20) / s,
                (m12 + m21) / s,
                0.25 * s,
                (m10 - m01) / s
            );
        }
    }

    static mul(q1: Quaternion, q2: Quaternion): Quaternion {
        const x = q1._x * q2._w + q1._y * q2._z - q1._z * q2._y + q1._w * q2._x;
        const y = -q1._x * q2._z + q1._y * q2._w + q1._z * q2._x + q1._w * q2._y;
        const z = q1._x * q2._y - q1._y * q2._x + q1._z * q2._w + q1._w * q2._z;
        const w = -q1._x * q2._x - q1._y * q2._y - q1._z * q2._z + q1._w * q2._w;

        return new Quaternion(x, y, z, w);
    }

    set(x: number, y: number, z: number, w: number): void {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
    }

    setFromEuler(v: Vector3): void {
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
    }

    setFromMatrix4(m: Matrix4): void {
        const m00 = m.get(0, 0);
        const m01 = m.get(0, 1);
        const m02 = m.get(0, 2);
        const m10 = m.get(1, 0);
        const m11 = m.get(1, 1);
        const m12 = m.get(1, 2);
        const m20 = m.get(2, 0);
        const m21 = m.get(2, 1);
        const m22 = m.get(2, 2);

        const trace = m00 + m11 + m22;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);

            this._w = 0.25 / s;
            this._x = (m21 - m12) * s;
            this._y = (m02 - m20) * s;
            this._z = (m10 - m01) * s;
        } else if (m00 > m11 && m00 > m22) {
            const s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);

            this._x = 0.25 * s;
            this._y = (m01 + m10) / s;
            this._z = (m02 + m20) / s;
            this._w = (m21 - m12) / s;
        } else if (m11 > m22) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);

            this._x = (m01 + m10) / s;
            this._y = 0.25 * s;
            this._z = (m12 + m21) / s;
            this._w = (m02 - m20) / s;
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);

            this._x = (m02 + m20) / s;
            this._y = (m12 + m21) / s;
            this._z = 0.25 * s;
            this._w = (m10 - m01) / s;
        }
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

    toEuler(): Vector3 {
        const x = this._x;
        const y = this._y;
        const z = this._z;
        const w = this._w;

        const t0 = 2 * (w * x + y * z);
        const t1 = 1 - 2 * (x * x + y * y);
        const X = Math.atan2(t0, t1);

        let t2 = 2 * (w * y - z * x);
        t2 > 1 && (t2 = 1);
        t2 < -1 && (t2 = -1);
        const Y = Math.asin(t2);

        const t3 = 2 * (w * z + x * y);
        const t4 = 1 - 2 * (y * y + z * z);
        const Z = Math.atan2(t3, t4);

        return new Vector3(X, Y, Z);
    }

    toDegrees(): Vector3 {
        const v = this.toEuler();
        return new Vector3(v.X * 180 / Math.PI, v.Y * 180 / Math.PI, v.Z * 180 / Math.PI);
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

    toArray(): [number, number, number, number] {
        return [this._x, this._y, this._z, this._w];
    }

    conjugate(inplace: Boolean = false): Quaternion {
        if (inplace) {
            this._x = -this._x;
            this._y = -this._y;
            this._z = -this._z;
            return this;
        }

        return new Quaternion(-this._x, -this._y, -this._z, this._w);
    }

    mul(q: Quaternion, inplace: Boolean = false): Quaternion {
        const x = this._x * q._w + this._y * q._z - this._z * q._y + this._w * q._x;
        const y = -this._x * q._z + this._y * q._w + this._z * q._x + this._w * q._y;
        const z = this._x * q._y - this._y * q._x + this._z * q._w + this._w * q._z;
        const w = -this._x * q._x - this._y * q._y - this._z * q._z + this._w * q._w;

        if (inplace) {
            this._x = x;
            this._y = y;
            this._z = z;
            this._w = w;
            return this;
        }

        return new Quaternion(x, y, z, w);
    }

    rotate(v: Vector3, inplace: Boolean = false): Vector3 {
        const q = this.normalize();
        const p = new Quaternion(v.X, v.Y, v.Z, 0);
        const qInv = q.conjugate();

        const result = q.mul(p).mul(qInv);

        if (inplace) {
            v.X = result._x;
            v.Y = result._y;
            v.Z = result._z;
            return v;
        }

        return new Vector3(result._x, result._y, result._z);
    }

    rotateX(angle: number, inplace: Boolean = false): Quaternion {
        const halfAngle = angle / 2;
        const q = new Quaternion(Math.sin(halfAngle), 0, 0, Math.cos(halfAngle));

        return this.mul(q, inplace);
    }

    rotateY(angle: number, inplace: Boolean = false): Quaternion {
        const halfAngle = angle / 2;
        const q = new Quaternion(0, Math.sin(halfAngle), 0, Math.cos(halfAngle));

        return this.mul(q, inplace);
    }

    rotateZ(angle: number, inplace: Boolean = false): Quaternion {
        const halfAngle = angle / 2;
        const q = new Quaternion(0, 0, Math.sin(halfAngle), Math.cos(halfAngle));

        return this.mul(q, inplace);
    }
}