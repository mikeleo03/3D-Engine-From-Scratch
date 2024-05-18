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
        // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

        const m11 = m.get(0, 0), m12 = m.get(0, 1), m13 = m.get(0, 2);
        const m21 = m.get(1, 0), m22 = m.get(1, 1), m23 = m.get(1, 2);
        const m31 = m.get(2, 0), m32 = m.get(2, 1), m33 = m.get(2, 2);

		const trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			const s = 0.5 / Math.sqrt( trace + 1.0 );

			const w = 0.25 / s;
			const x = ( m32 - m23 ) * s;
			const y = ( m13 - m31 ) * s;
			const z = ( m21 - m12 ) * s;

            return new Quaternion(x, y, z, w).normalize();

		} else if ( m11 > m22 && m11 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			const w = ( m32 - m23 ) / s;
			const x = 0.25 * s;
			const y = ( m12 + m21 ) / s;
			const z = ( m13 + m31 ) / s;

            return new Quaternion(x, y, z, w).normalize();

		} else if ( m22 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			const w = ( m13 - m31 ) / s;
			const x = ( m12 + m21 ) / s;
			const y = 0.25 * s;
			const z = ( m23 + m32 ) / s;

            return new Quaternion(x, y, z, w).normalize();

		} else {

			const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			const w = ( m21 - m12 ) / s;
			const x = ( m13 + m31 ) / s;
			const y = ( m23 + m32 ) / s;
			const z = 0.25 * s;

            return new Quaternion(x, y, z, w).normalize();
		}
    }

    static mul(q1: Quaternion, q2: Quaternion): Quaternion {
        const x = q1._x * q2._w + q1._y * q2._z - q1._z * q2._y + q1._w * q2._x;
        const y = -q1._x * q2._z + q1._y * q2._w + q1._z * q2._x + q1._w * q2._y;
        const z = q1._x * q2._y - q1._y * q2._x + q1._z * q2._w + q1._w * q2._z;
        const w = -q1._x * q2._x - q1._y * q2._y - q1._z * q2._z + q1._w * q2._w;

        return new Quaternion(x, y, z, w);
    }

    static lookAt(eye: Vector3, target: Vector3, up: Vector3): Quaternion {
        // todo: FIX THIS, consider front as z negative
        const matrix = Matrix4.lookAt(eye, target, up);
        return Quaternion.fromMatrix4(matrix);
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

        this.normalize();
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

        this.normalize();
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
        const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

        const x = this._x;
        const y = this._y;
        const z = this._z;
        const w = this._w;

        const matrix = new Float32Array(16);

        const xx = x * x, yy = y * y, zz = z * z;
        const xy = x * y, zw = z * w, zx = z * x, yw = y * w, yz = y * z, xw = x * w;

        matrix[ 0 ] = 1 - 2 * ( yy + zz );
        matrix[ 4 ] = 2 * ( xy - zw );
        matrix[ 8 ] = 2 * ( zx + yw );
        matrix[ 1 ] = 2 * ( xy + zw );
        matrix[ 5 ] = 1 - 2 * ( zz + xx );
        matrix[ 9 ] = 2 * ( yz - xw );
        matrix[ 2 ] = 2 * ( zx - yw );
        matrix[ 6 ] = 2 * ( yz + xw );
        matrix[ 10 ] = 1 - 2 * ( yy + xx );

        // Extract Euler angles from the rotation matrix in XYZ order
        const te = matrix;
        const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
        const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
        const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

        let _x, _y, _z;

        _y = Math.asin(clamp(m13, -1, 1));

        if (Math.abs(m13) < 0.9999999) {
            _x = Math.atan2(-m23, m33);
            _z = Math.atan2(-m12, m11);
        } else {
            _x = Math.atan2(m32, m22);
            _z = 0;
        }

        return new Vector3(_x, _y, _z);
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

    rotateX(angle: number, inplace: Boolean = false): Quaternion {
        const halfAngle = angle / 2;
        const q = new Quaternion(Math.sin(halfAngle), 0, 0, Math.cos(halfAngle));

        return this.mul(q, inplace).normalize();
    }

    rotateY(angle: number, inplace: Boolean = false): Quaternion {
        const halfAngle = angle / 2;
        const q = new Quaternion(0, Math.sin(halfAngle), 0, Math.cos(halfAngle));

        return this.mul(q, inplace).normalize();
    }

    rotateZ(angle: number, inplace: Boolean = false): Quaternion {
        const halfAngle = angle / 2;
        const q = new Quaternion(0, 0, Math.sin(halfAngle), Math.cos(halfAngle));

        return this.mul(q, inplace).normalize();
    }

    rotateVector(v: Vector3): Vector3 {
        const q = new Quaternion(v.X, v.Y, v.Z, 0);
        const qInv = this.conjugate();
        const qRot = this.mul(q.mul(qInv));

        return new Vector3(qRot.X, qRot.Y, qRot.Z);
    }

    lookAt(from: Vector3, target: Vector3, up: Vector3, inplace: boolean = false): Quaternion {
        const newQuaternion = Quaternion.lookAt(from, target, up);
        if (inplace) {
            this._x = newQuaternion._x;
            this._y = newQuaternion._y;
            this._z = newQuaternion._z;
            this._w = newQuaternion._w;
            return this;
        }

        return newQuaternion;
    }
}