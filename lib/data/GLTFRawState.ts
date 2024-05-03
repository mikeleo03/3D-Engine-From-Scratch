import { GLTFState } from "./GLTFState";
import { SceneNode } from "./SceneNode";
import { Accessor } from "./buffers/Accessor";
import { BufferView } from "./buffers/BufferView";
import { GLTFBuffer } from "./buffers/GLTFBuffer";
import { Camera } from "./components/Camera";
import { Mesh } from "./components/Mesh";
import { AccessorType, BufferType, BufferViewType, CameraType, MeshPrimitiveAttribute, MeshType, NodeType, SceneType } from "./types/gltftypes";

export class GLTFRawState {
    private _buffers: BufferType[] = [];
    private _bufferViews: BufferViewType[] = [];
    private _accessors: AccessorType[] = [];
    private _meshes: MeshType[] = [];
    private _cameras: CameraType[] = [];
    private _nodes: NodeType[] = [];
    private _scenes: SceneType[] = [];
    private _scene: number = -1;

    constructor(
        buffers: BufferType[],
        bufferViews: BufferViewType[],
        accessors: AccessorType[],
        meshes: MeshType[],
        cameras: CameraType[],
        nodes: NodeType[],
        scenes: SceneType[],
        scene: number
    ) {
        if (scene < -1 || scene >= scenes.length) {
            throw new Error("Invalid scene index");
        }

        this._buffers = buffers;
        this._bufferViews = bufferViews;
        this._accessors = accessors;
        this._meshes = meshes;
        this._cameras = cameras;
        this._nodes = nodes;
        this._scenes = scenes;
        this._scene = scene;
    }

    static fromGLTFState(state: GLTFState): GLTFRawState {
        const bufferMap = new Map<GLTFBuffer, number>();
        const bufferViewMap = new Map<BufferView, number>();
        const accessorMap = new Map<Accessor, number>();
        const meshMap = new Map<Mesh, number>();
        const cameraMap = new Map<Camera, number>();
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

        const meshRaws = state.meshes.map((mesh, idx) => {
            const raw = mesh.toRaw(accessorMap);
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

        const nodeRaws = state.nodes.map((node, idx) => {
            const raw = node.toRaw(nodeMap, meshMap, cameraMap);
            const index = idx;
            nodeMap.set(node, index);
            return raw;
        });

        const sceneRaws = state.scenes.map((scene, idx) => {
            const raw = scene.toRaw(nodeMap);
            return raw;
        });

        const scene = state.scene;

        return new GLTFRawState(
            bufferRaws,
            bufferViewRaws,
            accessorRaws,
            meshRaws,
            cameraRaws,
            nodeRaws,
            sceneRaws,
            scene
        );
    }

    public toGLTFState(): GLTFState {

    }
}