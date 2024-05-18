import { Quaternion } from "./Quaternion";
import { Vector3 } from "./Vector";

export class Matrix4 {
    private _data: number[][] = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    constructor(data: number[][] | null = null) {
        if (data) {
            if (data.length !== 4) {
                throw new Error("Invalid matrix dimension");
            }

            for (let i = 0; i < 4; i++) {
                if (data[i].length !== 4) {
                    throw new Error("Invalid matrix dimension");
                }
            }

            this._data = data;
        }
    }

    static identity(): Matrix4 {
        return new Matrix4([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
    }

    static translation3d(v: Vector3): Matrix4 {
        return new Matrix4([
            [1, 0, 0, v.X],
            [0, 1, 0, v.Y],
            [0, 0, 1, v.Z],
            [0, 0, 0, 1]
        ]);
    }

    static rotation3d(v: Vector3): Matrix4 {
        // use quaternion
        const q = new Quaternion();

        q.setFromEuler(v);
        q.normalize();

        return q.toMatrix4();
    }

    static scale3d(v: Vector3): Matrix4 {
        return new Matrix4([
            [v.X, 0, 0, 0],
            [0, v.Y, 0, 0],
            [0, 0, v.Z, 0],
            [0, 0, 0, 1]
        ]);
    }

    static add(...matrices: Matrix4[]): Matrix4 {
        const result = new Matrix4();

        for (let i = 0; i < matrices.length; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    result._data[j][k] += matrices[i]._data[j][k];
                }
            }
        }

        return result;
    }

