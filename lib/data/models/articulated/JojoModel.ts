import { Color } from "@/lib/cores";
import { Scene } from "../../Scene";
import { SceneNode } from "../../SceneNode";
import { AnimationClip, AnimationPath } from "../../components/animations";
import { BasicMaterial, PhongMaterial } from "../../components/materials";
import { MeshFactory } from "../../components/mesh/MeshFactory";
import { Model } from "../Model";
import { Vector3 } from "../../math";
import { AnimationTRS } from "../../types/gltftypes";
import { AssertionError } from "assert";

export class JojoModel extends Model {
    private _head?: SceneNode;
    private _leftHand?: SceneNode;
    private _rightHand?: SceneNode;
    private _leftLeg?: SceneNode;
    private _rightLeg?: SceneNode;

    constructor() {
        super();
    }

    private getBody(): SceneNode {
        const meshFactory = new MeshFactory();
        const bodyMaterial = new BasicMaterial(new Color(251, 231, 239), { name: "body" });
        const phongBodyMaterial = new PhongMaterial({ 
            name: "body-phong", 
            ambientColor: new Color(251, 231, 239), 
            diffuseColor: new Color(251, 231, 239), 
            specularColor: Color.white(),
            shininess: 5,
            diffuseMaps: [],
            normalMaps: [],
            displacementMaps: [],
            specularMaps: []
        });

        const bodyMesh = meshFactory.cuboid(50, 70, 30, 
            {basicMaterial: bodyMaterial, phongMaterial: phongBodyMaterial}
        );

        return new SceneNode({name: 'Body', mesh: bodyMesh});
    }

    private getHand(): SceneNode {
        const meshFactory = new MeshFactory();
        const handMaterial = new BasicMaterial(new Color(251, 231, 239), { name: "hand" });
        const phongHandMaterial = new PhongMaterial({
            name: "hand-phong",
            ambientColor: new Color(251, 231, 239),
            diffuseColor: new Color(251, 231, 239),
            specularColor: Color.white(),
            shininess: 4,
        });

        const handMesh = meshFactory.cuboid(15, 60, 25, 
            {basicMaterial: handMaterial, phongMaterial: phongHandMaterial}, 
            { offset: [0, -27, 0] }
        );

        return new SceneNode({name: 'Hand', mesh: handMesh});
    }

    private getHead(): SceneNode {
        const meshFactory = new MeshFactory();
        const headMaterial = new BasicMaterial(new Color(255, 219, 172), { name: "head" });
        const phongHeadMaterial = new PhongMaterial({
            name: "head-phong",
            ambientColor: new Color(255, 219, 172),
            diffuseColor: new Color(255, 219, 172),
            specularColor: Color.white(),
            shininess: 4
        });

        const headMesh = meshFactory.cuboid(
            25, 25, 25, 
            {basicMaterial: headMaterial, phongMaterial: phongHeadMaterial}, 
            { offset: [0, 12.5, 0] }
        );

        return new SceneNode({name: 'Head', mesh: headMesh});
    }

    private getLeg(): SceneNode {
        const meshFactory = new MeshFactory();
        const legMaterial = new BasicMaterial(new Color(108, 122, 137), { name: "leg" });
        const phongLegMaterial = new PhongMaterial({
            name: "leg-phong",
            ambientColor: new Color(108, 122, 137),
            diffuseColor: new Color(108, 122, 137),
            specularColor: Color.white(),
            shininess: 4
        });

        const legMesh = meshFactory.cuboid(23, 50, 25, 
            {basicMaterial: legMaterial, phongMaterial: phongLegMaterial}, 
            { offset: [0, -25, 0] }
        );

        return new SceneNode({name: 'Leg', mesh: legMesh});
    }

    private getEyeCover(): SceneNode {
        const meshFactory = new MeshFactory();
        const eyeConverMaterial = new BasicMaterial(Color.red(), { name: "eyeCover" });
        const eyeConverPhongMaterial = new PhongMaterial({
            name: "eyeCover-phong",
            ambientColor: Color.red(),
            diffuseColor: Color.red(),
            specularColor: Color.white(),
            shininess: 10
        });

        const eyeCoverMesh = meshFactory.cuboid(28, 10, 28, 
            {basicMaterial: eyeConverMaterial, phongMaterial: eyeConverPhongMaterial},
        );

        return new SceneNode({name: 'EyeConver', mesh: eyeCoverMesh});
    }

    private getMouth(): SceneNode {
        const meshFactory = new MeshFactory();
        const mouthMaterial = new BasicMaterial(Color.black(), { name: "mouth" });
        const phongMouthMaterial = new PhongMaterial({
            name: "mouth-phong",
            ambientColor: Color.black(),
            diffuseColor: Color.black(),
            specularColor: Color.white(),
            shininess: 6
        });

        const mouthMesh = meshFactory.cuboid(7, 1, 1, 
            {basicMaterial: mouthMaterial, phongMaterial: phongMouthMaterial}
        );

        return new SceneNode({name: 'Mouth', mesh: mouthMesh});
    }

