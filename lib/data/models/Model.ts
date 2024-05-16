import { GLTFParser } from "../GLTFParser";
import { GLTFState } from "../GLTFState";
import { Scene } from "../Scene";
import { AnimationClip } from "../components/animations";
import { Camera } from "../components/cameras/Camera";

export abstract class Model {
    private _scene: Scene;
    private _animations: AnimationClip[] = [];
    private _camera: Camera;
    constructor(camera: Camera) {
        this._camera = camera;
        this._scene = this.getScene();
        this._animations = this.getAnimations();
    }

    get scene(): Scene {
        return this._scene;
    }

    protected get camera(): Camera {
        return this._camera;
    }

    protected abstract getScene(): Scene;
    abstract getAnimations(): AnimationClip[];

    download() {
        const scene = this._scene;
        const gLTFState = new GLTFState();

        gLTFState.addScene(scene);

        const animations = this._animations;
        // todo: add animations

        const parser = new GLTFParser();
        const file = parser.write(gLTFState);

        FileUtil.downloadFile(file);
    }
}