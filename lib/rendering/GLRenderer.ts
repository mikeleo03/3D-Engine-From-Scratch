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
import {GLBufferAttribute} from "@/lib/data/buffers/GLBufferAttribute";
import {Float32ArrayConverter} from "@/lib/data/buffers/typedarrayconverters";

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
        lightUniformsArray: LightUniforms[];
    }) {
        const mesh = root.mesh;
        const gl = this._glContainer.glContext;
        const MAX_LIGHTS = 2;
    
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
                    textureUniforms["hasNormalMap"] = material.normalMap ? 1.0 : 0.0;
                    textureUniforms["diffuseMap"] = material.diffuseMap?.texture;
                    textureUniforms["hasDiffuseMap"] = material.diffuseMaps.length > 0 && material.diffuseMap != undefined ? 1.0 : 0.0;
                    textureUniforms["specularMap"] = material.specularMap?.texture;
                    textureUniforms["hasSpecularMap"] = material.specularMaps.length > 0 && material.specularMap != undefined ? 1.0 : 0.0;
                }
    
                const lightUniforms: { [key: string]: UniformSingleDataType | undefined } = {};
    
                uniforms.lightUniformsArray.slice(0, MAX_LIGHTS).forEach((light, index) => {
                    lightUniforms[`lightType_${index}`] = light.lightType;
                    lightUniforms[`lightPosition_${index}`] = light.lightPosition;
                    lightUniforms[`lightColor_${index}`] = light.lightColor;
                    lightUniforms[`lightAmbient_${index}`] = light.lightAmbient;
                    lightUniforms[`lightDiffuse_${index}`] = light.lightDiffuse;
                    lightUniforms[`lightSpecular_${index}`] = light.lightSpecular;
                    lightUniforms[`lightTarget_${index}`] = light.lightTarget;
                    lightUniforms[`lightConstant_${index}`] = light.lightConstant;
                    lightUniforms[`lightLinear_${index}`] = light.lightLinear;
                    lightUniforms[`lightQuadratic_${index}`] = light.lightQuadratic;
                });

                // Render mode
                let mode = 0.0;
                if (uniforms.lightUniformsArray.length == 2) {
                    if (
                        uniforms.lightUniformsArray[0].lightType == 0.0 &&
                        uniforms.lightUniformsArray[1].lightType == 1.0
                    ) {
                        // Mode 1 : 1st Directional, 2nd Point
                        mode = 1.0;
                    } else if (
                        uniforms.lightUniformsArray[0].lightType == 1.0 &&
                        uniforms.lightUniformsArray[1].lightType == 0.0
                    ) {
                        // Mode 2 : 1st Point, 2nd Directional
                        mode = 2.0;
                    }
                } else if (uniforms.lightUniformsArray.length == 1) {
                    if (uniforms.lightUniformsArray[0].lightType == 0.0) {
                        // Mode 3 : 1st Directional, 2nd None
                        mode = 3.0;
                    } else if (uniforms.lightUniformsArray[0].lightType == 1.0) {
                        // Mode 4 : 1st Point, 2nd None
                        mode = 4.0;
                    }
                }
    
                this._glContainer.setUniforms(
                    programInfo, {
                        ...material.getBufferUniforms(),
                        ...textureUniforms,
                        ...lightUniforms,
                        viewMatrix: uniforms.viewMatrix,
                        cameraPosition: uniforms.cameraPosition,
                        worldMatrix: root.worldMatrix.transpose().buffer,
                        numLights: uniforms.lightUniformsArray.length,
                        mode: mode
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
    
                this._glContainer.setAttributes(programInfo, geometryAttributes);

                if (material instanceof PhongMaterial) {
                    if (material.normalMap){
                        const indices = geometry.indices?.data;
                        const vertexCount = geometry.attributes.position?.count ?? 0;
                        const indicesCount = indices?.length ?? vertexCount;
                        const tangentBytesCount = indicesCount * 3 * 4;
                        const bitangentBytesCount = indicesCount * 3 * 4;

                        const bufferTB = GLTFBuffer.empty(tangentBytesCount + bitangentBytesCount);

                        const tangentBufferView = new BufferView(bufferTB, 0, tangentBytesCount, BufferViewTarget.ARRAY_BUFFER);
                        const bitangentBufferView = new BufferView(bufferTB, tangentBytesCount, bitangentBytesCount, BufferViewTarget.ARRAY_BUFFER);

                        const tangentAccessor = new Accessor(tangentBufferView, 0, WebGLType.FLOAT, indicesCount, AccessorComponentType.VEC3, [], []);
                        const bitangentAccessor = new Accessor(bitangentBufferView, 0, WebGLType.FLOAT, indicesCount, AccessorComponentType.VEC3, [], []);

                        geometry.calculateTangentBitangent(tangentAccessor, bitangentAccessor);
                    }
                }
    
                gl.drawArrays(gl.TRIANGLES, 0, geometryAttributes.position?.count ?? 0);
            }
        }

        for (const child of root.children) {
            this.renderRoot(child, uniforms);
        }
    }    

    render(scene: Scene, cameraNode: SceneNode, lightNodes: SceneNode[]) {
        this.clearCanvas();
    
        if (!cameraNode || !lightNodes || lightNodes.length === 0) {
            return;
        }
    
        const camera = cameraNode.camera;
        if (!camera) {
            return;
        }
    
        let lightUniformsArray: LightUniforms[] = lightNodes.map((lightNode, index) => {
            if (lightNode) {
                const light = lightNode.light;
                if (!light) return null;
        
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
                        lightQuadratic: pointLight.quadratic,
                    };
                }
        
                return lightUniforms;
            }
        }).filter((lightUniform): lightUniform is LightUniforms => lightUniform !== null);  // Correctly filter out null values
    
        const viewMatrix = camera.getFinalProjectionMatrix(cameraNode).buffer;
        const cameraPosition = cameraNode.position.buffer;
    
        const roots = scene.roots;
    
        for (const root of roots) {
            const defaultUniform = {
                viewMatrix,
                cameraPosition,
                lightUniformsArray,
            };
    
            this.renderRoot(root, defaultUniform);
        }
    }
}