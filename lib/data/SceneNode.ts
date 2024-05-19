import { Camera } from "./components/cameras/Camera";
import { Light } from "./components/lights/Light";
import { Mesh } from "./components/mesh/Mesh";
import { NodeComponent } from "./components/NodeComponent";
import { Matrix4 } from "./math/Matrix4";
import { Quaternion } from "@/lib/data/math";
import { Vector3 } from "./math/Vector";
import { SceneNodeType } from "./types/gltftypes";
import { v4 as uuidv4 } from 'uuid';

export class SceneNode {
    public static readonly DEFAULT_NAME = "Game Object";
    private _position: Vector3 = new Vector3();
    private _rotation: Quaternion = new Quaternion();
    private _scale: Vector3 = new Vector3(1, 1, 1);
    private _localMatrix: Matrix4 = Matrix4.identity();
    private _worldMatrix: Matrix4 = Matrix4.identity();
    private _worldRotation: Quaternion = new Quaternion();
    private _worldPosition: Vector3 = new Vector3();
    private _worldScale: Vector3 = new Vector3(1, 1, 1);
    private _parent: SceneNode | null = null;
    private _children: SceneNode[] = []
    private _mesh?: Mesh;
    private _camera?: Camera;
    private _light?: Light;
    private _name: string = SceneNode.DEFAULT_NAME;
    private _id: string;
    // visible = true


    constructor({
        position = new Vector3(),
        rotation = new Quaternion(),
        scale = new Vector3(1, 1, 1),
        parent = null,
        mesh,
        camera,
        light,
        name = SceneNode.DEFAULT_NAME,
        id = uuidv4()
    }: {
        position?: Vector3,
        rotation?: Quaternion,
        scale?: Vector3,
        parent?: SceneNode | null,
        mesh?: Mesh,
        camera?: Camera,
        light?: Light,
        name?: string,
        id?: string
    } = {}) {
        this._position = position;
        this._rotation = rotation.normalize();
        this._scale = scale;
        this._parent = parent;
        this.computeWorldMatrix();
        this._mesh = mesh;
        this._camera = camera;
        this._light = light;
        this._name = name;
        this._id = id || uuidv4();
        if (mesh) {
            mesh.addNodes(this);
        }

        if (camera) {
            camera.addNodes(this);
        }

        if (light) {
            light.addNodes(this);
        }
    }


    // Public getter, prevent re-instance new object
    get id() { return this._id; }
    get name() { return this._name; }
    get position() { return this._position; }
    get rotation() { return this._rotation; }
    get scale() { return this._scale; }
    get parent() { return this._parent; }
    get localMatrix() { return this._localMatrix; }
    get worldMatrix() { return this._worldMatrix; }
    get worldRotation() { return this._worldRotation; }
    get worldPosition() { return this._worldPosition; }
    get worldScale() { return this._worldScale; }
    get children() { return this._children; }
    get camera() { return this._camera; }
    get light() { return this._light; }
    get mesh() { return this._mesh; }

    // Public setter
    // Should update world matrix if parent changed
    set parent(parent) {
        if (this._parent !== parent) {
            this._parent = parent;
            this.computeWorldMatrix(false, true);
        }
    }

    set position(position) {
        this._position = position;
        this.computeWorldMatrix(false, true);
    }
    set rotation(rotation) {
        this._rotation = rotation.normalize();
        this.computeWorldMatrix(false, true);
    }
    set scale(scale) {
        this._scale = scale;
        this.computeWorldMatrix(false, true);
    }

    set name(name) {
        this._name = name;
    }

    translate(translation: Vector3) {
        this.position = Vector3.add(this.position, translation);
        this.computeWorldMatrix(false, true);
    }

    rotate(rotation: Quaternion) {
        this.rotation = Quaternion.mul(rotation, this.rotation);
        this.computeWorldMatrix(false, true);
    }

    rotateByEuler(euler: Vector3) {
        this.rotation = Quaternion.mul(this.rotation, Quaternion.fromEuler(euler));
        this.computeWorldMatrix(false, true);
    }

    rotateByDegrees(degrees: Vector3) {
        const euler = Vector3.mul(degrees, Math.PI / 180);
        this.rotateByEuler(euler);
    }

    scaleBy(scale: Vector3) {
        this.scale = Vector3.mulElements(this.scale, scale);
        this.computeWorldMatrix(false, true);
    }

    rotateAroundPoint(point: Vector3, rotation: Quaternion, lookAtPoint = false) {
        const translation = Vector3.mul(point, -1);
        this.translate(translation);
        
        // rotate position
        this.position = rotation.rotateVector(this.position);

        this.translate(point);

        if (lookAtPoint) {
            this.lookAt(point);
        }

        else {
            this.rotate(rotation);
        }
    }

