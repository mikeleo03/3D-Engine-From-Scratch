class SceneNode {
    private _position: Vector3 = new Vector3();
    private _rotation: Vector3 = new Vector3();
    private _scale: Vector3 = new Vector3(1, 1, 1);
    private _localMatrix: Matrix4 = Matrix4.identity();
    private _worldMatrix: Matrix4 = Matrix4.identity();
    private _parent: SceneNode | null = null;
    private _children: SceneNode[] = []
    visible = true


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
            Matrix4.rotation3d(this._rotation),
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
}
