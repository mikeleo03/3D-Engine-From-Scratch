import { Color } from "@/lib/cores";
import { Scene } from "../Scene";
import { SceneNode } from "../SceneNode";
import { AnimationClip, AnimationPath } from "../components/animations";
import { BasicMaterial, PhongMaterial } from "../components/materials";
import { MeshFactory } from "../components/mesh/MeshFactory";
import { Model } from "./Model";
import { Vector3 } from "../math";
import { AnimationTRS } from "../types/gltftypes";
import { AssertionError } from "assert";

export class MaggieModel extends Model {
    private _head?: SceneNode;
    private _leftEar?: SceneNode;
    private _rightEar?: SceneNode;
    private _body?: SceneNode;
    private _frontLeftLeg?: SceneNode;
    private _frontRightLeg?: SceneNode;
    private _backLeftLeg?: SceneNode;
    private _backRightLeg?: SceneNode;
    private _tail?: SceneNode;
    private _leftEye?: SceneNode;
    private _rightEye?: SceneNode;
    private _nose?: SceneNode;

    constructor() {
        super();
    }

    private getBody(): SceneNode {
        const meshFactory = new MeshFactory();
        const bodyMaterial = new BasicMaterial(new Color(255, 228, 225), { name: "body" });

        const phongBodyMaterial = new PhongMaterial({
            name: "body-phong",
            ambientColor: new Color(255, 228, 225),
            diffuseColor: new Color(255, 228, 225),
            specularColor: Color.white(),
            shininess: 4
        });

        const bodyMesh = meshFactory.cuboid(60, 40, 60, { basicMaterial: bodyMaterial, phongMaterial: phongBodyMaterial });

        return new SceneNode({ name: 'Body', mesh: bodyMesh });
    }

    private getHead(): SceneNode {
        const meshFactory = new MeshFactory();
        const headMaterial = new BasicMaterial(new Color(255, 228, 225), { name: "head" });

        const phongHeadMaterial = new PhongMaterial({
            name: "head-phong",
            ambientColor: new Color(255, 228, 225),
            diffuseColor: new Color(255, 228, 225),
            specularColor: Color.white(),
            shininess: 4
        });

        const headMesh = meshFactory.cuboid(30, 30, 30, { basicMaterial: headMaterial, phongMaterial: phongHeadMaterial });

        return new SceneNode({ name: 'Head', mesh: headMesh });
    }

    private getLeg(): SceneNode {
        const meshFactory = new MeshFactory();
        const legMaterial = new BasicMaterial(new Color(255, 192, 203), { name: "leg" });

        const phongLegMaterial = new PhongMaterial({
            name: "leg-phong",
            ambientColor: new Color(255, 192, 203),
            diffuseColor: new Color(255, 192, 203),
            specularColor: Color.white(),
            shininess: 4
        });

        const legMesh = meshFactory.cuboid(10, 20, 10, { basicMaterial: legMaterial, phongMaterial: phongLegMaterial });

        return new SceneNode({ name: 'Leg', mesh: legMesh });
    }

    private getEar(): SceneNode {
        const meshFactory = new MeshFactory();
        const earMaterial = new BasicMaterial(new Color(255, 182, 193), { name: "ear" });

        const phongEarMaterial = new PhongMaterial({
            name: "ear-phong",
            ambientColor: new Color(255, 182, 193),
            diffuseColor: new Color(255, 182, 193),
            specularColor: Color.white(),
            shininess: 4
        });

        const earMesh = meshFactory.cuboid(10, 15, 5, { basicMaterial: earMaterial, phongMaterial: phongEarMaterial });

        return new SceneNode({ name: 'Ear', mesh: earMesh });
    }

    private getTail(): SceneNode {
        const meshFactory = new MeshFactory();
        const tailMaterial = new BasicMaterial(new Color(255, 182, 193), { name: "tail" });

        const phongTailMaterial = new PhongMaterial({
            name: "tail-phong",
            ambientColor: new Color(255, 182, 193),
            diffuseColor: new Color(255, 182, 193),
            specularColor: Color.white(),
            shininess: 4
        });

        const tailMesh = meshFactory.cuboid(5, 5, 30, { basicMaterial: tailMaterial, phongMaterial: phongTailMaterial });

        return new SceneNode({ name: 'Tail', mesh: tailMesh });
    }

