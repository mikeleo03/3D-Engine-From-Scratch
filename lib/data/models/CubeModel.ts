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
        const cubeMaterial = new PhongMaterial({ name: "cube", ambientColor: new Color(1 * 255, 0.5 * 255, 0.31 * 255), diffuseColor: new Color(1 * 255, 0.5 * 255, 0.31 * 255), specularColor: new Color(0.5 * 255, 0.5 * 255, 0.5 * 255), shininess: 32, lightPosition: new Vector3(20, 70, 30)});
        const cubeMesh = meshFactory.cuboid(50, 50, 50, [cubeMaterial]);
        return new SceneNode({name: 'Cube', mesh: cubeMesh});
    }

    private getCubeLight(): SceneNode {
        const meshFactory = new MeshFactory();
        const cubeLightMaterial = new PhongMaterial({ name: "cubeLight", ambientColor: new Color(0.2 * 255, 0.2 * 255, 0.2 * 255), diffuseColor: new Color(0.5 * 255, 0.5 * 255, 0.5 * 255), specularColor: new Color(1.0 * 255, 1.0 * 255, 1.0 * 255), shininess: 32, lightPosition: new Vector3(-10, 90, 0)});
        const cubeLightMesh = meshFactory.cuboid(20, 20, 20, [cubeLightMaterial]);
        return new SceneNode({name: 'Cube Light', mesh: cubeLightMesh});
    }

    protected override getScene() {
        const nodes: SceneNode[] = [];

        const cube = this.getCube();
        const cubeLight = this.getCubeLight();

        cubeLight.translate(new Vector3(20, 70, 30));
        // cube.translate(new Vector3(200, 20, 20));

        const parent = new SceneNode({name: 'Cube Model'});
        parent.add(cubeLight);
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