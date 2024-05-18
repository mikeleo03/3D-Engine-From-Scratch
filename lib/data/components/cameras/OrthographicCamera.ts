import { Matrix4 } from "../../math/Matrix4";
import { CameraType, CameraTypeString } from "../../types/gltftypes";
import { Camera } from "./Camera";

export class OrthographicCamera extends Camera {
    private _top: number;
    private _bottom: number;
    private _left: number;
    private _right: number;
    private _near: number;
    private _far: number;
    private _angle: number;

    constructor(top: number, bottom: number, left: number, right: number, near: number, far: number, angle: number = 45) {
        super(CameraTypeString.ORTHOGRAPHIC);

        this._top = top;
        this._bottom = bottom;
        this._left = left;
        this._right = right;
        this._near = near;
        this._far = far;
        this._angle = angle;
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

    get angle(): number {
        return this._angle;
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

    set angle(angle: number) {
        this._angle = angle;
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

        // TODO: leon, kenapa pakai d malah bikin mirror 
        // this.projectionMatrix = Matrix4.orthographic(
        //     -(d[2] + d[0]) / 2, (d[2] + d[0]) / 2, -(d[3] + d[1]) / 2, (d[3] + d[1]) / 2,
        //     this._near, this._far
        // );

        this.projectionMatrix = Matrix4.orthographic(
            top, bottom, left, right, this._near, this._far)
    }

    override toRaw(): CameraType {
        return {
            type: CameraTypeString.ORTHOGRAPHIC,
            orthographic: {
                top: this._top,
                bottom: this._bottom,
                left: this._left,
                right: this._right,
                znear: this._near,
                zfar: this._far,
                angle: this._angle
            }
        };
    }
}