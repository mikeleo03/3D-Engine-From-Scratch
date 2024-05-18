import { Color } from "@/lib/cores"
import { Scene } from "../Scene"
import { SceneNode } from "../SceneNode"
import { AnimationClip, AnimationPath } from "../components/animations"
import { BasicMaterial, PhongMaterial } from "../components/materials"
import { MeshFactory } from "../components/mesh/MeshFactory"
import { Model } from "./Model"
import { Vector3 } from "../math"
import { AnimationTRS } from "../types/gltftypes";
import { AssertionError } from "assert";

export class LeonModel extends Model {
    private _leftFrontLeg?: SceneNode;
    private _rightFrontLeg?: SceneNode;
    private _leftBackLeg?: SceneNode;
    private _rightBackLeg?: SceneNode;
    private _leftEye?: SceneNode;
    private _rightEye?: SceneNode;
    private _leftEar?: SceneNode;
    private _rightEar?: SceneNode;
    
    constructor() {
        super();
    }

    private getEar(): SceneNode {
        const meshFactory = new MeshFactory();
        const earMaterial = new PhongMaterial({ name: "ear", ambientColor: new Color(72, 60, 50), diffuseColor: new Color(72, 60, 50), specularColor: new Color(255, 255, 255), shininess: 40, lightPosition: new Vector3(100, 100, 100)});
        const earMesh = meshFactory.cuboid(30, 40, 30, [earMaterial], { offset: [0, 15, 0] });
        return new SceneNode({name: 'Ear', mesh: earMesh});
    }

    private getHead(): SceneNode {
        const meshFactory = new MeshFactory();
        const headMaterial = new PhongMaterial({ name: "head", ambientColor: new Color(205, 127, 50), diffuseColor: new Color(205, 127, 50), specularColor: new Color(255, 255, 255), shininess: 40, lightPosition: new Vector3(100, 100, 100)});
        const headMesh = meshFactory.cuboid(70, 70, 70, [headMaterial], { offset: [0, 12.5, 0] });
        return new SceneNode({name: 'Head', mesh: headMesh});
    }

    private getBody(): SceneNode {
        const meshFactory = new MeshFactory();
        const bodyMaterial = new PhongMaterial({ name: "body", ambientColor: new Color(102, 61, 20), diffuseColor: new Color(102, 61, 20), specularColor: new Color(255, 255, 255), shininess: 40, lightPosition: new Vector3(100, 100, 100)});
        const bodyMesh = meshFactory.cuboid(100, 70, 200, [bodyMaterial]);
        return new SceneNode({name: 'Body', mesh: bodyMesh});
    }

    private getLeg(): SceneNode {
        const meshFactory = new MeshFactory();
        const legMaterial = new PhongMaterial({ name: "leg", ambientColor: new Color(184, 115, 51), diffuseColor: new Color(184, 115, 51), specularColor: new Color(255, 255, 255), shininess: 40, lightPosition: new Vector3(100, 100, 100)});
        const legMesh = meshFactory.cuboid(23, 40, 25, [legMaterial], { offset: [0, -15, 0] });
        return new SceneNode({name: 'Leg', mesh: legMesh});
    }

    private getEye(): SceneNode {
        const meshFactory = new MeshFactory();
        const eyeMaterial = new PhongMaterial({ name: "eye", ambientColor: new Color(0, 0, 0), diffuseColor: new Color(0, 0, 0), specularColor: new Color(255, 255, 255), shininess: 40, lightPosition: new Vector3(100, 100, 100)});
        const eyeMesh = meshFactory.cuboid(10, 10, 10, [eyeMaterial]);
        return new SceneNode({name: 'Eye', mesh: eyeMesh});
    }

    private getMouth(): SceneNode {
        const meshFactory = new MeshFactory();
        const mouthMaterial = new PhongMaterial({ name: "mouth", ambientColor: new Color(0, 0, 0), diffuseColor: new Color(0, 0, 0), specularColor: new Color(255, 255, 255), shininess: 40, lightPosition: new Vector3(100, 100, 100)});
        const mouthMesh = meshFactory.cuboid(20, 10, 10, [mouthMaterial]);
        return new SceneNode({name: 'Mouth', mesh: mouthMesh});
    }

