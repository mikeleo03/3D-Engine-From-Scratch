import { Camera } from "./components/Camera";
import { Mesh } from "./components/Mesh";
import { Matrix4 } from "./math/Matrix4";
import { Quaternion } from "./math/Quaternion";
import { Vector3 } from "./math/Vector";
import { SceneNodeType } from "./types/gltftypes";

export class SceneNode {
    private _position: Vector3 = new Vector3();
    private _rotation: Quaternion = new Quaternion();
    private _scale: Vector3 = new Vector3(1, 1, 1);
    private _localMatrix: Matrix4 = Matrix4.identity();
    private _worldMatrix: Matrix4 = Matrix4.identity();
    private _parent: SceneNode | null = null;
    private _children: SceneNode[] = []
    private _mesh?: Mesh;
    private _camera?: Camera;
    visible = true

    constructor(
        position: Vector3 = new Vector3(),
        rotation: Quaternion = new Quaternion(),
        scale: Vector3 = new Vector3(1, 1, 1),
        parent: SceneNode | null = null,
        mesh?: Mesh,
        camera?: Camera
    ) {
        this._position = position;
        this._rotation = rotation;
        this._scale = scale;
        this._parent = parent;
        this.computeWorldMatrix();
        this._mesh = mesh;
        this._camera = camera;
    }


    // Public getter, prevent re-instance new object
    get position() { return this._position; }
    get rotation() { return this._rotation; }
    get scale() { return this._scale; }
    get parent() { return this._parent; }
    get localMatrix() { return this._localMatrix; }
    get worldMatrix() { return this._worldMatrix; }
    get children() { return this._children; }


    // Public setter
    // Should update world matrix if parent changed
    set parent(parent) {
        if (this._parent !== parent) {
            this._parent = parent;
            this.computeWorldMatrix(false, true);
        }
    }


    private computeLocalMatrix() {
        this._localMatrix = Matrix4.mul(
            Matrix4.translation3d(this._position),
            this.rotation.toMatrix4(),
            Matrix4.scale3d(this._scale)
        );
    }


    private computeWorldMatrix(updateParent = true, updateChildren = true) {
        // If updateParent, update world matrix of our ancestors
        // (.parent, .parent.parent, .parent.parent.parent, ...)
        if (updateParent && this.parent)
            this.parent.computeWorldMatrix(true, false);
        // Update this node
        this.computeLocalMatrix();
        if (this.parent) {
            this._worldMatrix = Matrix4.mul(
                this.parent.worldMatrix,
                this._localMatrix
            );
        } else {
            this._worldMatrix = this._localMatrix.clone();
        }
        // If updateChildren, update our children
        // (.children, .children.children, .children.children.children, ...)
        if (updateChildren)
            for (let i = 0; i < this._children.length; i++)
                this._children[i].computeWorldMatrix(false, true);
    }

    /**
     * Tambah node sebagai child dari node ini.
     *
     * Jika node sudah memiliki parent, maka node akan
     * dilepas dari parentnya terlebih dahulu.
     */
    add(node: SceneNode) {
        if (node.parent !== this) {
            node.removeFromParent();
            node.parent = this;
        }
        this.children.push(node);
    }


    remove(node: SceneNode, recursive: Boolean = false) {
        const index = this.children.indexOf(node);

        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }

        if (recursive) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].remove(node);
            }
        }
    }


    removeFromParent() {
        if (this.parent) this.parent.remove(this);
    }

    static fromRaw(raw: SceneNodeType, meshes: Mesh[], cameras: Camera[]): SceneNode {
        // NOTE: children are not set here
        
        const node = new SceneNode(
            new Vector3(raw.transalation[0], raw.transalation[1], raw.transalation[2]),
            new Quaternion(raw.rotation[0], raw.rotation[1], raw.rotation[2], raw.rotation[3]),
            new Vector3(raw.scale[0], raw.scale[1], raw.scale[2]),
            null,
            raw.mesh !== undefined ? meshes[raw.mesh] : undefined,
            raw.camera !== undefined ? cameras[raw.camera] : undefined
        );

        return node;
    }

    toRaw(nodeMap: Map<SceneNode, number>, meshMap: Map<Mesh, number>, cameraMap: Map<Camera, number>): SceneNodeType {
        // check if all children are in the map
        for (let i = 0; i < this._children.length; i++) {
            if (!nodeMap.has(this._children[i])) {
                throw new Error("All children must be in the map");
            }
        }

        // check if mesh is in the map
        if (this._mesh && !meshMap.has(this._mesh)) {
            throw new Error("Mesh must be in the map");
        }

        // check if camera is in the map
        if (this._camera && !cameraMap.has(this._camera)) {
            throw new Error("Camera must be in the map");
        }

        return {
            transalation: this._position.toArray(),
            rotation: this.rotation.toArray(),
            scale: this._scale.toArray(),
            children: this._children.map(child => nodeMap.get(child)!!),
            mesh: this._mesh ? meshMap.get(this._mesh)!! : undefined,
            camera: this._camera ? cameraMap.get(this._camera)!! : undefined,
        };
    }
}
