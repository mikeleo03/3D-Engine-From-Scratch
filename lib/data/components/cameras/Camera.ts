import { ObliqueCamera, OrthographicCamera, PerspectiveCamera } from ".";
import { Matrix4 } from "../../math/Matrix4";
import { CameraType } from "../../types/gltftypes";
import { NodeComponent } from "../NodeComponent";

export abstract class Camera extends NodeComponent {
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
        if (raw.type === "perspective") {
            return new PerspectiveCamera(
                raw.perspective.aspectRatio,
                raw.perspective.yfov,
                raw.perspective.znear,
                raw.perspective.zfar
            );
        }
        else if (raw.type === "orthographic") {
            return new OrthographicCamera(
                raw.orthographic.top,
                raw.orthographic.bottom,
                raw.orthographic.left,
                raw.orthographic.right,
                raw.orthographic.znear,
                raw.orthographic.zfar,
                raw.orthographic.angle
            );
        }
        else if (raw.type === "oblique") {
            return new ObliqueCamera(
                raw.oblique.top,
                raw.oblique.bottom,
                raw.oblique.left,
                raw.oblique.right,
                raw.oblique.znear,
                raw.oblique.zfar,
                raw.oblique.angle
            );
        }

        throw new Error(`Unknown camera type`);
    }

    abstract toRaw(): CameraType;
}