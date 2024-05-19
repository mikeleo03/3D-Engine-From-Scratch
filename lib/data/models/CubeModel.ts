import { Color } from "@/lib/cores"
import { Scene } from "../Scene"
import { SceneNode } from "../SceneNode"
import { AnimationClip, AnimationPath } from "../components/animations"
import { PhongMaterial } from "../components/materials"
import { MeshFactory } from "../components/mesh/MeshFactory"
import { Model } from "./Model"
import { Vector3 } from "../math"

export class CubeModel extends Model {
    constructor() {
        super();
    }

    private getCube(): SceneNode {
        const meshFactory = new MeshFactory();
        const cubeMaterial = new PhongMaterial({ name: "cube", ambientColor: new Color(52, 25, 0), diffuseColor: new Color(204, 102, 0), specularColor: new Color(255, 255, 255), shininess: 80, lightPosition: new Vector3(120, -120, 120)});
        const cubeMesh = meshFactory.cuboid(100, 100, 100, [cubeMaterial]);
        return new SceneNode({name: 'Cube', mesh: cubeMesh});
    }

    protected override getScene() {
        const nodes: SceneNode[] = [];

        const cube = this.getCube();
        const parent = new SceneNode({name: 'Cube Model'});
        parent.add(cube);

        parent.translate(new Vector3(0, 0, 0));
        parent.rotateByDegrees(new Vector3(30, 30, 0));

        nodes.push(parent);
        return new Scene(nodes);
    }

    override getAnimations(): AnimationClip[] {
        const frames: AnimationPath[] = [];

        const animation = {
            name: "kosong",
            frames: frames
        }

        return [animation];
    }
}