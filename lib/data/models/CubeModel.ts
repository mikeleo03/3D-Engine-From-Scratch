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
        const cubeMaterial = new PhongMaterial({ 
            name: "cube", 
            ambientColor: new Color(1 * 255, 0.5 * 255, 0.31 * 255), 
            diffuseColor: new Color(1 * 255, 0.5 * 255, 0.31 * 255), 
            specularColor: new Color(0.5 * 255, 0.5 * 255, 0.5 * 255), 
            shininess: 100
        });
        const cubeMesh = meshFactory.cuboid(80, 80, 80, {phongMaterial: cubeMaterial});
        return new SceneNode({name: 'Cube', mesh: cubeMesh});
    }

    protected override getScene() {
        const nodes: SceneNode[] = [];

        const cube = this.getCube();

        cube.translate(new Vector3(10, 10, 10));

        const parent = new SceneNode({name: 'Cube Model'});
        parent.add(cube);

        parent.translate(new Vector3(0, 0, 0));
        parent.rotateByDegrees(new Vector3(30, -30, 0));

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