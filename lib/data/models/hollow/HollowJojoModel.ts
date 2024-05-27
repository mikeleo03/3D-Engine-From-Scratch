import { Color } from "@/lib/cores"
import { Scene } from "../../Scene"
import { SceneNode } from "../../SceneNode"
import { AnimationClip, AnimationPath } from "../../components/animations"
import { BasicMaterial, PhongMaterial } from "../../components/materials"
import { MeshFactory } from "../../components/mesh/MeshFactory"
import { Model } from "../Model"
import { Vector3 } from "../../math"
import { AnimationTRS } from "../../types/gltftypes"

export class HollowJojoModel extends Model {
    private _box?: SceneNode;

    constructor() {
        super();
    }

    private getTriangle(): SceneNode {
        const meshFactory = new MeshFactory();
        const triangleMaterial = new BasicMaterial(new Color(52, 25, 0), { name: "Hollow Triangle" });
        const phongTriangleMaterial = new PhongMaterial({
            name: "Hollow Triangle-phong",
            ambientColor: new Color(52, 25, 0),
            diffuseColor: new Color(204, 102, 0),
            specularColor: new Color(255, 255, 255),
            shininess: 60
        });

        const hollowTriangleMesh = meshFactory.hollowTriangle(
            80, 80, 50, 50, 30,
            { basicMaterial: triangleMaterial, phongMaterial: phongTriangleMaterial }
        );

        return new SceneNode({ name: 'Hollow Triangle', mesh: hollowTriangleMesh });
    }

    protected override getScene() {
        const triangle = this.getTriangle();

        triangle.rotateByDegrees(new Vector3(0, 180, 0));

        this._box = triangle;

        return new Scene([triangle]);
    }

    private getBoxMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                scale: [1, 0.5, 1]
            },
            {
                scale: [1, 0, 1]
            },
            {
                scale: [1, 0.5, 1]
            },
            {
                scale: [1, 1, 1]
            },
            {
                scale: [1, 0.5, 1]
            },
            {
                scale: [1, 0, 1]
            },
            {
                scale: [1, 0.5, 1]
            },
            {
                scale: [1, 1, 1]
            },
        ]

        return keyFrames;
    }

    override getAnimations(): AnimationClip[] {
        const boxMovements = this.getBoxMovements();

        const frames: AnimationPath[] = [];

        const length = boxMovements.length;
        for (let i = 0; i < length; i++) {
            const pairs: { node: SceneNode, keyframe: AnimationTRS }[] = [];

            pairs.push({ node: this._box!!, keyframe: boxMovements[i] });

            frames.push({ nodeKeyframePairs: pairs });
        }

        const animation = {
            name: "kosong",
            frames: frames
        }

        return [animation];
    }
}