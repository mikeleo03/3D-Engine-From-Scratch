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

export class CubeModel extends Model {
    private _box?: SceneNode;

    constructor() {
        super();
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

    private getDisplacementTextureData(): DisplacementData {
        const sampler = new Sampler(
            MagFilter.Linear,
            MinFilter.Linear,
            WrapMode.ClampToEdge,
            WrapMode.ClampToEdge
        )

        const data = new Uint8Array([
            255, 255, 255, 255,
            0, 255, 255, 255,
            255, 255, 255, 255,
            255, 255, 255, 255,
        ])

        const source = new TextureImage(
            {
                arrayData: {
                    bytes: data,
                    width: 2,
                    height: 2
                }
            },
            ImageFormat.RGBA,
            ImageType.UnsignedByte
        )

        const texture = new Texture(sampler, source);
        const coord = this.getDisplacementCoordinates();

        const textureData = new TextureData(texture, coord);
        textureData.expandTexCoords(MeshFactory.CUBOID_INDICES)

        return new DisplacementData(textureData, 50, 20);
    }

    private getCube(): SceneNode {
        const meshFactory = new MeshFactory();
        const cubeMaterial = new BasicMaterial(new Color(52, 25, 0), { name: "cube" });
        
        const displacementData = this.getDisplacementTextureData();

        const phongCubeMaterial = new PhongMaterial({ 
            name: "cube-phong", 
            ambientColor: new Color(52, 25, 0), 
            diffuseColor: new Color(204, 102, 0), 
            specularColor: new Color(255, 255, 255), 
            shininess: 60,
            displacementMap: displacementData
        });

        /* const cubeMesh = meshFactory.cuboid(80, 80, 80, 
            {basicMaterial: cubeMaterial, phongMaterial: phongCubeMaterial}
        ); */

        const cubeMesh = meshFactory.cuboid(
            80, 80, 80,
            { basicMaterial: cubeMaterial, phongMaterial: phongCubeMaterial }
        );

        return new SceneNode({name: 'Cube', mesh: cubeMesh});
    }

    protected override getScene() {
        const nodes: SceneNode[] = [];

        const cube = this.getCube();

        cube.translate(new Vector3(10, 10, 10));

        const parent = new SceneNode({name: 'Cube Model'});
        parent.add(cube);

        parent.translate(new Vector3(0, 0, 0));
        parent.rotateByDegrees(new Vector3(30, 30, 0));

        nodes.push(parent);

        this._box = cube;

        return new Scene(nodes);
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