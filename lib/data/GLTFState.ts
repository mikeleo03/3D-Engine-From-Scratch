import { SceneNode } from "./SceneNode";
import { Scene } from "./Scene";
import { Mesh } from "./components/mesh/Mesh";
import { Camera } from "./components/cameras/Camera";
import { GLTFBuffer } from "./buffers/GLTFBuffer";
import { BufferView } from "./buffers/BufferView";
import { Accessor } from "./buffers/Accessor";
import { ShaderMaterial } from "./components/materials";
import { AnimationClip } from "./components/animations";
import { Light } from "./components/lights/Light";



export class GLTFState {
    private _buffers: GLTFBuffer[] = [];
    private _bufferViews: BufferView[] = [];
    private _accessors: Accessor[] = [];
    private _materials: ShaderMaterial[] = [];
    private _meshes: Mesh[];
    private _cameras: Camera[];
    private _lights: Light[] = [];
    private _nodes: SceneNode[];
    private _scenes: Scene[];
    private _animations: AnimationClip[];
    private _scene: number = -1;
    constructor(
        buffers: GLTFBuffer[] = [],
        bufferViews: BufferView[] = [],
        accessors: Accessor[] = [],
        materials: ShaderMaterial[] = [],
        meshes: Mesh[] = [],
        cameras: Camera[] = [],
        lights: Light[] = [],
        nodes: SceneNode[] = [],
        scenes: Scene[] = [],
        animations: AnimationClip[] = [],
        scene: number = -1
    ) {
        if (scene < -1 || scene >= scenes.length) {
            throw new Error("Invalid scene index");
        }

        this._buffers = buffers;
        this._bufferViews = bufferViews;
        this._accessors = accessors;
        this._materials = materials;
        this._meshes = meshes;
        this._cameras = cameras;
        this._lights = lights;
        this._nodes = nodes;
        this._scenes = scenes;
        this._animations = animations;
        this._scene = scene;
    }

    get buffers(): GLTFBuffer[] {
        return this._buffers.slice();
    }

    get bufferViews(): BufferView[] {
        return this._bufferViews.slice();
    }

    get accessors(): Accessor[] {
        return this._accessors.slice();
    }

    get materials(): ShaderMaterial[] {
        return this._materials.slice();
    }

    get meshes(): Mesh[] {
        return this._meshes.slice();
    }

    get cameras(): Camera[] {
        return this._cameras.slice();
    }

    get lights(): Light[] {
        return this._lights.slice();
    }

    get nodes(): SceneNode[] {
        return this._nodes.slice();
    }

    get scenes(): Scene[] {
        return this._scenes.slice();
    }