    protected override getScene() {
        const nodes: SceneNode[] = [];

        const head = this.getHead();
        const leftEye = this.getEye();
        const rightEye = this.getEye();
        const mouth = this.getMouth();
        const leftEar = this.getEar();
        const rightEar = this.getEar();
        const body = this.getBody();
        const leftFrontLeg = this.getLeg();
        const rightFrontLeg = this.getLeg();
        const leftBackLeg = this.getLeg();
        const rightBackLeg = this.getLeg();

        leftEye.name = 'Left Eye';
        rightEye.name = 'Right Eye';
        leftEar.name = 'Left Ear';
        rightEar.name = 'Right Ear';
        leftFrontLeg.name = 'Left Front Leg';
        rightFrontLeg.name = 'Right Front Leg';
        leftBackLeg.name = 'Left Back Leg';
        rightBackLeg.name = 'Right Back Leg';

        // translation to make the position of every parts of the body
        head.translate(new Vector3(0, 20, 120));
        leftFrontLeg.translate(new Vector3(-35, -30, 70));
        rightFrontLeg.translate(new Vector3(35, -30, 70));
        leftBackLeg.translate(new Vector3(-35, -30, -60));
        rightBackLeg.translate(new Vector3(35, -30, -60));

        leftEye.translate(new Vector3(-15, 30, 35));
        rightEye.translate(new Vector3(15, 30, 35));
        mouth.translate(new Vector3(0, 0, 35));
        leftEar.translate(new Vector3(-20, 50, 20));
        rightEar.translate(new Vector3(20, 50, 20));
        
        head.add(leftEye);
        head.add(rightEye);
        head.add(mouth);
        head.add(leftEar);
        head.add(rightEar);

        const parent = new SceneNode({name: 'Dog'});
        parent.add(head);
        parent.add(body);
        parent.add(leftFrontLeg);
        parent.add(rightFrontLeg);
        parent.add(leftBackLeg);
        parent.add(rightBackLeg);

        parent.translate(new Vector3(0, 0, 0));
        parent.rotateByDegrees(new Vector3(30, 30, 0));
        parent.scaleBy(new Vector3(0.5, 0.5, 0.5));

        nodes.push(parent);

        this._leftFrontLeg = leftFrontLeg;
        this._rightFrontLeg = rightFrontLeg;
        this._leftBackLeg = leftBackLeg;
        this._rightBackLeg = rightBackLeg;
        this._leftEye = leftEye;
        this._rightEye = rightEye;
        this._leftEar = leftEar;
        this._rightEar = rightEar;

        return new Scene(nodes);
    }

    private getLeftEyeMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {},
            {},
            {},
            {},
            {},
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

    private getRightEyeMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {},
            {},
            {},
            {},
            {},
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

    private getRightEarMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {},
            {},
            {},
            {},
            {},
            {
                rotation: [0, 0, -5]
            },
            {
                rotation: [0, 0, -15]
            },
            {
                rotation: [0, 0, -5]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [0, 0, -5]
            },
            {
                rotation: [0, 0, -15]
            },
            {
                rotation: [0, 0, -5]
            },
            {
                rotation: [0, 0, 0]
            },
        ]

        return keyFrames;
    }

    private getLeftEarMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {},
            {},
            {},
            {},
            {},
            {
                rotation: [0, 0, 5]
            },
            {
                rotation: [0, 0, 15]
            },
            {
                rotation: [0, 0, 5]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [0, 0, 5]
            },
            {
                rotation: [0, 0, 15]
            },
            {
                rotation: [0, 0, 5]
            },
            {
                rotation: [0, 0, 0]
            },
        ]

        return keyFrames;
    }

    private getLeftFrontLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [15, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-15, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {}, {}, {}, {}, {}, {}, {}, {}
        ]

        return keyFrames;
    }

    private getRightFrontLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-15, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [15, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {}, {}, {}, {}, {}, {}, {}, {}
        ]

        return keyFrames;
    }

    private getRightBackLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [15, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-15, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {}, {}, {}, {}, {}, {}, {}, {}
        ]

        return keyFrames;
    }

    private getLeftBackLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-15, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [15, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {}, {}, {}, {}, {}, {}, {}, {}
        ]

        return keyFrames;
    }

    override getAnimations(): AnimationClip[] {
        const leftFrontLegMovements = this.getLeftFrontLegMovements();
        const rightFrontLegMovements = this.getRightFrontLegMovements();
        const rightBackLegMovements = this.getRightBackLegMovements();
        const leftBackLegMovements = this.getLeftBackLegMovements();
        const leftEyeMovements = this.getLeftEyeMovements();
        const rightEyeMovements = this.getRightEyeMovements();
        const leftEarMovements = this.getLeftEarMovements();
        const rightEarMovements = this.getRightEarMovements();

        // assert all keyframes have the same length
        const length = leftFrontLegMovements.length;
        if (rightFrontLegMovements.length !== length || rightBackLegMovements.length !== length || leftBackLegMovements.length !== length || leftFrontLegMovements.length !== length || rightBackLegMovements.length !== length || rightFrontLegMovements.length !== length || leftBackLegMovements.length !== length || leftFrontLegMovements.length !== length) {
            throw AssertionError;
        }

        const frames: AnimationPath[] = [];

        for (let i = 0; i < length; i++) {
            const pairs: {node: SceneNode, keyframe: AnimationTRS}[] = [];

            pairs.push({node: this._leftFrontLeg!!, keyframe: leftFrontLegMovements[i]});
            pairs.push({node: this._rightFrontLeg!!, keyframe: rightFrontLegMovements[i]});
            pairs.push({node: this._rightBackLeg!!, keyframe: rightBackLegMovements[i]});
            pairs.push({node: this._leftBackLeg!!, keyframe: leftBackLegMovements[i]});
            pairs.push({node: this._leftEye!!, keyframe: leftEyeMovements[i]});
            pairs.push({node: this._rightEye!!, keyframe: rightEyeMovements[i]});
            pairs.push({node: this._leftEar!!, keyframe: leftEarMovements[i]});
            pairs.push({node: this._rightEar!!, keyframe: rightEarMovements[i]});

            frames.push({nodeKeyframePairs: pairs});
        }

        const animation = {
            name: "walk and greet",
            frames: frames
        }

        return [animation];
    }
}