import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";
import { Vector3 } from "../data/math";
import { CameraTypeString } from "../data/types/gltftypes";

export class GLRenderer {
    private _glContainer: GLContainer
    constructor(glContainer: GLContainer) {
        this._glContainer = glContainer;
    }

    private clearCanvas() {
        const gl = this._glContainer.glContext;

        gl.clearColor(1, 1, 1, 1);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    private renderRoot(root: SceneNode, uniforms: { viewMatrix: Float32Array}) {
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
                    ...material.bufferUniforms, 
                    ...uniforms,
                    worldMatrix: root.worldMatrix.transpose().buffer,
                    canvasWidth: this._glContainer.canvasElement.width,
                    canvasHeight: this._glContainer.canvasElement.height
                });

                this._glContainer.setAttributes(programInfo, geometry.attributes);

                // draw triangles
                gl.drawArrays(gl.TRIANGLES, 0, geometry.attributes.position?.count || 0);
            }
        }

        for (const child of root.children) {
            this.renderRoot(child, uniforms);
        }
    }

    render(scene: Scene) {
        this.clearCanvas();

        const cameraNode = scene.getActiveCameraNode();
        
        if (!cameraNode) {
            return;
        }

        const camera = cameraNode.camera;
        if (!camera) {
            return;
        }
        
        if (camera.type === CameraTypeString.PERSPECTIVE) {
            cameraNode.position = new Vector3(0, 0, 700 - (camera.zoom - 1) / 4 * 300)
        }
        let cameraPosition = cameraNode.position;

        const nodes = scene.roots;
    
        for (const node of nodes) {
            const defaultUniform = {
                viewMatrix: camera.getFinalProjectionMatrix(cameraNode).buffer,
            }

            this.renderRoot(node, defaultUniform);
        }
    }
}