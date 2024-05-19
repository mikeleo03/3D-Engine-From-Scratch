import { SceneNode } from "./SceneNode";
import { SceneType } from "./types/gltftypes";

export class Scene {
    private _nodes: SceneNode[];
    private _rootNodes: SceneNode[] = [];
    private _cameras: SceneNode[] = [];
    private _activeCameraNode: SceneNode | null = null;
    private _lights: SceneNode[] = [];
    private _activeLightNode: SceneNode | null = null;

    constructor(nodes: SceneNode[], activeCameraNode?: SceneNode, activeLightNode?: SceneNode) {
        this._nodes = [];
        this._rootNodes = [];
        this._cameras = [];
        this._lights = [];

        for (const node of nodes) {
            this.addNode(node);
        }

        if (activeCameraNode) {
            this._activeCameraNode = activeCameraNode;
        }
        
        if (activeLightNode) {
            this._activeLightNode = activeLightNode;
        }
    }

    get nodes(): SceneNode[] {
        return this._nodes.slice();
    }
    
    get roots(): SceneNode[] {
        return this._rootNodes.slice();
    }

    get cameras(): SceneNode[] {
        return this._cameras.slice();
    }

    get lights(): SceneNode[] {
        return this._lights.slice();
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

    getLightNode(index: number): SceneNode {
        return this._lights[index];
    }

    getActiveLightNode(): SceneNode | null {
        return this._activeLightNode;
    }

    setActiveLightNode(node: SceneNode) {
        if (this._lights.includes(node)) {
            this._activeLightNode = node;
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

        if (node.light !== undefined) {
            this._lights.push(node);
        }

        if (this._cameras.length === 1) {
            this._activeCameraNode = this._cameras[0];
        }

        if (this._lights.length === 1) {
            this._activeLightNode = this._lights[0];
        }

        for (const child of node.children) {
            this.addNode(child);
        }
    }

    private resetCurrentCamera() {
        if (this._cameras.length > 0) {
            this._activeCameraNode = this._cameras[0];
        } else {
            this._activeCameraNode = null;
        }
    }

    private resetCurrentLight() {
        if (this._lights.length > 0) {
            this._activeLightNode = this._lights[0];
        } else {
            this._activeLightNode = null;
        }
    }

    removeNode(node: SceneNode) {
        const index = this._nodes.indexOf(node);

        if (index === -1) {
            return;
        }
        
        this._nodes.splice(index, 1);
        

        if (this._rootNodes.includes(node)) {
            this._rootNodes.splice(this._rootNodes.indexOf(node), 1);
        }

        if (this._cameras.includes(node)) {
            this._cameras.splice(this._cameras.indexOf(node), 1);
        }

        if (this._lights.includes(node)) {
            this._lights.splice(this._lights.indexOf(node), 1);
        }
        
        if (this._activeCameraNode === node) {
            this.resetCurrentCamera();
        }

        if (this._activeLightNode === node) {
            this.resetCurrentLight();
        }

        // remove every child node
        for (const child of node.children) {
            this.removeNode(child);
        }
    }

    hasCamera(type: string) {
        return this._cameras.some(camera => camera.camera?.type === type);
    }

    hasLight(type: string) {
        return this._lights.some(light => light.light?.type === type);
    }

    static fromRaw(raw: SceneType, nodes: SceneNode[]): Scene {
        return new Scene(raw.nodes.map(index => nodes[index]), 
        raw.activeCamera !== -1 ? nodes[raw.activeCamera] : undefined,
        raw.activeLight !== -1 ? nodes[raw.activeLight] : undefined);
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
            activeCamera: this._activeCameraNode ? nodeMap.get(this._activeCameraNode)!! : -1,
            activeLight: this._activeLightNode ? nodeMap.get(this._activeLightNode)!! : -1
        };
    }
}