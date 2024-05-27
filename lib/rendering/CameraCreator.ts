import { Camera } from "@/lib/data/components/cameras/Camera";
import { ObliqueCamera } from "@/lib/data/components/cameras/ObliqueCamera";
import { OrthographicCamera } from "@/lib/data/components/cameras/OrthographicCamera";
import { PerspectiveCamera } from "@/lib/data/components/cameras/PerspectiveCamera";

interface CameraWrapper {
    cam: Camera;
    resizer: (ev: Event) => void;
}

const cameraPerspective = (canvas: HTMLCanvasElement): CameraWrapper => {
    const cam = new PerspectiveCamera(
        60,
        canvas.width / canvas.height,
        0.01,
        9999
    );
    return {
        cam,
        resizer: (ev: Event) => {
            cam.aspectRatio = canvas.width / canvas.height;
        }
    };
};

const cameraOrthographic = (canvas: HTMLCanvasElement): CameraWrapper => {
    const cam = new OrthographicCamera(
        -canvas.width / 2,
        canvas.width / 2,
        canvas.height / 2,
        -canvas.height / 2,
        -1000,
        1000
    );
    return {
        cam,
        resizer: (ev: Event) => {
            cam.left = -canvas.width / 2;
            cam.right = canvas.width / 2;
            cam.top = canvas.height / 2;
            cam.bottom = -canvas.height / 2;
        }
    };
};

const cameraOblique = (canvas: HTMLCanvasElement): CameraWrapper => {
    const cam = new ObliqueCamera(
        -canvas.width / 2,
        canvas.width / 2,
        canvas.height / 2,
        -canvas.height / 2,
        -1000,
        1000
    );
    return {
        cam,
        resizer: (ev: Event) => {
            cam.left = -canvas.width / 2;
            cam.right = canvas.width / 2;
            cam.top = canvas.height / 2;
            cam.bottom = -canvas.height / 2;
        }
    };
};

export const cameraCreator = {
    perspective: cameraPerspective,
    orthographic: cameraOrthographic,
    oblique: cameraOblique,
};