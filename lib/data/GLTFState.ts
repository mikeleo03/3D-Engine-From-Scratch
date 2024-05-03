import { UUID, randomUUID } from "crypto";
import { SceneNode } from "./Node";
import { Scene } from "./Scene";
import { Mesh } from "./components/Mesh";
import { Camera } from "./components/Camera";
import { GLTFBuffer } from "./buffers/GLTFBuffer";
import { BufferView } from "./buffers/BufferView";
import { Accessor } from "./buffers/Accessor";


export class GLTFState {
    private _buffers: GLTFBuffer[] = [];
    private _bufferViews: BufferView[] = [];
    private _accessors: Accessor[] = [];
    private _meshes: Mesh[];
    private _cameras: Camera[];
    private _nodes: SceneNode[];
    private _scenes: Scene[];
    private _scene: number = -1;
    constructor(
        buffers: GLTFBuffer[],
        bufferViews: BufferView[],
        accessors: Accessor[],
        meshes: Mesh[],
        cameras: Camera[],
        nodes: SceneNode[],
        scenes: Scene[],
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

    get buffers(): GLTFBuffer[] {
        return this._buffers;
    }

    get bufferViews(): BufferView[] {
        return this._bufferViews;
    }

    get accessors(): Accessor[] {
        return this._accessors;
    }

    get meshes(): Mesh[] {
        return this._meshes;
    }

    get cameras(): Camera[] {
        return this._cameras;
    }

    get nodes(): SceneNode[] {
        return this._nodes;
    }

    get scenes(): Scene[] {
        return this._scenes;
    }

    get scene(): number {
        return this._scene;
    }

    get CurrentScene(): Scene | null {
        if (this._scene == -1) {
            return null;
        }

        return this._scenes[this._scene];
    }

    getCurrentCamera(rootIndex: number = 0, cameraId: UUID | null = null): SceneNode | null {
        const scene = this.CurrentScene;
        if (!scene) {
            return null;
        }

        // TODO: handle for multiple root if needed
        return scene.getCamera(scene.roots[rootIndex], cameraId);
    }
}