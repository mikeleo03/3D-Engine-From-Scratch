import { Color } from "@/lib/cores"
import { Scene } from "../Scene"
import { SceneNode } from "../SceneNode"
import { AnimationClip, AnimationPath } from "../components/animations"
import { BasicMaterial } from "../components/materials"
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
    
    constructor() {
        super();
    }

    private getEar(): SceneNode {
        const meshFactory = new MeshFactory();
        const earMaterial = new BasicMaterial({ name: "ear", color: new Color(72, 60, 50) });
        const earMesh = meshFactory.cuboid(30, 40, 30, [earMaterial]);
        return new SceneNode({name: 'Ear', mesh: earMesh});
    }

    private getHead(): SceneNode {
        const meshFactory = new MeshFactory();
        const headMaterial = new BasicMaterial({ name: "head", color: new Color(205, 127, 50) });
        const headMesh = meshFactory.cuboid(70, 70, 70, [headMaterial], { offset: [0, 12.5, 0] });
        return new SceneNode({name: 'Head', mesh: headMesh});
    }

    private getBody(): SceneNode {
        const meshFactory = new MeshFactory();
        const bodyMaterial = new BasicMaterial({ name: "body", color: new Color(102, 61, 20) });
        const bodyMesh = meshFactory.cuboid(100, 70, 200, [bodyMaterial]);
        return new SceneNode({name: 'Body', mesh: bodyMesh});
    }

    private getLeg(): SceneNode {
        const meshFactory = new MeshFactory();
        const legMaterial = new BasicMaterial({ name: "leg", color: new Color(184, 115, 51) });
        const legMesh = meshFactory.cuboid(23, 40, 25, [legMaterial], { offset: [0, -15, 0] });
        return new SceneNode({name: 'Leg', mesh: legMesh});
    }

    private getEye(): SceneNode {
        const meshFactory = new MeshFactory();
        const eyeMaterial = new BasicMaterial({ name: "eye", color: new Color(0, 0, 0) });
        const eyeMesh = meshFactory.cuboid(10, 10, 10, [eyeMaterial]);
        return new SceneNode({name: 'Eye', mesh: eyeMesh});
    }

    private getMouth(): SceneNode {
        const meshFactory = new MeshFactory();
        const mouthMaterial = new BasicMaterial({ name: "mouth", color: new Color(0, 0, 0) });
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

        // translation to make the position of the limbs and other parts of the body
        body.translate(new Vector3(0, 10, -120));
        head.translate(new Vector3(0, 30, 15));
        leftFrontLeg.translate(new Vector3(-35, -20, -50));
        rightFrontLeg.translate(new Vector3(35, -20, -50));
        leftBackLeg.translate(new Vector3(-35, -20, -180));
        rightBackLeg.translate(new Vector3(35, -20, -180));

        leftEye.translate(new Vector3(-15, 30, 35));
        rightEye.translate(new Vector3(15, 30, 35));
        mouth.translate(new Vector3(0, 0, 35));
        leftEar.translate(new Vector3(-20, 60, 20));
        rightEar.translate(new Vector3(20, 60, 20));
        
        head.add(leftEye);
        head.add(rightEye);
        head.add(mouth);
        head.add(leftEar);
        head.add(rightEar);

        const parent = new SceneNode();
        parent.add(head);
        parent.add(body);
        parent.add(leftFrontLeg);
        parent.add(rightFrontLeg);
        parent.add(leftBackLeg);
        parent.add(rightBackLeg);

        parent.translate(new Vector3(0, 0, -100));
        parent.rotateByDegrees(new Vector3(0, 0, 0));

        nodes.push(parent);

        this._leftFrontLeg = leftFrontLeg;
        this._rightFrontLeg = rightFrontLeg;
        this._leftBackLeg = leftBackLeg;
        this._rightBackLeg = rightBackLeg;

        return new Scene(nodes);
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
        ]

        return keyFrames;
    }

    override getAnimations(): AnimationClip[] {
        const leftFrontLegMovements = this.getLeftFrontLegMovements();
        const rightFrontLegMovements = this.getRightFrontLegMovements();
        const rightBackLegMovements = this.getRightBackLegMovements();
        const leftBackLegMovements = this.getLeftBackLegMovements();

        // assert all keyframes have the same length
        const length = leftFrontLegMovements.length;
        if (rightFrontLegMovements.length !== length || rightBackLegMovements.length !== length || leftBackLegMovements.length !== length) {
            throw AssertionError;
        }

        const frames: AnimationPath[] = [];

        for (let i = 0; i < length; i++) {
            const pairs: {node: SceneNode, keyframe: AnimationTRS}[] = [];

            pairs.push({node: this._leftFrontLeg!!, keyframe: leftFrontLegMovements[i]});
            pairs.push({node: this._rightFrontLeg!!, keyframe: rightFrontLegMovements[i]});
            pairs.push({node: this._rightBackLeg!!, keyframe: rightBackLegMovements[i]});
            pairs.push({node: this._leftBackLeg!!, keyframe: leftBackLegMovements[i]});

            frames.push({nodeKeyframePairs: pairs});
        }

        const animation = {
            name: "walking",
            frames: frames
        }

        return [animation];
    }
}