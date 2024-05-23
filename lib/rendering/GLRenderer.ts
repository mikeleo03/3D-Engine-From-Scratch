import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";
import { Color, UniformSingleDataType, WebGLType } from "../cores";
import { DirectionalLight } from "../data/components/lights";
import { v4 as uuid } from "uuid";
import { GLTFBuffer } from "../data/buffers/GLTFBuffer";
import { BufferView } from "../data/buffers/BufferView";
import { AccessorComponentType, BufferViewTarget } from "../data/types/gltftypes";
import { Accessor } from "../data/buffers/Accessor";
import { DisplacementData, PhongMaterial, TextureData } from "../data/components/materials";
import { Texture } from "../data/components/materials/textures/Texture";

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
        lightTarget: Float32Array;
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

                const textureUniforms: {
                    [key: string]: UniformSingleDataType | undefined;
                } = {};

                if (material instanceof PhongMaterial) {
                    textureUniforms["displacementMap"] = material.displacementMap?.textureData.texture;
                    textureUniforms["displacementScale"] = material.displacementMap?.scale;
                    textureUniforms["displacementBias"] = material.displacementMap?.bias;
                    textureUniforms["normalMap"] = material.normalMap?.texture;
                    textureUniforms["diffuseMap"] = material.diffuseMap?.texture;
                    textureUniforms["specularMap"] = material.specularMap?.texture;
                }

                console.log(textureUniforms)
                
                this._glContainer.setUniforms(programInfo, {
                    ...material.getBufferUniforms(),
                    ...textureUniforms,
                    ...uniforms,
                    worldMatrix: root.worldMatrix.transpose().buffer,
                });

                geometry.calculateFaceNormals();
                geometry.calculateVertexNormals();

                const geometryAttributes = { ...geometry.attributes };

                if (
                    geometryAttributes.position
                    && geometry.indices
                ) {
                    const bytesCount = geometry.indices.count * 3 * 4;
                    const newBuffer = GLTFBuffer.empty(bytesCount);
                    const bufferView = new BufferView(newBuffer, 0, bytesCount, BufferViewTarget.ARRAY_BUFFER);
                    const accessor = new Accessor(
                        bufferView,
                        0,
                        WebGLType.FLOAT,
                        geometry.indices.count,
                        AccessorComponentType.VEC3,
                        [],
                        []
                    );
                    geometryAttributes.position = geometry.getExpandedPosition(accessor);
                }


                this._glContainer.setAttributes(programInfo, geometryAttributes)

                gl.drawArrays(gl.TRIANGLES, 0, geometryAttributes.position?.count ?? 0);
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
            lightTarget: light.target.buffer,
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