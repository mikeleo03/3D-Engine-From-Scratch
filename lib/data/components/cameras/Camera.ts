import { Matrix4 } from "../../math/Matrix4";
import { CameraType, CameraTypeString } from "../../types/gltftypes";
import { NodeComponent } from "../NodeComponent";

export abstract class Camera extends NodeComponent {
    static readonly COMPONENT_NAME: string = "Camera";

    private _projectionMatrix: Matrix4;
    private _zoom: number;
    private _type: CameraTypeString;

    constructor(type: CameraTypeString, zoom: number = 1) {
        super(Camera.COMPONENT_NAME);

        if (zoom <= 0) {
            throw new Error('zoom must be greater than 0');
        }

        this._projectionMatrix = Matrix4.identity();
        this._type = type;
        this._zoom = zoom;
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