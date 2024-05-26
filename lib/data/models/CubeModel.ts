import { Color, ImageFormat, ImageType, MagFilter, MinFilter, WebGLType, WrapMode } from "@/lib/cores"
import { Scene } from "../Scene"
import { SceneNode } from "../SceneNode"
import { AnimationClip, AnimationPath } from "../components/animations"
import { BasicMaterial, DisplacementData, PhongMaterial, TextureData } from "../components/materials"
import { MeshFactory } from "../components/mesh/MeshFactory"
import { Model } from "./Model"
import { Vector3 } from "../math"
import { AccessorComponentType, AnimationTRS, BufferViewTarget } from "../types/gltftypes"
import { Texture } from "../components/materials/textures/Texture"
import { Sampler } from "../components/materials/textures/Sampler"
import { TextureImage } from "../components/materials/textures/TextureImage"
import { format } from "path"
import { Accessor } from "../buffers/Accessor"
import { GLTFBuffer } from "../buffers/GLTFBuffer"
import { BufferView } from "../buffers/BufferView"
import { Float32ArrayConverter, Uint16ArrayConverter } from "../buffers/typedarrayconverters"

import container from "../components/materials/textureImages/container.png"
import f_texture from "../components/materials/textureImages/f-texture.png"
import metal from "../components/materials/textureImages/metal.jpg"

export class CubeModel extends Model {
    private _box?: SceneNode;

    constructor() {
        super();
    }

    private createTextureImageFromImport(src: string): TextureImage {
        const image = new Image();
        image.src = src;
        return new TextureImage(
            { image },
            ImageFormat.RGBA,
            ImageType.UnsignedByte
        );
    }

    private getDiffuseCoordinates(): Accessor {
        const buffer = GLTFBuffer.empty(2 * 2 * 36);
        const bufferView = new BufferView(buffer, 0, buffer.byteLength, BufferViewTarget.ARRAY_BUFFER);
        const accessor = new Accessor(bufferView, 0, WebGLType.UNSIGNED_SHORT, 36, AccessorComponentType.VEC2, [], []);
        const converter = new Uint16ArrayConverter();

        accessor.setData(converter.tobytes(Uint16Array.from([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            1, 0,
            1, 1,
        ])));

        return accessor;
    }

    private getDiffuseTexturesDatas(): TextureData[] {
        const urls = [container.src, f_texture.src, metal.src];

        const sampler = new Sampler(
            MagFilter.Linear,
            MinFilter.Linear,
            WrapMode.ClampToEdge,
            WrapMode.ClampToEdge
        );

        return urls.map(url => {
            const textureImage = this.createTextureImageFromImport(url);
            const texture = new Texture(sampler, textureImage);
            const coord = this.getDiffuseCoordinates();
            const textureData = new TextureData(texture, coord);
            textureData.expandTexCoords(MeshFactory.CUBOID_INDICES);
            return textureData;
        });
    }

    private getSpecularCoordinates(): Accessor {
        const buffer = GLTFBuffer.empty(2 * 2 * 36);
        const bufferView = new BufferView(buffer, 0, buffer.byteLength, BufferViewTarget.ARRAY_BUFFER);
        const accessor = new Accessor(bufferView, 0, WebGLType.UNSIGNED_SHORT, 36, AccessorComponentType.VEC2, [], []);
        const converter = new Uint16ArrayConverter();

        accessor.setData(converter.tobytes(Uint16Array.from([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            1, 0,
            1, 1,
        ])));

        return accessor;
    }

    private getSpecularTexturesDatas(): TextureData[] {
        const urls = [container.src, f_texture.src, metal.src];

        const sampler = new Sampler(
            MagFilter.Linear,
            MinFilter.Linear,
            WrapMode.ClampToEdge,
            WrapMode.ClampToEdge
        );

        return urls.map(url => {
            const textureImage = this.createTextureImageFromImport(url);
            const texture = new Texture(sampler, textureImage);
            const coord = this.getSpecularCoordinates();
            const textureData = new TextureData(texture, coord);
            textureData.expandTexCoords(MeshFactory.CUBOID_INDICES);
            return textureData;
        });
    }

