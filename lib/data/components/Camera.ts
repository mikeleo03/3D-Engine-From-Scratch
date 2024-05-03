import { CameraType } from "../types/gltftypes";
import { NodeComponent } from "./NodeComponent";

export class Camera extends NodeComponent {
    static readonly COMPONENT_NAME: string = "Camera";

    private _type: string;
    private _aspectRatio: number;
    private _yfov: number;
    private _near: number;
    private _far: number;

    constructor(type: string, aspectRatio: number, yfov: number, near: number, far: number) {
        super(Camera.COMPONENT_NAME);

        this._type = type;
        this._aspectRatio = aspectRatio;
        this._yfov = yfov;
        this._near = near;
        this._far = far;
    }

    get type(): string {
        return this._type;
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

    set type(type: string) {
        this._type = type;
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

    toRaw(): CameraType {
        if (this._type === "perspective") {
            return {
                type: "perspective",
                persepective: {
                    aspectRatio: this._aspectRatio,
                    yfov: this._yfov,
                    znear: this._near,
                    zfar: this._far
                }
            };
        } else {
            return {
                type: "orthographic",
                orthographic: {
                    xmag: this._aspectRatio,
                    ymag: this._yfov,
                    znear: this._near,
                    zfar: this._far
                }
            };
        }
    }
}