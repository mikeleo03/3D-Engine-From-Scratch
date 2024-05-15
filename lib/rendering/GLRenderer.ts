import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";
import { Matrix4 } from "../data/math";

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

    private renderRoot(root: SceneNode, uniforms: { viewMatrix: Matrix4 }) {
        const mesh = root.mesh;
        const gl = this._glContainer.glContext;

        if (mesh) {
            for (const geometry of mesh.geometries) {
                const material = geometry.material;

                if (!material.programInfo) {
                    material.programInfo = this._glContainer.getProgramInfo(material.vertexShader, material.fragmentShader);
                }

                const programInfo = material.programInfo;

                this._glContainer.setProgram(programInfo);

                this._glContainer.setUniforms(programInfo, { 
                    ...material.uniforms, 
                    ...uniforms,
                    worldMatrix: root.worldMatrix,
                    cameraPosition: root.position,
                });
                
                this._glContainer.setAttributes(programInfo, geometry.attributes);

                // draw triangles
                gl.drawArrays(gl.TRIANGLES, 0, geometry.attributes.POSITION?.count || 0);
            }
        }

        for (const child of root.children) {
            this.renderRoot(child, uniforms);
        }
    }

    render(scene: Scene) {
        this.clearCanvas();

        const camera = scene.getActiveCameraNode()?.camera;
        if (!camera) {
            return;
        }

        const defaultUniform = {
            viewMatrix: camera.projectionMatrix,
        }

        const nodes = scene.roots;
        for (const node of nodes) {
            this.renderRoot(node, defaultUniform);
        }
    }
}