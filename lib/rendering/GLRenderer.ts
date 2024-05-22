import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";
import { Color, WebGLType } from "../cores";
import { DirectionalLight } from "../data/components/lights";
import { v4 as uuid } from "uuid";

export class GLRenderer {
    private _glContainer: GLContainer
    private _id: string = uuid();
    private _enablePhongShading: boolean = false;
    constructor(glContainer: GLContainer) {
        this._glContainer = glContainer;
    }

    set enablePhongShading(enable: boolean) {
        this._enablePhongShading = enable;
    }

    private clearCanvas() {
        this._glContainer.resetGL();
    }

    private renderRoot(root: SceneNode, uniforms: {
        viewMatrix: Float32Array;
        lightPosition: Float32Array;
        lightColor: Color;
        lightAmbient: Color;
        lightDiffuse: Color;
        lightSpecular: Color;
        cameraPosition: Float32Array;
    }) {
        const mesh = root.mesh;
        const gl = this._glContainer.glContext;

        if (mesh) {
            for (const geometry of mesh.geometries) {
                const material = this._enablePhongShading ? geometry.phongMaterial : geometry.basicMaterial;
                
                if (!material) {
                    continue;
                }

                if (!material.getProgramInfo(this._id)) {
                    material.setProgramInfo(
                        this._id,
                        this._glContainer.getProgramInfo(material.vertexShader, material.fragmentShader)
                    );
                }

                const programInfo = material.getProgramInfo(this._id)!!;

                this._glContainer.setProgram(programInfo);

                this._glContainer.setUniforms(programInfo, {
                    ...material.getBufferUniforms(),
                    ...uniforms,
                    worldMatrix: root.worldMatrix.transpose().buffer,
                });

                this._glContainer.setAttributes(programInfo, geometry.attributes)
                
                const indicesAttribute = geometry.indices;

                if (!indicesAttribute) {
                    throw new Error("Indices attribute is required");
                }

                this._glContainer.setIndices(indicesAttribute);

                gl.drawElements(gl.TRIANGLES, indicesAttribute.count, gl.UNSIGNED_SHORT, 0);
            }
        }

        for (const child of root.children) {
            this.renderRoot(child, uniforms);
        }
    }

    render(scene: Scene, cameraNode: SceneNode) {
        this.clearCanvas();

        const lightNode = scene.getActiveLightNode();

        if (!cameraNode || !lightNode) {
            return;
        }

        const camera = cameraNode.camera;
        const light = lightNode.light as DirectionalLight;
        if (!camera || !light) {
            return;
        }

        const lightUniforms = {
            lightPosition: lightNode.position.buffer,
            lightColor: light.color,
            lightAmbient: light.ambientColor,
            lightDiffuse: light.diffuseColor,
            lightSpecular: light.specularColor
        };

        const viewMatrix = camera.getFinalProjectionMatrix(cameraNode).buffer;
        const cameraPosition = cameraNode.position.buffer;

        const nodes = scene.roots;

        for (const node of nodes) {
            const defaultUniform = {
                viewMatrix,
                ...lightUniforms,
                cameraPosition
            };

            this.renderRoot(node, defaultUniform);
        }
    }
}