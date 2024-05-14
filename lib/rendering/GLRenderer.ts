import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";
import { Camera } from "../data/components/cameras/Camera";

export class GLRenderer {
    private _glContainer: GLContainer
    constructor(glContainer: GLContainer) {
        this._glContainer = glContainer;
    }

    private clearCanvas() {
        const gl = this._glContainer.glContext;

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    private renderRoot(root: SceneNode, camera: Camera) {
        const mesh = root.mesh;
        if (mesh) {
            // TODO: render mesh
        }

        for (const child of root.children) {
            this.renderRoot(child, camera);
        }
    }

    render(scene: Scene) {
        this.clearCanvas();

        const camera = scene.getActiveCameraNode()?.camera;
        if (!camera) {
            return;
        }

        const nodes = scene.roots;
        for (const node of nodes) {
            this.renderRoot(node, camera);
        }
    }
}