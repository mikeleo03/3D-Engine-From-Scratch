import { SceneNode } from "../SceneNode";

export class NodeComponent {
    private _name: string;
    private _nodes: SceneNode[];

    constructor(name: string) {
        this._name = name;
        this._nodes = [];
    }

    get name() {
        return this._name;
    }

    get nodes() {
        return this._nodes;
    }

    addNodes(...node: SceneNode[]) {
        this._nodes.push(...node);
    }
}