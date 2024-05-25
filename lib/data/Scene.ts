import { SceneNode } from "./SceneNode";
import { LightTypeString, SceneType } from "./types/gltftypes";

export class Scene {
    private _nodes: SceneNode[];
    private _rootNodes: SceneNode[] = [];
    private _cameras: SceneNode[] = [];
    private _activeCameraNode: SceneNode | null = null;
    private _lights: SceneNode[] = [];
    private _activeLightNode: SceneNode[] = [];

    constructor(nodes: SceneNode[], activeCameraNode?: SceneNode, activeLightNode?: SceneNode[]) {
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

    getActiveLightNode(): SceneNode[] {
        return this._activeLightNode.slice();
    }

    setActiveLightNode(nodes: SceneNode[]) {
        this._activeLightNode = nodes.filter(node => this._lights.includes(node));
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
            if (node.light.type === LightTypeString.DIRECTIONAL) {
                this._activeLightNode.push(node);
            }
        }

        if (this._cameras.length === 1) {
            this._activeCameraNode = this._cameras[0];
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
            this._activeLightNode = [this._lights[0]];
        } else {
            this._activeLightNode = [];
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

        if (this._activeLightNode.includes(node)) {
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

    cameraCount(type: string) {
        return this._cameras.filter(camera => camera.camera?.type === type).length;
    }

    hasLight(type: string) {
        return this._lights.some(light => light.light?.type === type);
    }

    static fromRaw(raw: SceneType, nodes: SceneNode[]): Scene {
        let activeLightNodes: SceneNode[] | undefined;
        
        if (Array.isArray(raw.activeLight)) {
            activeLightNodes = raw.activeLight.map(index => nodes[index]);
        } else if (raw.activeLight !== -1) {
            activeLightNodes = [nodes[raw.activeLight]];
        }
    
        return new Scene(
            raw.nodes.map(index => nodes[index]), 
            raw.activeCamera !== -1 ? nodes[raw.activeCamera] : undefined,
            activeLightNodes
        );
    }        

    toRaw(nodeMap: Map<SceneNode, number>): SceneType {
        // Check if all nodes are in the map
        for (const node of this._nodes) {
            if (!nodeMap.has(node)) {
                throw new Error("All nodes must be in the map");
            }
        }
    
        // Map active light nodes to their indices in the nodeMap
        const activeLightIndices = this._activeLightNode.map(node => nodeMap.get(node)!!);
    
        return {
            nodes: this._nodes.map(node => nodeMap.get(node)!!),
            activeCamera: this._activeCameraNode ? nodeMap.get(this._activeCameraNode)!! : -1,
            activeLight: activeLightIndices.length > 0 ? activeLightIndices : [-1]
        };
    }        
}