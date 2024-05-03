import { UUID } from "crypto";
import { SceneNode } from "./Node";

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
}