    private getEye(): SceneNode {
        const meshFactory = new MeshFactory();
        const eyeMaterial = new BasicMaterial(new Color(0, 0, 0), { name: "eye" });

        const phongEyeMaterial = new PhongMaterial({
            name: "eye-phong",
            ambientColor: Color.black(),
            diffuseColor: Color.black(),
            specularColor: Color.white(),
            shininess: 4
        });

        const eyeMesh = meshFactory.cuboid(3, 3, 3, { basicMaterial: eyeMaterial, phongMaterial: phongEyeMaterial });

        return new SceneNode({ name: 'Eye', mesh: eyeMesh });
    }

    private getNose(): SceneNode {
        const meshFactory = new MeshFactory();
        const noseMaterial = new BasicMaterial(new Color(255, 182, 193), { name: "nose" });

        const phongNoseMaterial = new PhongMaterial({
            name: "nose-phong",
            ambientColor: new Color(255, 182, 193),
            diffuseColor: new Color(255, 182, 193),
            specularColor: Color.white(),
            shininess: 4
        });

        const noseMesh = meshFactory.cuboid(10, 5, 5, { basicMaterial: noseMaterial, phongMaterial: phongNoseMaterial });

        return new SceneNode({ name: 'Nose', mesh: noseMesh });
    }



    protected override getScene(): Scene {
        const body = this.getBody();
        const head = this.getHead();
        const leftEar = this.getEar();
        const rightEar = this.getEar();
        const frontLeftLeg = this.getLeg();
        const frontRightLeg = this.getLeg();
        const backLeftLeg = this.getLeg();
        const backRightLeg = this.getLeg();
        const tail = this.getTail();
        const leftEye = this.getEye();
        const rightEye = this.getEye();
        const nose = this.getNose();

        leftEar.name = 'LeftEar';
        rightEar.name = 'RightEar';
        frontLeftLeg.name = 'FrontLeftLeg';
        frontRightLeg.name = 'FrontRightLeg';
        backLeftLeg.name = 'BackLeftLeg';
        backRightLeg.name = 'BackRightLeg';
        leftEye.name = 'LeftEye';
        rightEye.name = 'RightEye';
        nose.name = 'Nose';

        head.translate(new Vector3(0, 25, 20));
        leftEar.translate(new Vector3(-15, 35, 20));
        rightEar.translate(new Vector3(15, 35, 20));
        frontLeftLeg.translate(new Vector3(-20, -20, 20));
        frontRightLeg.translate(new Vector3(20, -20, 20));
        backLeftLeg.translate(new Vector3(-20, -20, -20));
        backRightLeg.translate(new Vector3(20, -20, -20));
        tail.translate(new Vector3(0, 10, -30));

        leftEye.translate(new Vector3(-7, 10, 15)); // Adjusting positions to be attached to the head
        rightEye.translate(new Vector3(7, 10, 15));
        nose.translate(new Vector3(0, -5, 15));

        head.add(leftEye);
        head.add(rightEye);
        head.add(nose);

        body.name = 'Maggie';
        body.add(head);
        body.add(leftEar);
        body.add(rightEar);
        body.add(frontLeftLeg);
        body.add(frontRightLeg);
        body.add(backLeftLeg);
        body.add(backRightLeg);
        body.add(tail);

        body.translate(new Vector3(0, 0, 0));
        body.rotateByDegrees(new Vector3(0, 0, 0));

        this._head = head;
        this._leftEar = leftEar;
        this._rightEar = rightEar;
        this._body = body;
        this._frontLeftLeg = frontLeftLeg;
        this._frontRightLeg = frontRightLeg;
        this._backLeftLeg = backLeftLeg;
        this._backRightLeg = backRightLeg;
        this._tail = tail;
        this._leftEye = leftEye;
        this._rightEye = rightEye;
        this._nose = nose;

        return new Scene([body]);
    }

