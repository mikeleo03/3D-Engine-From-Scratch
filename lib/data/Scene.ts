import { SceneNode } from "./SceneNode";
import { SceneType } from "./types/gltftypes";

export class Scene {
    private _nodes: SceneNode[];
    private _rootNodes: SceneNode[] = [];
    private _cameras: SceneNode[] = [];
    private _activeCameraNode: SceneNode | null = null;

    constructor(nodes: SceneNode[], activeCameraNode?: SceneNode) {
        this._nodes = nodes.slice();
        this._rootNodes = nodes.filter(node => node.parent === null);
        this._cameras = nodes.filter(node => node.camera !== undefined);

        if (activeCameraNode) {
            this._activeCameraNode = activeCameraNode;
        } 
        
        else if (this._cameras.length > 0) {
            this._activeCameraNode = this._cameras[0];
        }
    }

    get roots(): SceneNode[] {
        return this._rootNodes.slice();
    }

    get cameras(): SceneNode[] {
        return this._cameras.slice();
    }

    getRoot(index: number): SceneNode {
        return this._rootNodes[index];
    }

    getCameraNode(index: number): SceneNode {
        return this._cameras[index];
    }

    getActiveCameraNode(): SceneNode | null {
        return this._activeCameraNode;
    }

    setActiveCameraNode(node: SceneNode) {
        if (this._cameras.includes(node)) {
            this._activeCameraNode = node;
        }
    }

    addNode(node: SceneNode) {
        if (this._nodes.includes(node)) {
            return;
        }

        this._nodes.push(node);

        if (node.parent === null) {
            this._rootNodes.push(node);
        }

        if (node.camera !== undefined) {
            this._cameras.push(node);
        }

        if (this._cameras.length === 1) {
            this._activeCameraNode = this._cameras[0];
        }
    }

    private resetCurrentCamera() {
        if (this._cameras.length > 0) {
            this._activeCameraNode = this._cameras[0];
        } else {
            this._activeCameraNode = null;
        }
    }

    removeNode(node: SceneNode) {
        const index = this._nodes.indexOf(node);

        if (index >= 0) {
            this._nodes.splice(index, 1);
        }

        if (this._rootNodes.includes(node)) {
            this._rootNodes.splice(this._rootNodes.indexOf(node), 1);
        }

        if (this._cameras.includes(node)) {
            this._cameras.splice(this._cameras.indexOf(node), 1);
        }
        
        if (this._activeCameraNode === node) {
            this.resetCurrentCamera();
        }

        // remove every child node
        for (const child of node.children) {
            this.removeNode(child);
        }
        
    }

    static fromRaw(raw: SceneType, nodes: SceneNode[]): Scene {
        return new Scene(raw.nodes.map(index => nodes[index]), raw.activeCamera !== -1 ? nodes[raw.activeCamera] : undefined);
    }

    toRaw(nodeMap: Map<SceneNode, number>): SceneType {
        // check if all nodes are in the map
        for (let i = 0; i < this._nodes.length; i++) {
            if (!nodeMap.has(this._nodes[i])) {
                throw new Error("All nodes must be in the map");
            }
        }

        return {
            nodes: this._nodes.map(node => nodeMap.get(node)!!),
            activeCamera: this._activeCameraNode ? nodeMap.get(this._activeCameraNode)!! : -1
        };
    }
}