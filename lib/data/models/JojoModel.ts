import { Color } from "@/lib/cores";
import { Scene } from "../Scene";
import { SceneNode } from "../SceneNode";
import { AnimationClip } from "../components/animations";
import { BasicMaterial } from "../components/materials";
import { MeshFactory } from "../components/mesh/MeshFactory";
import { Model } from "./Model";
import { Quaternion, Vector3 } from "../math";
import { OrthographicCamera } from "../components/cameras";
import { Camera } from "../components/cameras/Camera";

export class JojoModel extends Model {
    constructor(camera: Camera) {
        super(camera);
    }

    private getBody(): SceneNode {
        const meshFactory = new MeshFactory();
        const bodyMaterial = new BasicMaterial({ name: "body", color: new Color(251, 231, 239) });

        const bodyMesh = meshFactory.cuboid(50, 70, 20, [bodyMaterial]);

        return new SceneNode(undefined, undefined, undefined, undefined, bodyMesh);
    }

    private getHand(): SceneNode {
        const meshFactory = new MeshFactory();
        const handMaterial = new BasicMaterial({ name: "hand", color: new Color(251, 231, 239) });

        const handMesh = meshFactory.cuboid(15, 60, 20, [handMaterial], { offset: [0, -27, 0] });

        return new SceneNode(undefined, undefined, undefined, undefined, handMesh);
    }

    private getHead(): SceneNode {
        const meshFactory = new MeshFactory();
        const headMaterial = new BasicMaterial({ name: "head", color: new Color(255, 219, 172) });

        const headMesh = meshFactory.cuboid(25, 25, 25, [headMaterial], { offset: [0, 12.5, 0] });

        return new SceneNode(undefined, undefined, undefined, undefined, headMesh);
    }

    private getLeg(): SceneNode {
        const meshFactory = new MeshFactory();
        const legMaterial = new BasicMaterial({ name: "leg", color: new Color(108, 122, 137) });

        const legMesh = meshFactory.cuboid(23, 50, 20, [legMaterial], { offset: [0, -25, 0] });

        return new SceneNode(undefined, undefined, undefined, undefined, legMesh);
    }

    private getEyeConver(): SceneNode {
        const meshFactory = new MeshFactory();
        const eyeConverMaterial = new BasicMaterial({ name: "eyeConver", color: Color.red() });

        const eyeConverMesh = meshFactory.cuboid(28, 10, 23, [eyeConverMaterial]);

        return new SceneNode(undefined, undefined, undefined, undefined, eyeConverMesh);
    }

    private getMouth(): SceneNode {
        const meshFactory = new MeshFactory();
        const mouthMaterial = new BasicMaterial({ name: "mouth", color: new Color(0, 0, 0) });

        const mouthMesh = meshFactory.cuboid(7, 1, 1, [mouthMaterial]);

        return new SceneNode(undefined, undefined, undefined, undefined, mouthMesh);
    }

    protected override getScene(): Scene {
        const nodes: SceneNode[] = [];

        const body = this.getBody();
        const leftHand = this.getHand();
        const rightHand = this.getHand();
        const eyeConver = this.getEyeConver();
        const mouth = this.getMouth();
        const head = this.getHead();
        const leftLeg = this.getLeg();
        const rightLeg = this.getLeg();

        leftHand.translate(new Vector3(-32.5, 32, 0));
        rightHand.translate(new Vector3(32.5, 32, 0));
        eyeConver.translate(new Vector3(0, 15, 0));
        mouth.translate(new Vector3(0, 5, 0));
        head.translate(new Vector3(0, 35, 0));
        leftLeg.translate(new Vector3(-11.5, -35, 0));
        rightLeg.translate(new Vector3(11.5, -35, 0));

        leftHand.rotateByDegrees(new Vector3(0, 0, 0));
        rightHand.rotateByDegrees(new Vector3(10, 0, 0));

        leftLeg.rotateByDegrees(new Vector3(10, 0, 0));
        rightLeg.rotateByDegrees(new Vector3(0, 0, 0));
        
        head.add(eyeConver);
        head.add(mouth);

        const parent = new SceneNode();
        parent.add(body);
        parent.add(leftHand);
        parent.add(rightHand);
        parent.add(head);
        parent.add(leftLeg);
        parent.add(rightLeg);

        parent.translate(new Vector3(0, 0, -100));
        parent.rotateByDegrees(new Vector3(0, -30, 0));

        const cameraNode = new SceneNode(
            new Vector3(0, 0, 0),
            undefined,
            undefined,
            undefined,
            undefined,
            this.camera
        );


        nodes.push(parent);
        nodes.push(cameraNode);

        return new Scene(nodes);
    }

    override getAnimations(): AnimationClip[] {
        return [];
    }
}