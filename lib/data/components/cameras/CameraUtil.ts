import { CameraType, CameraTypeString } from "../../types/gltftypes";
import { Camera } from "./Camera";
import { ObliqueCamera } from "./ObliqueCamera";
import { OrthographicCamera } from "./OrthographicCamera";
import { PerspectiveCamera } from "./PerspectiveCamera";

export class CameraUtil {
    static fromRaw(raw: CameraType): Camera { 
        if (raw.type === CameraTypeString.PERSPECTIVE) {
            return new PerspectiveCamera(
                raw.perspective.aspectRatio,
                raw.perspective.yfov,
                raw.perspective.znear,
                raw.perspective.zfar
            );
        }
        else if (raw.type === CameraTypeString.ORTHOGRAPHIC) {
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
        else if (raw.type === CameraTypeString.OBLIQUE) {
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

        throw new Error(`Unknown camera type}`);
    
    }
}