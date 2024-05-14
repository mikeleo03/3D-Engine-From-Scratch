import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";

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

    private renderRoot(root: SceneNode) {
        const mesh = root.mesh;
        const gl = this._glContainer.glContext;

        if (mesh) {
            // Render mesh
            const material = mesh.material;
            
            if (!material.programInfo)
            {
                material.programInfo = this._glContainer.getProgramInfo(material.vertexShader, material.fragmentShader);
            }

            const programInfo = material.programInfo;

            for (const geometry of mesh.geometries) {
                // TODO: Set additional uniforms, pass camera as additional argument to this function if needed
                this._glContainer.setUniforms(programInfo, material.uniforms);
                this._glContainer.setAttributes(programInfo, geometry.attributes);

                // draw triangles
                gl.drawArrays(gl.TRIANGLES, 0, geometry.attributes.POSITION?.count || 0);
            }
        }

        for (const child of root.children) {
            this.renderRoot(child);
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
            this.renderRoot(node);
        }

        // TODO: setup camera
    }
}