    protected override getScene(): Scene {
        const body = this.getBody();
        const leftHand = this.getHand();
        const rightHand = this.getHand();
        const eyeConver = this.getEyeCover();
        const mouth = this.getMouth();
        const head = this.getHead();
        const leftLeg = this.getLeg();
        const rightLeg = this.getLeg();

        leftHand.name = 'LeftHand';
        rightHand.name = 'RightHand';
        leftLeg.name = 'LeftLeg';
        rightLeg.name = 'RightLeg';

        leftHand.translate(new Vector3(-32.5, 32, 0));
        rightHand.translate(new Vector3(32.5, 32, 0));
        eyeConver.translate(new Vector3(0, 15, 0));
        mouth.translate(new Vector3(0, 5, 13));
        head.translate(new Vector3(0, 35, 0));
        leftLeg.translate(new Vector3(-11.5, -35, 0));
        rightLeg.translate(new Vector3(11.5, -35, 0));

        leftHand.rotateByDegrees(new Vector3(0, 0, 0));
        rightHand.rotateByDegrees(new Vector3(-10, 0, 0));

        leftLeg.rotateByDegrees(new Vector3(-10, 0, 0));
        rightLeg.rotateByDegrees(new Vector3(0, 0, 0));
        
        head.add(eyeConver);
        head.add(mouth);

        body.name = 'Jojo';
        body.add(leftHand);
        body.add(rightHand);
        body.add(head);
        body.add(leftLeg);
        body.add(rightLeg);

        body.translate(new Vector3(0, 0, 0));
        body.rotateByDegrees(new Vector3(30, 30, 0));

        this._head = head;
        this._leftHand = leftHand;
        this._rightHand = rightHand;
        this._leftLeg = leftLeg;
        this._rightLeg = rightLeg;

        return new Scene([body]);
    }

    private getHeadMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [0, 5, 0]
            },
            {
                rotation: [0, 10, 0]
            },
            {
                rotation: [0, 15, 0]
            },
            {
                rotation: [0, 20, 0]
            },
            {
                rotation: [0, 15, 0]
            },
            {
                rotation: [0, 10, 0]
            },
            {
                rotation: [0, 5, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [0, -5, 0]
            },
            {
                rotation: [0, -10, 0]
            },
            {
                rotation: [0, -15, 0]
            },
            {
                rotation: [0, -20, 0]
            },
            {
                rotation: [0, -15, 0]
            },
            {
                rotation: [0, -10, 0]
            },
            {
                rotation: [0, -5, 0]
            },
            {
                rotation: [0, 0, 0]
            },
        ]

        return keyFrames;
    }

    private getLeftHandMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
        ]

        return keyFrames;
    }

    private getRightHandMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
        ]

        return keyFrames;
    }

    private getLeftLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
        ]        

        return keyFrames;
    }

    private getRightLegMovements(): AnimationTRS[] {
        const keyFrames: AnimationTRS[] = [
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-10, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [10, 0, 0]
            },
            {
                rotation: [5, 0, 0]
            },
            {
                rotation: [0, 0, 0]
            },
            {
                rotation: [-5, 0, 0]
            },
        ]
        
        return keyFrames;
    }


    override getAnimations(): AnimationClip[] {
        const headMovements = this.getHeadMovements();
        const leftHandMovements = this.getLeftHandMovements();
        const rightHandMovements = this.getRightHandMovements();
        const leftLegMovements = this.getLeftLegMovements();
        const rightLegMovements = this.getRightLegMovements();

        // assert all keyframes have the same length
        const length = headMovements.length;
        if (leftHandMovements.length !== length || rightHandMovements.length !== length || leftLegMovements.length !== length || rightLegMovements.length !== length) {
            throw AssertionError;
        }

        const frames: AnimationPath[] = [];

        for (let i = 0; i < length; i++) {
            const pairs: {node: SceneNode, keyframe: AnimationTRS}[] = [];

            pairs.push({node: this._head!!, keyframe: headMovements[i]});
            pairs.push({node: this._leftHand!!, keyframe: leftHandMovements[i]});
            pairs.push({node: this._rightHand!!, keyframe: rightHandMovements[i]});
            pairs.push({node: this._leftLeg!!, keyframe: leftLegMovements[i]});
            pairs.push({node: this._rightLeg!!, keyframe: rightLegMovements[i]});

            frames.push({nodeKeyframePairs: pairs});
        }

        const animation = {
            name: "walk",
            frames: frames
        }

        return [animation];
    }
}