    static sub(m1: Matrix4, m2: Matrix4): Matrix4 {
        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result._data[i][j] = m1._data[i][j] - m2._data[i][j];
            }
        }

        return result;
    }

    static mul(...matrices: Matrix4[]): Matrix4 {
        const result = matrices[0].clone();

        for (let i = 1; i < matrices.length; i++) {
            result.mul(matrices[i], true);
        }

        return result;
    }

    static det(m: Matrix4) {
        const [
            [m00, m01, m02, m03],
            [m10, m11, m12, m13],
            [m20, m21, m22, m23],
            [m30, m31, m32, m33]
        ] = m.data;
        return (
            m03 * m12 * m21 * m30 - m02 * m13 * m21 * m30 - m03 * m11 * m22 * m30 + m01 * m13 * m22 * m30 +
            m02 * m11 * m23 * m30 - m01 * m12 * m23 * m30 - m03 * m12 * m20 * m31 + m02 * m13 * m20 * m31 +
            m03 * m10 * m22 * m31 - m00 * m13 * m22 * m31 - m02 * m10 * m23 * m31 + m00 * m12 * m23 * m31 +
            m03 * m11 * m20 * m32 - m01 * m13 * m20 * m32 - m03 * m10 * m21 * m32 + m00 * m13 * m21 * m32 +
            m01 * m10 * m23 * m32 - m00 * m11 * m23 * m32 - m02 * m11 * m20 * m33 + m01 * m12 * m20 * m33 +
            m02 * m10 * m21 * m33 - m00 * m12 * m21 * m33 - m01 * m10 * m22 * m33 + m00 * m11 * m22 * m33
        );
    }

    static inv(m: Matrix4) {
        const [
            [m00, m01, m02, m03],
            [m10, m11, m12, m13],
            [m20, m21, m22, m23],
            [m30, m31, m32, m33]
        ] = m.data;

        const s = 1 / Matrix4.det(m);
        return new Matrix4([
            [(m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33) * s,
            (m03 * m22 * m31 - m02 * m23 * m31 - m03 * m21 * m32 + m01 * m23 * m32 + m02 * m21 * m33 - m01 * m22 * m33) * s,
            (m02 * m13 * m31 - m03 * m12 * m31 + m03 * m11 * m32 - m01 * m13 * m32 - m02 * m11 * m33 + m01 * m12 * m33) * s,
            (m03 * m12 * m21 - m02 * m13 * m21 - m03 * m11 * m22 + m01 * m13 * m22 + m02 * m11 * m23 - m01 * m12 * m23) * s],
            [(m13 * m22 * m30 - m12 * m23 * m30 - m13 * m20 * m32 + m10 * m23 * m32 + m12 * m20 * m33 - m10 * m22 * m33) * s,
            (m02 * m23 * m30 - m03 * m22 * m30 + m03 * m20 * m32 - m00 * m23 * m32 - m02 * m20 * m33 + m00 * m22 * m33) * s,
            (m03 * m12 * m30 - m02 * m13 * m30 - m03 * m10 * m32 + m00 * m13 * m32 + m02 * m10 * m33 - m00 * m12 * m33) * s,
            (m02 * m13 * m20 - m03 * m12 * m20 + m03 * m10 * m22 - m00 * m13 * m22 - m02 * m10 * m23 + m00 * m12 * m23) * s],
            [(m11 * m23 * m30 - m13 * m21 * m30 + m13 * m20 * m31 - m10 * m23 * m31 - m11 * m20 * m33 + m10 * m21 * m33) * s,
            (m03 * m21 * m30 - m01 * m23 * m30 - m03 * m20 * m31 + m00 * m23 * m31 + m01 * m20 * m33 - m00 * m21 * m33) * s,
            (m01 * m13 * m30 - m03 * m11 * m30 + m03 * m10 * m31 - m00 * m13 * m31 - m01 * m10 * m33 + m00 * m11 * m33) * s,
            (m03 * m11 * m20 - m01 * m13 * m20 - m03 * m10 * m21 + m00 * m13 * m21 + m01 * m10 * m23 - m00 * m11 * m23) * s],
            [(m12 * m21 * m30 - m11 * m22 * m30 - m12 * m20 * m31 + m10 * m22 * m31 + m11 * m20 * m32 - m10 * m21 * m32) * s,
            (m01 * m22 * m30 - m02 * m21 * m30 + m02 * m20 * m31 - m00 * m22 * m31 - m01 * m20 * m32 + m00 * m21 * m32) * s,
            (m02 * m11 * m30 - m01 * m12 * m30 - m02 * m10 * m31 + m00 * m12 * m31 + m01 * m10 * m32 - m00 * m11 * m32) * s,
            (m01 * m12 * m20 - m02 * m11 * m20 + m02 * m10 * m21 - m00 * m12 * m21 - m01 * m10 * m22 + m00 * m11 * m22) * s],
        ]);
    }

    get data(): number[][] {
        // make sure to return a copy of the data
        return this._data.map(row => row.slice());
    }

    get buffer(): Float32Array {
        const buffer = new Float32Array(16);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                buffer[i * 4 + j] = this._data[i][j];
            }
        }

        return buffer;
    }

    clone() {
        return new Matrix4(this._data);
    }

    add(m: Matrix4, inplace: Boolean = false): Matrix4 {
        if (inplace) {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    this._data[i][j] += m._data[i][j];
                }
            }

            return this;
        }

        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result._data[i][j] = this._data[i][j] + m._data[i][j];
            }
        }

        return result;
    }

    sub(m: Matrix4, inplace: Boolean = false): Matrix4 {
        if (inplace) {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    this._data[i][j] -= m._data[i][j];
                }
            }

            return this;
        }

        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result._data[i][j] = this._data[i][j] - m._data[i][j];
            }
        }

        return result;
    }

    mul(m: Matrix4, inplace: Boolean = false): Matrix4 {
        if (inplace) {
            const result = new Matrix4();

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    result._data[i][j] = 0;
                    for (let k = 0; k < 4; k++) {
                        result._data[i][j] += this._data[i][k] * m._data[k][j];
                    }
                }
            }

            this._data = result._data;
            return this;
        }

        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result._data[i][j] = 0;
                for (let k = 0; k < 4; k++) {
                    result._data[i][j] += this._data[i][k] * m._data[k][j];
                }
            }
        }

        return result;
    }

    translate(v: Vector3, inplace: Boolean = false): Matrix4 {
        return this.mul(Matrix4.translation3d(v), inplace);
    }

    dilate(v: Vector3, inplace: Boolean = false): Matrix4 {
        return this.mul(Matrix4.scale3d(v), inplace);
    }

    transpose(): Matrix4 {
        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result._data[i][j] = this._data[j][i];
            }
        }

        return result;
    }

    get(row: number, col: number): number {
        if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            throw new Error("Invalid row or column");
        }

        return this._data[row][col];
    }

    static perspective(aspectRatio: number, yfov: number, near: number, far: number) {
        const f = 1.0 / Math.tan(0.5 * yfov * Math.PI / 180);
        const nf = 1 / (near - far);

        return new Matrix4([
            [f / aspectRatio, 0, 0, 0],
            [0, f, 0,  0],
            [0, 0, (far + near) * nf, -1],
            [0, 0, (2 * far * near) * nf,  0],
        ]);
    }

    static orthographic(top: number, bottom: number, left: number, right: number, near: number, far: number) {
        const a = 1 / (right - left);
        const b = 1 / (top - bottom);
        const c = 1 / (near - far);
        return new Matrix4([
            [2 * a, 0, 0, 0],
            [0, 2 * b, 0, 0],
            [0, 0, 2 * c, 0],
            [(left + right) * -1 * a, (top + bottom) * -1 * b, (far + near) * c, 1],
        ]);
    }

    private static recalculateAngle(angle: number): number {
        if (angle < 0) {
            return -90 - angle;
        }

        return 90 - angle;
    }

    static oblique(
        top: number, 
        bottom: number, 
        left: number, 
        right: number, 
        near: number, 
        far: number, 
        angleX: number, 
        angleY: number
    ) {
        
        // shear in z axis and project baed on orthographic

        // check and recalculate angle

        if (angleX < -90 || angleX > 90) {
            throw new Error('angleX must be in range -90 to 90');
        }

        if (angleY < -90 || angleY > 90) {
            throw new Error('angleY must be in range -90 to 90');
        }

        angleX = Matrix4.recalculateAngle(angleX);
        angleY = Matrix4.recalculateAngle(angleY);

        angleX *= Math.PI / 180;
        angleY *= Math.PI / 180;
        return Matrix4.mul(
            new Matrix4([
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [-1 / Math.tan(angleX), -1 / Math.tan(angleY), 1, 0],
                [0, 0, 0, 1],
            ]),
            Matrix4.orthographic(top, bottom, left, right, near, far),
        );
    }
}