    get animations(): AnimationClip[] {
        return this._animations.slice();
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


    addCamera(camera: Camera) {
        if (this._cameras.indexOf(camera) != -1) {
            return;
        }

        this._cameras.push(camera);
    }

    addLight(light: Light) {
        if (this._lights.indexOf(light) != -1) {
            return;
        }

        this._lights.push(light);
    }

    addBuffer(buffer: GLTFBuffer) {
        if (this._buffers.indexOf(buffer) != -1) {
            return;
        }

        this._buffers.push(buffer);
    }

    addBufferView(bufferView: BufferView) {
        if (this._bufferViews.indexOf(bufferView) != -1) {
            return;
        }

        this.addBuffer(bufferView.buffer);

        this._bufferViews.push(bufferView);
    }

    addAccessor(accessor: Accessor) {
        if (this._accessors.indexOf(accessor) != -1) {
            return;
        }

        this.addBufferView(accessor.bufferView);

        this._accessors.push(accessor);
    }

    addMaterial(material: ShaderMaterial) {
        if (this._materials.indexOf(material) != -1) {
            return;
        }

        this._materials.push(material);
    }

    addMesh(mesh: Mesh) {
        if (this._meshes.indexOf(mesh) != -1) {
            return;
        }

        const geometries = mesh.geometries;

        for (let i = 0; i < geometries.length; i++) {
            const geometry = geometries[i];

            if (geometry.basicMaterial) {
                this.addMaterial(geometry.basicMaterial);
            }
        }

        const accessors: Accessor[] = [];

        for (let i = 0; i < geometries.length; i++) {
            if (geometries[i].attributes.position) {
                accessors.push(geometries[i].attributes.position!.accessor);
            }

            if (geometries[i].attributes.normal) {
                accessors.push(geometries[i].attributes.normal!.accessor);
            }

            if (geometries[i].indices) {
                accessors.push(geometries[i].indices!.accessor);
            }
        }

        for (let i = 0; i < accessors.length; i++) {
            this.addAccessor(accessors[i]);
        }

        this._meshes.push(mesh);
    }


    addNode(node: SceneNode) {
        if (this._nodes.indexOf(node) != -1) {
            return;
        }

        if (node.camera) {
            this.addCamera(node.camera);
        }

        if (node.light) {
            this.addLight(node.light);
        }

        if (node.mesh) {
            this.addMesh(node.mesh);
        }

        this._nodes.push(node);
    }

    addScene(scene: Scene) {
        if (this._scenes.indexOf(scene) != -1) {
            return;
        }

        for (let i = 0; i < scene.nodes.length; i++) {
            this.addNode(scene.nodes[i]);
        }

        this._scenes.push(scene);

        if (this._scene == -1) {
            this._scene = 0;
        }
    }

    addAnimation(animation: AnimationClip) {
        if (this._animations.indexOf(animation) != -1) {
            return;
        }

        for (let i = 0; i < animation.frames.length; i++) {
            const frame = animation.frames[i];

            if (frame.nodeKeyframePairs) {
                for (let pair of frame.nodeKeyframePairs) {
                    const node = pair.node;

                    this.addNode(node);
                }
            }
        }

        this._animations.push(animation);
    }

    addNodeToScene(node: SceneNode, scene: Scene) {
        this.addNode(node);
        this.addScene(scene);
        scene.addNode(node);
    }

    removeCamera(camera: Camera) {
        const index = this._cameras.indexOf(camera);

        if (index == -1) {
            return;
        }

        let remove = true;

        for (let i = 0; i < this._nodes.length; i++) {
            if (this._nodes[i].camera == camera) {
                remove = false;
                break;
            }
        }

        if (!remove) {
            return;
        }

        this._cameras.splice(index, 1);

    }

    removeLight(light: Light) {
        const index = this._lights.indexOf(light);

        if (index == -1) {
            return;
        }

        let remove = true;

        for (let i = 0; i < this._nodes.length; i++) {
            if (this._nodes[i].light == light) {
                remove = false;
                break;
            }
        }

        if (!remove) {
            return;
        }

        this._lights.splice(index, 1);

    }

    removeBuffer(buffer: GLTFBuffer) {
        const index = this._buffers.indexOf(buffer);

        if (index == -1) {
            return;
        }

        let remove = true;

        for (let i = 0; i < this._bufferViews.length; i++) {
            if (this._bufferViews[i].buffer == buffer) {
                remove = false;
                break;
            }
        }

        if (!remove) {
            return;
        }

        this._buffers.splice(index, 1);
    }

    removeBufferView(bufferView: BufferView) {
        const index = this._bufferViews.indexOf(bufferView);

        if (index == -1) {
            return;
        }

        let remove = true;

        for (let i = 0; i < this._accessors.length; i++) {
            if (this._accessors[i].bufferView == bufferView) {
                remove = false;
                break;
            }
        }

        if (!remove) {
            return;
        }

        this._bufferViews.splice(index, 1);
        this.removeBuffer(bufferView.buffer);
    }

    removeAccessor(accessor: Accessor) {
        const index = this._accessors.indexOf(accessor);

        if (index == -1) {
            return;
        }

        let remove = true;

        for (let i = 0; i < this._meshes.length; i++) {
            const geometries = this._meshes[i].geometries;

            for (let j = 0; j < geometries.length; j++) {
                if (geometries[j].attributes.position?.accessor == accessor ||
                    geometries[j].attributes.normal?.accessor == accessor ||
                    geometries[j].indices?.accessor == accessor) {
                    remove = false;
                    break;
                }
            }
        }

        if (!remove) {
            return;
        }

        this._accessors.splice(index, 1);
        this.removeBufferView(accessor.bufferView);
    }

    removeMaterial(material: ShaderMaterial) {
        const index = this._materials.indexOf(material);

        if (index == -1) {
            return;
        }

        let remove = true;

        for (let i = 0; i < this._meshes.length; i++) {
            const geometries = this._meshes[i].geometries;

            for (let j = 0; j < geometries.length; j++) {
                if (geometries[j].basicMaterial == material) {
                    remove = false;
                    break;
                }
            }
        }

        if (remove) {
            this._materials.splice(index, 1);
        }
    }

    removeMesh(mesh: Mesh) {
        const index = this._meshes.indexOf(mesh);

        if (index == -1) {
            return;
        }

        let remove = true;

        for (let i = 0; i < this._nodes.length; i++) {
            if (this._nodes[i].mesh == mesh) {
                remove = false;
                break;
            }
        }

        if (!remove) {
            return;
        }

        this._meshes.splice(index, 1);

        const geometries = mesh.geometries;

        for (let i = 0; i < geometries.length; i++) {
            const geometry = geometries[i];

            if (geometry.basicMaterial) {
                this.removeMaterial(geometry.basicMaterial);
            }
        }
    }

    removeNode(node: SceneNode) {
        const index = this._nodes.indexOf(node);

        if (index == -1) {
            return;
        }

        let remove = true;

        for (let i = 0; i < this._scenes.length; i++) {
            if (this._scenes[i].nodes.indexOf(node) != -1) {
                remove = false;
                break;
            }
        }

        if (!remove) {
            return;
        }

        this._nodes.splice(index, 1);

        if (node.camera) {
            this.removeCamera(node.camera);
        }

        if (node.light) {
            this.removeLight(node.light);
        }
    }

    removeScene(scene: Scene) {
        const index = this._scenes.indexOf(scene);

        if (index == -1) {
            return;
        }

        this._scenes.splice(index, 1);

        for (let i = 0; i < scene.nodes.length; i++) {
            this.removeNode(scene.nodes[i]);
        }
    }

    removeAnimation(animation: AnimationClip) {
        const index = this._animations.indexOf(animation);

        if (index == -1) {
            return;
        }

        this._animations.splice(index, 1);
    }

    removeNodeFromScene(node: SceneNode, scene: Scene) {
        scene.removeNode(node);
        this.removeNode(node);
    }
}