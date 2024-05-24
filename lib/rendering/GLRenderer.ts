import { GLContainer } from "../cores/GLContainer";
import { SceneNode } from "../data/SceneNode";
import { Scene } from "../data/Scene";
import { Color, UniformSingleDataType, WebGLType } from "../cores";
import { DirectionalLight, PointLight } from "../data/components/lights";
import { v4 as uuid } from "uuid";
import { GLTFBuffer } from "../data/buffers/GLTFBuffer";
import { BufferView } from "../data/buffers/BufferView";
import { AccessorComponentType, BufferViewTarget, LightTypeString } from "../data/types/gltftypes";
import { Accessor } from "../data/buffers/Accessor";
import { DisplacementData, PhongMaterial, TextureData } from "../data/components/materials";
import { Texture } from "../data/components/materials/textures/Texture";

interface LightUniforms {
    lightType: number;
    lightPosition: Float32Array;
    lightColor: Color;
    lightTarget?: Float32Array;
    lightAmbient?: Color;
    lightDiffuse?: Color;
    lightSpecular?: Color;
    lightConstant?: number;
    lightLinear?: number;
    lightQuadratic?: number;
}

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
        cameraPosition: Float32Array;
    } & LightUniforms) {
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
                        this._glContainer.getProgramInfo(
                            material.vertexShader, 
                            material.fragmentShader,
                            {
                                rendererId: this._id
                            }
                        )
                    );
                }

                const programInfo = material.getProgramInfo(this._id)!!;

                this._glContainer.setProgram(programInfo);

                const textureUniforms: {
                    [key: string]: UniformSingleDataType | undefined;
                } = {};

                if (material instanceof PhongMaterial) {
                    if (material.diffuseMap && !material.diffuseMap.texCoordsExpanded) {
                        if (!geometry.indices) {
                            throw new Error("Indices is required for texture coordinates expansion");
                        }

                        material.diffuseMap.expandTexCoords(Array.from(geometry.indices!.data))
                    }

                    textureUniforms["displacementMap"] = material.displacementMap?.textureData.texture;
                    textureUniforms["displacementScale"] = material.displacementMap?.scale;
                    textureUniforms["displacementBias"] = material.displacementMap?.bias;
                    textureUniforms["normalMap"] = material.normalMap?.texture;
                    textureUniforms["diffuseMap"] = material.diffuseMap?.texture;
                    textureUniforms["specularMap"] = material.specularMap?.texture;
                }

                this._glContainer.setUniforms(
                    programInfo, {
                        ...material.getBufferUniforms(),
                        ...textureUniforms,
                        ...uniforms,
                        worldMatrix: root.worldMatrix.transpose().buffer,
                    }
                );

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

    render(scene: Scene, cameraNode: SceneNode, lightNode: SceneNode) {
        this.clearCanvas();
    
        if (!cameraNode || !lightNode || !lightNode.light) {
            return;
        }
    
        const camera = cameraNode.camera;
        const light = lightNode.light;
    
        if (!camera) {
            return;
        }
    
        let lightUniforms: LightUniforms = {
            lightType: light.type === LightTypeString.DIRECTIONAL ? 0 : 1,
            lightPosition: lightNode.position.buffer,
            lightColor: light.color,
        };
    
        if (light.type === LightTypeString.DIRECTIONAL) {
            const directionalLight = light as DirectionalLight;
            lightUniforms = {
                ...lightUniforms,
                lightAmbient: directionalLight.ambientColor,
                lightDiffuse: directionalLight.diffuseColor,
                lightSpecular: directionalLight.specularColor,
                lightTarget: directionalLight.target.buffer,
            };
        } else if (light.type === LightTypeString.POINT) {
            const pointLight = light as PointLight;
            lightUniforms = {
                ...lightUniforms,
                lightAmbient: pointLight.ambientColor,
                lightDiffuse: pointLight.diffuseColor,
                lightSpecular: pointLight.specularColor,
                lightConstant: pointLight.constant,
                lightLinear: pointLight.linear,
                lightQuadratic: pointLight.quadratic
            };
        }
    
        const viewMatrix = camera.getFinalProjectionMatrix(cameraNode).buffer;
        const cameraPosition = cameraNode.position.buffer;
    
        const roots = scene.roots;
    
        for (const root of roots) {
            const defaultUniform: {
                viewMatrix: Float32Array;
                cameraPosition: Float32Array;
            } & LightUniforms = {
                viewMatrix,
                cameraPosition,
                ...lightUniforms,
            };
    
            this.renderRoot(root, defaultUniform);
        }
    }     
}