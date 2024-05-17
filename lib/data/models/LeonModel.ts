import { Color } from "@/lib/cores"
import { Scene } from "../Scene"
import { SceneNode } from "../SceneNode"
import { AnimationClip } from "../components/animations"
import { BasicMaterial } from "../components/materials"
import { MeshFactory } from "../components/mesh/MeshFactory"
import { Model } from "./Model"
import { Quaternion, Vector3 } from "../math"
import { OrthographicCamera } from "../components/cameras"
import { Camera } from "../components/cameras/Camera"

export class LeonModel extends Model {
    constructor() {
        super();
    }

    private getEar() {
        const meshFactory = new MeshFactory();
        const earMaterial = new BasicMaterial({ name: "ear", color: new Color(72, 60, 50) });
        const earMesh = meshFactory.cuboid(30, 40, 30, [earMaterial]);
        return new SceneNode({mesh: earMesh});
    }

    private getHead() {
        const meshFactory = new MeshFactory();
        const headMaterial = new BasicMaterial({ name: "head", color: new Color(205, 127, 50) });
        const headMesh = meshFactory.cuboid(70, 70, 70, [headMaterial], { offset: [0, 12.5, 0] });
        return new SceneNode({mesh: headMesh});
    }

    private getBody() {
        const meshFactory = new MeshFactory();
        const bodyMaterial = new BasicMaterial({ name: "body", color: new Color(102, 61, 20) });
        const bodyMesh = meshFactory.cuboid(100, 70, 200, [bodyMaterial]);
        return new SceneNode({mesh: bodyMesh});
    }

    private getLeg() {
        const meshFactory = new MeshFactory();
        const legMaterial = new BasicMaterial({ name: "leg", color: new Color(184, 115, 51) });
        const legMesh = meshFactory.cuboid(23, 40, 25, [legMaterial], { offset: [0, -25, 0] });
        return new SceneNode({mesh: legMesh});
    }

    private getEye() {
        const meshFactory = new MeshFactory();
        const eyeMaterial = new BasicMaterial({ name: "eye", color: new Color(0, 0, 0) });
        const eyeMesh = meshFactory.cuboid(10, 10, 10, [eyeMaterial]);
        return new SceneNode({mesh: eyeMesh});
    }

    private getMouth() {
        const meshFactory = new MeshFactory();
        const mouthMaterial = new BasicMaterial({ name: "mouth", color: new Color(0, 0, 0) });
        const mouthMesh = meshFactory.cuboid(20, 10, 10, [mouthMaterial]);
        return new SceneNode({mesh: mouthMesh});
    }

    protected override getScene() {
        const nodes: SceneNode[] = [];

        // const eye = this.getEye();
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

        // translation to make the position of the limbs and other parts of the body
        body.translate(new Vector3(0, 10, -120));
        head.translate(new Vector3(0, 30, 20));
        leftFrontLeg.translate(new Vector3(-35, -20, -50));
        rightFrontLeg.translate(new Vector3(35, -20, -50));
        leftBackLeg.translate(new Vector3(-35, -20, -180));
        rightBackLeg.translate(new Vector3(35, -20, -180));

        leftEye.translate(new Vector3(-15, 30, 45));
        rightEye.translate(new Vector3(15, 30, 45));
        mouth.translate(new Vector3(0, 0, 45));
        leftEar.translate(new Vector3(-20, 60, 22));
        rightEar.translate(new Vector3(20, 60, 22));
        
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
        parent.rotateByDegrees(new Vector3(30, 30, 0));

        nodes.push(parent);

        return new Scene(nodes);
    }

  override getAnimations(): AnimationClip[] {
    return [];
  }
}