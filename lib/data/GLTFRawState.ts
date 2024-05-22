import { GLTFState } from "./GLTFState";
import { Scene } from "./Scene";
import { SceneNode } from "./SceneNode";
import { Accessor } from "./buffers/Accessor";
import { BufferView } from "./buffers/BufferView";
import { GLTFBuffer } from "./buffers/GLTFBuffer";
import { Camera } from "./components/cameras/Camera";
import { Mesh } from "./components/mesh/Mesh";
import { AccessorType, AnimationClipType, BufferType, BufferViewType, CameraType, LightType, MaterialType, MeshType, SamplerType, SceneNodeType, SceneType, TextureImageType, TextureType } from "./types/gltftypes";
import { ShaderMaterial } from "./components/materials";
import { CameraUtil } from "./components/cameras/CameraUtil";
import { MaterialUtil } from "./components/materials/MaterialUtil";
import { AnimationClipUtil, AnimationPath } from "./components/animations";
import { Light } from "./components/lights/Light";
import { LightUtil } from "./components/lights/LightUtil";
import { Sampler } from "./components/materials/textures/Sampler";
import { TextureImage } from "./components/materials/textures/TextureImage";
import { Texture } from "./components/materials/textures/Texture";

export class GLTFRawState {
    private _buffers: BufferType[] = [];
    private _bufferViews: BufferViewType[] = [];
    private _accessors: AccessorType[] = [];
    private _samplers: SamplerType[] = [];
    private _images: TextureImageType[] = [];
    private _textures: TextureType[] = [];
    private _materials: MaterialType[] = [];
    private _meshes: MeshType[] = [];
    private _cameras: CameraType[] = [];
    private _lights: LightType[] = [];
    private _nodes: SceneNodeType[] = [];
    private _scenes: SceneType[] = [];
    private _animations: AnimationClipType[] = [];
    private _scene: number = -1;

    constructor(
        buffers: BufferType[],
        bufferViews: BufferViewType[],
        accessors: AccessorType[],
        sampler: SamplerType[],
        images: TextureImageType[],
        textures: TextureType[],
        _materials: MaterialType[],
        meshes: MeshType[],
        cameras: CameraType[],
        lights: LightType[],
        nodes: SceneNodeType[],
        scenes: SceneType[],
        animations: AnimationClipType[],
        scene: number
    ) {
        if (scene < -1 || scene >= scenes.length) {
            throw new Error("Invalid scene index");
        }

        this._buffers = buffers;
        this._bufferViews = bufferViews;
        this._accessors = accessors;
        this._samplers = sampler;
        this._images = images;
        this._textures = textures;
        this._materials = _materials;
        this._meshes = meshes;
        this._cameras = cameras;
        this._lights = lights;
        this._nodes = nodes;
        this._scenes = scenes;
        this._animations = animations;
        this._scene = scene;
    }

    get buffers(): BufferType[] {
        return this._buffers;
    }

    get bufferViews(): BufferViewType[] {
        return this._bufferViews;
    }

    get accessors(): AccessorType[] {
        return this._accessors;
    }

    get samplers(): SamplerType[] {
        return this._samplers;
    }

    get images(): TextureImageType[] {
        return this._images;
    }

    get textures(): TextureType[] {
        return this._textures;
    }

    get materials(): MaterialType[] {
        return this._materials;
    }

    get meshes(): MeshType[] {
        return this._meshes;
    }

    get cameras(): CameraType[] {
        return this._cameras;
    }

    get lights(): LightType[] {
        return this._lights;
    }

    get nodes(): SceneNodeType[] {
        return this._nodes;
    }

    get scenes(): SceneType[] {
        return this._scenes;
    }

    get animations(): AnimationClipType[] {
        return this._animations;
    }

    get scene(): number {
        return this._scene;
    }

