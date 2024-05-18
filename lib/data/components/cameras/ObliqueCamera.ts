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
        zoom: number = 1,
        angleX: number = 15,
        angleY: number = 15
    ) {
        super(CameraTypeString.OBLIQUE, zoom);

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
        const top = this._top / this.zoom;
        const bottom = this._bottom / this.zoom;
        const left = this._left / this.zoom;
        const right = this._right / this.zoom;

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
                angleX: this._angleX,
                angleY: this._angleY,
                zoom: this.zoom
            }
        };
    }
}