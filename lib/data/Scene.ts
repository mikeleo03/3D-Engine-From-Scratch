import { UUID } from "crypto";
import { SceneNode } from "./SceneNode";
import { SceneType } from "./types/gltftypes";

export class Scene {
    private _nodes: SceneNode[];

    constructor(nodes: SceneNode[]) {
        this._nodes = nodes;
    }

    get nodes(): SceneNode[] {
        return this._nodes;
    }

    get roots(): SceneNode[] {

    }

    getCamera(root: SceneNode, cameraId: UUID | null = null): SceneNode | null {

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
        };
    }
}