    static async fromGLTFState(state: GLTFState): Promise<GLTFRawState> {
        const bufferMap = new Map<GLTFBuffer, number>();
        const bufferViewMap = new Map<BufferView, number>();
        const accessorMap = new Map<Accessor, number>();
        const samplerMap = new Map<Sampler, number>();
        const imageMap = new Map<TextureImage, number>();
        const textureMap = new Map<Texture, number>();
        const materialMap = new Map<ShaderMaterial, number>();
        const meshMap = new Map<Mesh, number>();
        const cameraMap = new Map<Camera, number>();
        const lightMap = new Map<Light, number>();
        const nodeMap = new Map<SceneNode, number>();

        const bufferRaws = state.buffers.map((buffer, idx) => {
            const raw = buffer.toRaw();
            const index = idx;
            bufferMap.set(buffer, index);
            return raw;
        });

        const bufferViewRaws = state.bufferViews.map((bufferView, idx) => {
            const raw = bufferView.toRaw(bufferMap.get(bufferView.buffer)!!);
            const index = idx;
            bufferViewMap.set(bufferView, index);
            return raw;
        });

        const accessorRaws = state.accessors.map((accessor, idx) => {
            const raw = accessor.toRaw(bufferViewMap.get(accessor.bufferView)!!);
            const index = idx;
            accessorMap.set(accessor, index);
            return raw;
        });

        const samplerRaws = state.samplers.map((sampler, idx) => {
            const raw = sampler.toRaw();
            const index = idx;
            samplerMap.set(sampler, index);
            return raw;
        });

        const imageRaws: TextureImageType[] = [];

        for (let i = 0; i < state.images.length; i++) {
            const image = state.images[i];
            const raw = await image.toRaw();
            const index = i;
            imageMap.set(image, index);
            imageRaws.push(raw);
        }

        const textureRaws = state.textures.map((texture, idx) => {
            const raw = texture.toRaw(samplerMap, imageMap);
            const index = idx;
            textureMap.set(texture, index);
            return raw;
        });

        const materialRaws = state.materials.map((material, idx) => {
            const raw = material.toRaw({ textureMap, accessorMap});
            const index = idx;
            materialMap.set(material, index);
            return raw;
        });

        const meshRaws = state.meshes.map((mesh, idx) => {
            const raw = mesh.toRaw(accessorMap, materialMap);
            const index = idx;
            meshMap.set(mesh, index);
            return raw;
        });

        const cameraRaws = state.cameras.map((camera, idx) => {
            const raw = camera.toRaw();
            const index = idx;
            cameraMap.set(camera, index);
            return raw;
        });

        const lightRaws = state.lights.map((light, idx) => {
            const raw = light.toRaw();
            const index = idx;
            lightMap.set(light, index);
            return raw;
        });

        state.nodes.forEach((node, idx) => {
            nodeMap.set(node, idx);
        });

        const nodeRaws = state.nodes.map(node => {
            const raw = node.toRaw(nodeMap, meshMap, cameraMap, lightMap);
            return raw;
        });

        const sceneRaws = state.scenes.map((scene, idx) => {
            const raw = scene.toRaw(nodeMap);
            return raw;
        });

        const animationRaws = state.animations.map(animation => AnimationClipUtil.toRaw(animation, nodeMap));
        
        const scene = state.scene;

        return new GLTFRawState(
            bufferRaws,
            bufferViewRaws,
            accessorRaws,
            samplerRaws,
            imageRaws,
            textureRaws,
            materialRaws,
            meshRaws,
            cameraRaws,
            lightRaws,
            nodeRaws,
            sceneRaws,
            animationRaws,
            scene
        );
    }

    public toGLTFState(): GLTFState {
        const buffers = this._buffers.map(buffer => GLTFBuffer.fromRaw(buffer));
        const bufferViews = this._bufferViews.map(bufferView => BufferView.fromRaw(bufferView, buffers));
        const accessors = this._accessors.map(accessor => Accessor.fromRaw(accessor, bufferViews));
        const samplers = this._samplers.map(sampler => Sampler.fromRaw(sampler));
        const images = this._images.map(image => TextureImage.fromRaw(image));
        const textures = this._textures.map(texture => Texture.fromRaw(texture, samplers, images));
        const materials = this._materials.map(material => MaterialUtil.fromRaw(material, { textures, accessors }));
        const meshes = this._meshes.map(mesh => Mesh.fromRaw(mesh, accessors, materials));
        const cameras = this._cameras.map(camera => CameraUtil.fromRaw(camera));
        const lights = this._lights.map(light => LightUtil.fromRaw(light));
        const nodes = this._nodes.map(node => SceneNode.fromRaw(node, meshes, cameras, lights));

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            for (let j = 0; j < this._nodes[i].children.length; j++) {
                node.add(nodes[this._nodes[i].children[j]]);
            }
        }

        const scenes = this._scenes.map(scene => Scene.fromRaw(scene, nodes));

        const animations = this._animations.map(animation => AnimationClipUtil.fromRaw(animation, nodes));

        return new GLTFState(
            buffers, 
            bufferViews, 
            accessors, 
            samplers,
            images,
            textures,
            materials, 
            meshes, 
            cameras,
            lights,
            nodes, 
            scenes, 
            animations,
            this._scene
        );
    }
}