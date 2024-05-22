import { GLTFParser } from "../GLTFParser";
import { GLTFState } from "../GLTFState";
import { Scene } from "../Scene";
import { AnimationClip } from "../components/animations";
import { FileUtil } from "@/lib/utils/FileUtil";

export abstract class Model {
    private _scene: Scene;
    private _gltfState: GLTFState;
    private _animations: AnimationClip[] = [];
    constructor() {
        this._scene = this.getScene();
        this._animations = this.getAnimations();
        this._gltfState = this.getGLTFState();
    }

    get scene(): Scene {
        return this._scene;
    }

    get gltfState(): GLTFState {
        return this._gltfState;
    }

    getGLTFState(): GLTFState {
        const gltfState = new GLTFState();

        gltfState.addScene(this._scene);

        const animations = this._animations;
        
        for (const animation of animations) {
            gltfState.addAnimation(animation);
        }

        return gltfState;
    }

    protected abstract getScene(): Scene;
    abstract getAnimations(): AnimationClip[];

    async download() {
        const scene = this._scene;
        const gLTFState = new GLTFState();

        gLTFState.addScene(scene);

        const animations = this._animations;
        animations.forEach(animation => {
            gLTFState.addAnimation(animation);
        })

        const parser = new GLTFParser();
        const file = await parser.write(gLTFState);

        FileUtil.downloadFile(file);
    }
}