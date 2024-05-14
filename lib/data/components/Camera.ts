import { ObliqueCamera, OrthographicCamera, PerspectiveCamera } from "../cameras";
import { Matrix4 } from "../math/Matrix4";
import { CameraType } from "../types/gltftypes";
import { NodeComponent } from "./NodeComponent";

export class Camera extends NodeComponent {
    static readonly COMPONENT_NAME: string = "Camera";

    private _projectionMatrix: Matrix4;
    private _zoom: number;
    private _type: string;

    constructor(type: string) {
        super(Camera.COMPONENT_NAME);

        this._projectionMatrix = Matrix4.identity();
        this._type = type;
        this._zoom = 1;
    }

    get type(): string {
        return this._type;
    }

    get projectionMatrix(): Matrix4 {
        return this._projectionMatrix;
    }

    get zoom(): number {
        return this._zoom;
    }

    set type(type: string) {
        this._type = type;
    }

    set projectionMatrix(matrix: Matrix4) {
        this._projectionMatrix = matrix;
    }

    set zoom(zoom: number) {
        this._zoom = zoom;
    }

    updateProjectionMatrix() {
        throw new Error("updateProjectionMatrix() must be implemented in derived classes.");
    }

    static fromRaw(raw: CameraType): Camera {
        /* if (raw.type === "perspective") {
            return new Camera(
                raw.type,
                raw.persepective.aspectRatio,
                raw.persepective.yfov,
                raw.persepective.znear,
                raw.persepective.zfar
            );
        } else {
            return new Camera(
                raw.type,
                raw.orthographic.xmag,
                raw.orthographic.ymag,
                raw.orthographic.znear,
                raw.orthographic.zfar
            );
        } */
        return new Camera(raw.type);
    }

    toRaw(): CameraType {
        if (this._type === "Perspective Camera") {
            const perspectiveCamera = this as unknown as PerspectiveCamera;
            return {
                type: "perspective",
                perspective: {
                    aspectRatio: perspectiveCamera.aspectRatio,
                    yfov: perspectiveCamera.yfov,
                    znear: perspectiveCamera.near,
                    zfar: perspectiveCamera.far
                }
            };
        } else if (this._type === "Orthograhic Camera") {
            const orthographicCamera = this as unknown as OrthographicCamera;
            return {
                type: "orthographic",
                orthographic: {
                    top: orthographicCamera.top,
                    bottom: orthographicCamera.bottom,
                    left: orthographicCamera.left,
                    right: orthographicCamera.right,
                    znear: orthographicCamera.near,
                    zfar: orthographicCamera.far
                }
            };
        } else {
            const obliqueCamera = this as unknown as ObliqueCamera;
            return {
                type: "oblique",
                oblique: {
                    top: obliqueCamera.top,
                    bottom: obliqueCamera.bottom,
                    left: obliqueCamera.left,
                    right: obliqueCamera.right,
                    znear: obliqueCamera.near,
                    zfar: obliqueCamera.far
                }
            };
        }
    }
}