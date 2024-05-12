import { Quaternion } from "./Quaternion";
import { Vector3 } from "./Vector";

export class Matrix4 {
    private data: number[][] = [
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

            this.data = data;
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
                    result.data[j][k] += matrices[i].data[j][k];
                }
            }
        }

        return result;
    }

    static sub(m1: Matrix4, m2: Matrix4): Matrix4 {
        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.data[i][j] = m1.data[i][j] - m2.data[i][j];
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

    clone() {
        return new Matrix4(this.data);
    }

    add(m: Matrix4, inplace: Boolean = false): Matrix4 {
        if (inplace) {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    this.data[i][j] += m.data[i][j];
                }
            }

            return this;
        }

        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.data[i][j] = this.data[i][j] + m.data[i][j];
            }
        }

        return result;
    }

    sub(m: Matrix4, inplace: Boolean = false): Matrix4 {
        if (inplace) {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    this.data[i][j] -= m.data[i][j];
                }
            }

            return this;
        }

        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.data[i][j] = this.data[i][j] - m.data[i][j];
            }
        }

        return result;
    }

    mul(m: Matrix4, inplace: Boolean = false): Matrix4 {
        if (inplace) {
            const result = new Matrix4();

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    result.data[i][j] = 0;
                    for (let k = 0; k < 4; k++) {
                        result.data[i][j] += this.data[i][k] * m.data[k][j];
                    }
                }
            }

            this.data = result.data;
            return this;
        }

        const result = new Matrix4();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.data[i][j] = 0;
                for (let k = 0; k < 4; k++) {
                    result.data[i][j] += this.data[i][k] * m.data[k][j];
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
                result.data[i][j] = this.data[j][i];
            }
        }

        return result;
    }

    get(row: number, col: number): number {
        if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            throw new Error("Invalid row or column");
        }

        return this.data[row][col];
    }

    static perspective(yfov: number, aspectRatio: number, near: number, far: number) {
        const f = Math.tan(0.5 * Math.PI * (1 - yfov/180));
        const nf = 1 / (near - far);

        return new Matrix4([
            [f / aspectRatio, 0, 0, 0],
            [0, f, 0,  0],
            [0, 0, (far + near) * nf, -1],
            [0, 0, 2 * far * near * nf,  0],
        ]);
    }
    
    static ortographic(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        const a = 1 / (right - left);
        const b = 1 / (top - bottom);
        const c = 1 / (near - far);
        return new Matrix4([
            [2 * a, 0, 0, 0],
            [0, 2 * b, 0, 0],
            [0, 0, 2 * c, 0],
            [(left + right) * -1 * a, (top + bottom) * -1 * b, (far + near) * -1 * c, 1],
        ]);
    }

    static oblique(left: number, right: number, bottom: number, top: number, near: number, far: number, angle: number, scale=0.5) {
        angle *= Math.PI / 180;
        return Matrix4.ortographic(left, right, bottom, top, near, far).mul(
            new Matrix4([
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [-1 * scale * Math.cos(angle), scale * Math.sin(angle), 1, 0],
                [0, 0, 0, 1],
            ])
        );
    }
}