    private getDisplacementCoordinates(): Accessor {
        const buffer = GLTFBuffer.empty(2 * 2 * 36);
        const bufferView = new BufferView(buffer, 0, buffer.byteLength, BufferViewTarget.ARRAY_BUFFER);
        const accessor = new Accessor(bufferView, 0, WebGLType.UNSIGNED_SHORT, 36, AccessorComponentType.VEC2, [], []);
        const converter = new Uint16ArrayConverter();

        accessor.setData(converter.tobytes(Uint16Array.from([
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1
        ])));

        return accessor;
    }

    private getDisplacementTextureData(data: Uint8Array): DisplacementData {
        const sampler = new Sampler(
            MagFilter.Linear,
            MinFilter.Linear,
            WrapMode.ClampToEdge,
            WrapMode.ClampToEdge
        )

        const source = new TextureImage(
            {
                arrayData: {
                    bytes: data,
                    width: 2,
                    height: 2
                }
            },
            ImageFormat.Luminance,
            ImageType.UnsignedByte
        )

        const texture = new Texture(sampler, source);
        const coord = this.getDisplacementCoordinates();

        const textureData = new TextureData(texture, coord);
        textureData.expandTexCoords(MeshFactory.CUBOID_INDICES)

        return new DisplacementData(textureData, 40, 20);
    }

    private getDisplacementTextureDatas(): DisplacementData[] {
        const data1 = new Uint8Array([
            255, 255, 255, 255,
        ]);

        const data2 = new Uint8Array([
            25, 50, 0, 0,
        ]);

        const data3 = new Uint8Array([
            150, 23, 43, 77,
        ]);

        return [
            this.getDisplacementTextureData(data1),
            this.getDisplacementTextureData(data2),
            this.getDisplacementTextureData(data3)
        ]
    }

    private getCube(): SceneNode {
        const meshFactory = new MeshFactory();
        const cubeMaterial = new BasicMaterial(new Color(52, 25, 0), { name: "cube" });
        
        const diffuseDatas = this.getDiffuseTexturesDatas();
        const specularDatas = this.getSpecularTexturesDatas();
        const displacementDatas = this.getDisplacementTextureDatas();

        const phongCubeMaterial = new PhongMaterial({ 
            name: "cube-phong", 
            ambientColor: new Color(52, 25, 0),
            diffuseColor: new Color(204, 102, 0), 
            specularColor: new Color(255, 255, 255), 
            shininess: 60,
            diffuseMap: diffuseDatas[0],
            diffuseMaps: diffuseDatas,
            normalMaps: [],
            displacementMaps: displacementDatas,
            specularMap: specularDatas[0],
            specularMaps: specularDatas
        });

        const cubeMesh = meshFactory.cuboid(
            80, 80, 80,
            { basicMaterial: cubeMaterial, phongMaterial: phongCubeMaterial }
        );

        return new SceneNode({name: 'Cube', mesh: cubeMesh});
    }

    protected override getScene() {
        const cube = this.getCube();

        cube.translate(new Vector3(10, 10, 10));
        cube.rotateByDegrees(new Vector3(30, 30, 0));

        this._box = cube;

        return new Scene([cube]);
    }

    private getBoxMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                scale: [1, 0.5, 1]
            },
            {
                scale: [1, 0, 1]
            },
            {
                scale: [1, 0.5, 1]
            },
            {
                scale: [1, 1, 1]
            },
            {
                scale: [1, 0.5, 1]
            },
            {
                scale: [1, 0, 1]
            },
            {
                scale: [1, 0.5, 1]
            },
            {
                scale: [1, 1, 1]
            },
        ]

        return keyFrames;
    }

    override getAnimations(): AnimationClip[] {
        const boxMovements = this.getBoxMovements();

        const frames: AnimationPath[] = [];

        const length = boxMovements.length;
        for (let i = 0; i < length; i++) {
            const pairs: {node: SceneNode, keyframe: AnimationTRS}[] = [];

            pairs.push({node: this._box!!, keyframe: boxMovements[i]});

            frames.push({nodeKeyframePairs: pairs});
        }

        const animation = {
            name: "kosong",
            frames: frames
        }

        return [animation];
    }
}