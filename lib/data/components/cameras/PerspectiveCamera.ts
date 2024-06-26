import { Matrix4 } from "../../math/Matrix4";
import { CameraType, CameraTypeString } from "../../types/gltftypes";
import { Camera } from "./Camera";

export class PerspectiveCamera extends Camera {
    private _aspectRatio: number;
    private _near: number;
    private _far: number;
    private _yfov: number;

    constructor(aspectRatio: number, yfov: number, near: number, far: number, zoom: number = 1) {
        super(CameraTypeString.PERSPECTIVE, zoom);

        this._aspectRatio = aspectRatio;
        this._yfov = yfov;
        this._near = near;
        this._far = far;
    }

    get aspectRatio(): number {
        return this._aspectRatio;
    }

    get yfov(): number {
        return this._yfov;
    }

    get near(): number {
        return this._near;
    }

    get far(): number {
        return this._far;
    }

    set aspectRatio(aspectRatio: number) {
        this._aspectRatio = aspectRatio;
    }

    set yfov(yfov: number) {
        this._yfov = yfov;
    }

    set near(near: number) {
        this._near = near;
    }

    set far(far: number) {
        this._far = far;
    }

    protected override updateProjectionMatrix() {
        const yfov = this._yfov / this.zoom; 

        this.projectionMatrix = Matrix4.perspective(
            this._aspectRatio, yfov, this._near, this._far,
        );

    }

    override toRaw(): CameraType {
        return {
            type: CameraTypeString.PERSPECTIVE,
            perspective: {
                aspectRatio: this._aspectRatio,
                yfov: this._yfov,
                znear: this._near,
                zfar: this._far,
                zoom: this.zoom,
            },
        };
    }
}