import { Matrix4 } from "../../math/Matrix4";
import { CameraType, CameraTypeString } from "../../types/gltftypes";
import { NodeComponent } from "../NodeComponent";

export abstract class Camera extends NodeComponent {
    static readonly COMPONENT_NAME: string = "Camera";

    private _projectionMatrix: Matrix4;
    private _zoom: number;
    private _type: CameraTypeString;

    constructor(type: CameraTypeString) {
        super(Camera.COMPONENT_NAME);

        this._projectionMatrix = Matrix4.identity();
        this._type = type;
        this._zoom = 0.5;
    }


    get type(): CameraTypeString {
        return this._type;
    }

    getProjectionMatrix() {
        this.updateProjectionMatrix();
        return this._projectionMatrix;
    }
    
    get zoom(): number {
        return this._zoom;
    }

    set type(type: CameraTypeString) {
        this._type = type;
    }

    set projectionMatrix(matrix: Matrix4) {
        this._projectionMatrix = matrix;
    }

    set zoom(zoom: number) {
        this._zoom = zoom;
    }

    protected abstract updateProjectionMatrix(): void;

    abstract toRaw(): CameraType;
}