    private getHeadMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            { rotation: [0, 0, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 20, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 0, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -20, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, 0, 0] },
        ];

        return keyFrames;
    }

    private getLeftEarMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            { rotation: [0, 0, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 20, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 0, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -20, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, 0, 0] },
        ];

        return keyFrames;
    }

    private getRightEarMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            { rotation: [0, 0, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -20, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, 0, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 20, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 0, 0] },
        ];

        return keyFrames;
    }

    private getFrontLeftLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            { rotation: [0, 0, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 20, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 0, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -20, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, 0, 0] },
        ];

        return keyFrames;
    }

    private getFrontRightLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            { rotation: [0, 0, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -20, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, 0, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 20, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 0, 0] },
        ];

        return keyFrames;
    }

    private getBackLeftLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            { rotation: [0, 0, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 20, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 0, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -20, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, 0, 0] },
        ];

        return keyFrames;
    }

    private getBackRightLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            { rotation: [0, 0, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -20, 0] },
            { rotation: [0, -15, 0] },
            { rotation: [0, -10, 0] },
            { rotation: [0, -5, 0] },
            { rotation: [0, 0, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 20, 0] },
            { rotation: [0, 15, 0] },
            { rotation: [0, 10, 0] },
            { rotation: [0, 5, 0] },
            { rotation: [0, 0, 0] },
        ];

        return keyFrames;
    }

    private getTailMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            { rotation: [0, 0, 0] },
            { rotation: [5, 0, 0] },
            { rotation: [10, 0, 0] },
            { rotation: [15, 0, 0] },
            { rotation: [20, 0, 0] },
            { rotation: [15, 0, 0] },
            { rotation: [10, 0, 0] },
            { rotation: [5, 0, 0] },
            { rotation: [0, 0, 0] },
            { rotation: [-5, 0, 0] },
            { rotation: [-10, 0, 0] },
            { rotation: [-15, 0, 0] },
            { rotation: [-20, 0, 0] },
            { rotation: [-15, 0, 0] },
            { rotation: [-10, 0, 0] },
            { rotation: [-5, 0, 0] },
            { rotation: [0, 0, 0] },
        ];

        return keyFrames;
    }

    override getAnimations(): AnimationClip[] {
        const headMovements = this.getHeadMovements();
        const leftEarMovements = this.getLeftEarMovements();
        const rightEarMovements = this.getRightEarMovements();
        const frontLeftLegMovements = this.getFrontLeftLegMovements();
        const frontRightLegMovements = this.getFrontRightLegMovements();
        const backLeftLegMovements = this.getBackLeftLegMovements();
        const backRightLegMovements = this.getBackRightLegMovements();
        const tailMovements = this.getTailMovements();

        // assert all keyframes have the same length
        const length = headMovements.length;
        if (
            leftEarMovements.length !== length ||
            rightEarMovements.length !== length ||
            frontLeftLegMovements.length !== length ||
            frontRightLegMovements.length !== length ||
            backLeftLegMovements.length !== length ||
            backRightLegMovements.length !== length ||
            tailMovements.length !== length
        ) {
            throw AssertionError;
        }

        const frames: AnimationPath[] = [];

        for (let i = 0; i < length; i++) {
            const pairs: { node: SceneNode, keyframe: AnimationTRS }[] = [];

            pairs.push({ node: this._head!!, keyframe: headMovements[i] });
            pairs.push({ node: this._leftEar!!, keyframe: leftEarMovements[i] });
            pairs.push({ node: this._rightEar!!, keyframe: rightEarMovements[i] });
            pairs.push({ node: this._frontLeftLeg!!, keyframe: frontLeftLegMovements[i] });
            pairs.push({ node: this._frontRightLeg!!, keyframe: frontRightLegMovements[i] });
            pairs.push({ node: this._backLeftLeg!!, keyframe: backLeftLegMovements[i] });
            pairs.push({ node: this._backRightLeg!!, keyframe: backRightLegMovements[i] });
            pairs.push({ node: this._tail!!, keyframe: tailMovements[i] });

            frames.push({ nodeKeyframePairs: pairs });
        }

        const animation = {
            name: "walk",
            frames: frames
        }

        return [animation];
    }
}
