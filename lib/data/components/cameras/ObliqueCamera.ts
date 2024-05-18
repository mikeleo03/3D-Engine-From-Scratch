import { Matrix4 } from "../../math/Matrix4";
import { CameraType, CameraTypeString } from "../../types/gltftypes";
import { Camera } from "./Camera";

export class ObliqueCamera extends Camera {
    private _top: number;
    private _bottom: number;
    private _left: number;
    private _right: number;
    private _near: number;
    private _far: number;
    private _angleX: number;
    private _angleY: number;

    constructor(
        top: number, 
        bottom: number, 
        left: number, 
        right: number, 
        near: number, 
        far: number, 
        angleX: number = 45,
        angleY: number = 45
    ) {
        super(CameraTypeString.OBLIQUE);

        // check angle in range -90 to 90

        if (angleX < -90 || angleX > 90) {
            throw new Error('angleX must be in range -90 to 90');
        }

        if (angleY < -90 || angleY > 90) {
            throw new Error('angleY must be in range -90 to 90');
        }

        this._top = top;
        this._bottom = bottom;
        this._left = left;
        this._right = right;
        this._near = near;
        this._far = far;
        this._angleX = angleX;
        this._angleY = angleY;
    }

    get top(): number {
        return this._top;
    }

    get bottom(): number {
        return this._bottom;
    }

    get left(): number {
        return this._left;
    }

    get right(): number {
        return this._right;
    }

    get near(): number {
        return this._near;
    }

    get far(): number {
        return this._far;
    }

    get angleX(): number {
        // check angle in range -90 to 90

        if (this._angleX < -90 || this._angleX > 90) {
            throw new Error('angleX must be in range -90 to 90');
        }

        return this._angleX;
    }

    get angleY(): number {
        // check angle in range -90 to 90
        if (this._angleY < -90 || this._angleY > 90) {
            throw new Error('angleY must be in range -90 to 90');
        }

        return this._angleY;
    }

    set top(top: number) {
        this._top = top;
    }

    set bottom(bottom: number) {
        this._bottom = bottom;
    }

    set left(left: number) {
        this._left = left;
    }

    set right(right: number) {
        this._right = right;
    }

    set near(near: number) {
        this._near = near;
    }

    set far(far: number) {
        this._far = far;
    }

    set angleX(angle: number) {
        this._angleX = angle;
    }

    set angleY(angle: number) {
        this._angleY = angle;
    }

    protected override updateProjectionMatrix() {
        const top = this._top;
        const bottom = this._bottom;
        const left = this._left;
        const right = this._right;
        const d = [
            (right - left) / (2 * this.zoom),
            (top - bottom) / (2 * this.zoom),
            (right - left) / 2,
            (top - bottom) / 2,
        ];

        // this.projectionMatrix = Matrix4.oblique(
        //     -(d[2] + d[0]) / 2, (d[2] + d[0]) / 2, -(d[3] + d[1]) / 2, (d[3] + d[1]) / 2,
        //     this._near, this._far,
        //     this._angle, 0.5,
        // );

        this.projectionMatrix = Matrix4.oblique(
            top, bottom, left, right,
            this._near, this._far, this._angleX, this._angleY
        );
    }
    
    override toRaw(): CameraType {
        return {
            type: CameraTypeString.OBLIQUE,
            oblique: {
                top: this._top,
                bottom: this._bottom,
                left: this._left,
                right: this._right,
                znear: this._near,
                zfar: this._far,
                angle: this._angleX
            }
        };
    }
}