    lookAt(target: Vector3, up?: Vector3) {
        if (!up) {
            up = Vector3.up();
        }

        const rotation = Quaternion.lookAt(this._position, target, up);
        this.rotation = rotation;
    }
    get localUp(): Vector3 {
        return this.rotation.rotateVector(Vector3.up());
    }

    get up(): Vector3 {
        return this.worldRotation.rotateVector(Vector3.up()).normalize();
    }

    get localDown(): Vector3 {
        return this.localUp.mul(-1);
    }

    get down(): Vector3 {
        return this.up.mul(-1);
    }

    get localForward(): Vector3 {
        return this.rotation.rotateVector(Vector3.forward());
    }

    get forward(): Vector3 {
        return this.worldRotation.rotateVector(Vector3.forward()).normalize();
    }

    get localBackward(): Vector3 {
        return this.localForward.mul(-1);
    }

    get backward(): Vector3 {
        return this.forward.mul(-1);
    }

    private computeLocalMatrix() {
        this._localMatrix = Matrix4.mul(
            Matrix4.translation3d(this._position),
            this.rotation.toMatrix4(),
            Matrix4.scale3d(this._scale)
        );
    }

    private computeWorldRotation(updateParent = true, updateChildren = true) {
        if (updateParent && this.parent) {
            this.parent.computeWorldRotation(true, false);
        }

        if (this.parent) {
            this._worldRotation = Quaternion.mul(this.parent.worldRotation, this.rotation);
        } else {
            this._worldRotation = this.rotation.clone();
        }

        if (updateChildren) {
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].computeWorldRotation(false, true);
            }
        }
    }

    private computeWorldPosition(updateParent = true, updateChildren = true) {
        if (updateParent && this.parent) {
            this.parent.computeWorldPosition(true, false);
        }

        if (this.parent) {
            this._worldPosition = Vector3.add(
                this.parent.worldPosition,
                this.position
            );
        } else {
            this._worldPosition = this.position.clone();
        }

        if (updateChildren) {
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].computeWorldPosition(false, true);
            }
        }
    }

    private computeWorldScale(updateParent = true, updateChildren = true) {
        if (updateParent && this.parent) {
            this.parent.computeWorldScale(true, false);
        }

        if (this.parent) {
            this._worldScale = Vector3.mulElements(
                this.parent.worldScale,
                this.scale
            );
        } else {
            this._worldScale = this.scale.clone();
        }

        if (updateChildren) {
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].computeWorldScale(false, true);
            }
        }
    }


    private computeWorldMatrix(updateParent = true, updateChildren = true) {
        this.computeWorldRotation();
        this.computeWorldPosition();
        this.computeWorldScale();

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

    static fromRaw(raw: SceneNodeType, meshes: Mesh[], cameras: Camera[], lights: Light[]): SceneNode {
        // NOTE: children are not set here
        const node = new SceneNode(
            {
                id: raw.id,
                name: raw.name,
                position: new Vector3(raw.translation[0], raw.translation[1], raw.translation[2]),
                rotation: new Quaternion(raw.rotation[0], raw.rotation[1], raw.rotation[2], raw.rotation[3]),
                scale: new Vector3(raw.scale[0], raw.scale[1], raw.scale[2]),
                mesh: raw.mesh !== undefined ? meshes[raw.mesh] : undefined,
                camera: raw.camera !== undefined ? cameras[raw.camera] : undefined,
                light: raw.light!== undefined ? lights[raw.light] : undefined,
            }
        );

        return node;
    }

    toRaw(nodeMap: Map<SceneNode, number>, meshMap: Map<Mesh, number>, cameraMap: Map<Camera, number>, lightMap: Map<Light, number>): SceneNodeType {
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

        // check if light is in the map
        if (this._light && !lightMap.has(this._light)) {
            throw new Error("Light must be in the map");
        }

        return {
            id: this._id,
            name: this._name,
            translation: this._position.toArray(),
            rotation: this.rotation.toArray(),
            scale: this._scale.toArray(),
            children: this._children.map(child => nodeMap.get(child)!!),
            mesh: this._mesh ? meshMap.get(this._mesh)!! : undefined,
            camera: this._camera ? cameraMap.get(this._camera)!! : undefined,
            light: this._light ? lightMap.get(this._light)!! : undefined,
        };
    }

    addComponent(component: NodeComponent) {
        component.addNodes(this);

        if (component instanceof Camera) {
            this._camera = component;
        }

        else if (component instanceof Light) {
            this._light = component;
        }

        else if (component instanceof Mesh) {
            this._mesh = component;
        }

        throw new Error("Unknown component type");
    }
}
