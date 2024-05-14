import { Matrix4 } from "../../math/Matrix4";
import { CameraType } from "../../types/gltftypes";
import { Camera } from "./Camera";

export class OrthographicCamera extends Camera {
    static readonly COMPONENT_NAME: string = "Orthographic Camera";

    private _top: number;
    private _bottom: number;
    private _left: number;
    private _right: number;
    private _near: number;
    private _far: number;
    private _angle: number;

    constructor(top: number, bottom: number, left: number, right: number, near: number, far: number, angle: number = 45) {
        super(Camera.COMPONENT_NAME);

        this._top = top;
        this._bottom = bottom;
        this._left = left;
        this._right = right;
        this._near = near;
        this._far = far;
        this._angle = angle;
        this.updateProjectionMatrix();
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

    updateProjectionMatrix() {
        const d = [
            (this._right - this._left) / (2 * this.zoom),
            (this._top - this._bottom) / (2 * this.zoom),
            (this._right - this._left) / 2,
            (this._top - this._bottom) / 2,
        ];

        this.projectionMatrix = Matrix4.ortographic(
            -(d[2] + d[0]) / 2, (d[2] + d[0]) / 2, -(d[3] + d[1]) / 2, (d[3] + d[1]) / 2,
            this._near, this._far
        );
    }

    override toRaw(): CameraType {
        return {
            type: "orthographic",
            orthographic: {
                top: this._top,
                bottom: this._bottom,
                left: this._left,
                right: this._right,
                znear: this._near,
                zfar: this._far
            }
        };
    }
}