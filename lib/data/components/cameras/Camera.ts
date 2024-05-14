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

    abstract toRaw(): CameraType;
}