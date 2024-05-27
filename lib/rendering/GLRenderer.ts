import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";
import { Camera } from "../data/components/Camera";

export class GLRenderer {
    private _glContainer: GLContainer
    constructor(glContainer: GLContainer) {
        this._glContainer = glContainer;
    }

    render(scene: Scene, camera: SceneNode) {
    }
}