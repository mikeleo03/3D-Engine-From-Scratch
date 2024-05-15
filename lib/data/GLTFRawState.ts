import { GLTFState } from "./GLTFState";
import { Scene } from "./Scene";
import { SceneNode } from "./SceneNode";
import { Accessor } from "./buffers/Accessor";
import { BufferView } from "./buffers/BufferView";
import { GLTFBuffer } from "./buffers/GLTFBuffer";
import { Camera } from "./components/cameras/Camera";
import { Mesh } from "./components/mesh/Mesh";
import { AccessorType, AnimationClipType, BufferType, BufferViewType, CameraType, MaterialType, MeshType, SceneNodeType, SceneType } from "./types/gltftypes";
import { ShaderMaterial } from "./components/materials";
import { CameraUtil } from "./components/cameras/CameraUtil";
import { MaterialUtil } from "./components/materials/MaterialUtil";
import { AnimationClipUtil, AnimationPath } from "./components/animations";

export class GLTFRawState {
    private _buffers: BufferType[] = [];
    private _bufferViews: BufferViewType[] = [];
    private _accessors: AccessorType[] = [];
    private _materials: MaterialType[] = [];
    private _meshes: MeshType[] = [];
    private _cameras: CameraType[] = [];
    private _nodes: SceneNodeType[] = [];
    private _scenes: SceneType[] = [];
    private _animations: AnimationClipType[] = [];
    private _scene: number = -1;

    constructor(
        buffers: BufferType[],
        bufferViews: BufferViewType[],
        accessors: AccessorType[],
        _materials: MaterialType[],
        meshes: MeshType[],
        cameras: CameraType[],
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
        this._materials = _materials;
        this._meshes = meshes;
        this._cameras = cameras;
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

    get materials(): MaterialType[] {
        return this._materials;
    }

    get meshes(): MeshType[] {
        return this._meshes;
    }

    get cameras(): CameraType[] {
        return this._cameras;
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


    static fromGLTFState(state: GLTFState): GLTFRawState {
        const bufferMap = new Map<GLTFBuffer, number>();
        const bufferViewMap = new Map<BufferView, number>();
        const accessorMap = new Map<Accessor, number>();
        const materialMap = new Map<ShaderMaterial, number>();
        const meshMap = new Map<Mesh, number>();
        const cameraMap = new Map<Camera, number>();
        const nodeMap = new Map<SceneNode, number>();
        const animationPathMap = new Map<AnimationPath, number>();

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

        const materialRaws = state.materials.map((material, idx) => {
            const raw = material.toRaw();
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

        state.nodes.forEach((node, idx) => {
            nodeMap.set(node, idx);
        });

        const nodeRaws = state.nodes.map(node => {
            const raw = node.toRaw(nodeMap, meshMap, cameraMap);
            return raw;
        });

        const sceneRaws = state.scenes.map((scene, idx) => {
            const raw = scene.toRaw(nodeMap);
            return raw;
        });

        const animationRaws: AnimationClipType[] = [];

        state.animations.forEach(animation => {
            animation.frames.forEach((frame, idx) => {
                animationPathMap.set(frame, idx);
            });

            const raw = AnimationClipUtil.toRaw(animation, animationPathMap);
            animationRaws.push(raw);
        });
        
        const scene = state.scene;

        return new GLTFRawState(
            bufferRaws,
            bufferViewRaws,
            accessorRaws,
            materialRaws,
            meshRaws,
            cameraRaws,
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
        const materials = this._materials.map(material => MaterialUtil.fromRaw(material));
        const meshes = this._meshes.map(mesh => Mesh.fromRaw(mesh, accessors, materials));
        const cameras = this._cameras.map(camera => CameraUtil.fromRaw(camera));
        const nodes = this._nodes.map(node => SceneNode.fromRaw(node, meshes, cameras));

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            for (let j = 0; j < this._nodes[i].children.length; j++) {
                node.add(nodes[this._nodes[i].children[j]]);
            }
        }

        const scenes = this._scenes.map(scene => Scene.fromRaw(scene, nodes));

        const animations = this._animations.map(animation => AnimationClipUtil.fromRaw(animation));

        for (let i = 0; i < animations.length; i++) {
            const animation = animations[i];
            for (let j = 0; j < this._animations[i].frames.length; j++) {
                const frame = animation.frames[j];

                if (!this._animations[i].frames[j].children)
                {
                    continue;
                }

                if (!frame.children) {
                    frame.children = {};
                };

                for (const childName in this._animations[i].frames[j].children) {
                    frame.children[childName] = animation.frames[this._animations[i].frames[j].children![childName]];
                }
            }
        }

        return new GLTFState(
            buffers, 
            bufferViews, 
            accessors, 
            materials, 
            meshes, 
            cameras, 
            nodes, 
            scenes, 
            animations,
            this._scene
        );
    }
}