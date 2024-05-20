import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";
import { Vector3 } from "../data/math";
import { DirectionalLight } from "../data/components/lights";

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

    private renderRoot(root: SceneNode, uniforms: { 
        viewMatrix: Float32Array; 
        lightPosition: Float32Array; 
        lightColor: number[]; 
        lightAmbient: number[]; 
        lightDiffuse: number[]; 
        lightSpecular: number[]; 
        cameraPosition: Float32Array;
    }) {
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

    render(scene: Scene, camPosition: Vector3) {
        this.clearCanvas();

        const cameraNode = scene.getActiveCameraNode();
        const lightNode = scene.getActiveLightNode();

        if (!cameraNode || !lightNode) {
            return;
        }

        const camera = cameraNode.camera;
        const light = lightNode.light as DirectionalLight;
        if (!camera || !light) {
            return;
        }

        const nodes = scene.roots;
    
        for (const node of nodes) {
            const defaultUniform = {
                viewMatrix: camera.getFinalProjectionMatrix(cameraNode).buffer,
                lightPosition: lightNode.position.buffer,
                lightColor: light.color.buffer,
                lightAmbient: light.ambientColor.buffer,
                lightDiffuse: light.diffuseColor.buffer,
                lightSpecular: light.specularColor.buffer,
                cameraPosition: camPosition.buffer
            }

            this.renderRoot(node, defaultUniform);
        }
    }
}