import { Color } from "@/lib/cores"
import { Scene } from "../../Scene"
import { SceneNode } from "../../SceneNode"
import { AnimationClip } from "../../components/animations"
import {BasicMaterial, PhongMaterial} from "../../components/materials"
import { MeshFactory } from "../../components/mesh/MeshFactory"
import { Model } from "../Model"
import { Quaternion, Vector3 } from "../../math"
import { OrthographicCamera } from "../../components/cameras"
import { Camera } from "../../components/cameras/Camera"

export class MarthenModel extends Model {
  constructor() {
    super();
  }

  private getHead() {
    const meshFactory = new MeshFactory();
    const headMaterial = new BasicMaterial(new Color(187, 226, 236), { name: "head" });
    const phongHeadMaterial = new PhongMaterial({
      name: "head-phong",
      ambientColor: new Color(187, 226, 236),
      diffuseColor: new Color(187, 226, 236),
      specularColor: new Color(255, 255, 255),
      shininess: 20
    })

    const headMesh = meshFactory.cuboid(50, 50, 50,
      {basicMaterial: headMaterial, phongMaterial: phongHeadMaterial}, { offset: [0, 25, 0] });
    return new SceneNode({mesh: headMesh});
  }

  private getBody() {
    const meshFactory = new MeshFactory();
    const bodyMaterial = new BasicMaterial(new Color(13, 146, 118), { name: "body" });
    const phongBodyMaterial = new PhongMaterial({
      name: "body-phong",
      ambientColor: new Color(13, 146, 118),
      diffuseColor: new Color(13, 146, 118),
      specularColor: new Color(255, 255, 255),
      shininess: 80
    })
    const bodyMesh = meshFactory.cuboid(100, 70, 100,
      {basicMaterial: bodyMaterial, phongMaterial: phongBodyMaterial});
    return new SceneNode({mesh: bodyMesh});
  }

  private getLeg() {
    const meshFactory = new MeshFactory();
    const legMaterial = new BasicMaterial(new Color(64, 162, 227), { name: "leg" });
    const phongLegMaterial = new PhongMaterial({
      name: "leg-phong",
      ambientColor: new Color(64, 162, 227),
      diffuseColor: new Color(64, 162, 227),
      specularColor: new Color(255, 255, 255),
      shininess: 40
    })
    const legMesh = meshFactory.cuboid(23, 40, 25,
      {basicMaterial: legMaterial, phongMaterial: phongLegMaterial}, { offset: [0, -20, 0] });
    return new SceneNode({mesh: legMesh});
  }

  private getEye() {
    const meshFactory = new MeshFactory();
    const eyeMaterial = new BasicMaterial(new Color(0, 0, 0), { name: "eye" });
    const phongEyeMaterial = new PhongMaterial({
      name: "eye-phong",
      ambientColor: new Color(0, 0, 0),
      diffuseColor: new Color(0, 0, 0),
      specularColor: new Color(255, 255, 255),
      shininess: 100
    })
    const eyeMesh = meshFactory.cuboid(10, 10, 10,
      {basicMaterial: eyeMaterial, phongMaterial: phongEyeMaterial});
    return new SceneNode({mesh: eyeMesh});
  }

  private getMouth() {
    const meshFactory = new MeshFactory();
    const mouthMaterial = new BasicMaterial(new Color(0, 0, 0), { name: "mouth" });
    const phongMouthMaterial = new PhongMaterial({
      name: "mouth-phong",
      ambientColor: new Color(0, 0, 0),
      diffuseColor: new Color(0, 0, 0),
      specularColor: new Color(255, 255, 255),
      shininess: 0
    })
    const mouthMesh = meshFactory.cuboid(20, 10, 10,
      {basicMaterial: mouthMaterial, phongMaterial: phongMouthMaterial});
    return new SceneNode({mesh: mouthMesh});
  }

  protected override getScene() {
    const nodes: SceneNode[] = [];

    // const eye = this.getEye();
    const head = this.getHead();
    const body = this.getBody();
    const leftFrontLeg = this.getLeg();
    const rightFrontLeg = this.getLeg();
    const leftBackLeg = this.getLeg();
    const rightBackLeg = this.getLeg();
    const leftEye = this.getEye();
    const rightEye = this.getEye();
    const mouth = this.getMouth();

    head.name = "Head";
    body.name = "Body";
    leftFrontLeg.name = "Left Front Leg";
    rightFrontLeg.name = "Right Front Leg";
    leftBackLeg.name = "Left Back Leg";
    rightBackLeg.name = "Right Back Leg";
    leftEye.name = "Left Eye";
    rightEye.name = "Right Eye";
    mouth.name = "Mouth";

    // translation to make the position of the limbs and other parts of the body
    body.translate(new Vector3(0, 10, -80));
    leftFrontLeg.translate(new Vector3(-35, -20, 37));
    rightFrontLeg.translate(new Vector3(35, -20, 37));
    leftBackLeg.translate(new Vector3(-35, -20, -37));
    rightBackLeg.translate(new Vector3(35, -20, -37));

    head.translate(new Vector3(0, 0, 0));
    leftEye.translate(new Vector3(-15, 30, 25));
    rightEye.translate(new Vector3(15, 30, 25));
    mouth.translate(new Vector3(0, 10, 25));

    head.add(leftEye);
    head.add(rightEye);
    head.add(mouth);

    body.add(leftFrontLeg);
    body.add(rightFrontLeg);
    body.add(leftBackLeg);
    body.add(rightBackLeg);

    const parent = new SceneNode({name: "Turtle"});
    parent.add(head);
    parent.add(body);

    parent.translate(new Vector3(0, 0, -100));
    parent.rotateByDegrees(new Vector3(30, 30, 0));

    nodes.push(parent);

    return new Scene(nodes);
  }

  override getAnimations(): AnimationClip[] {
    const headRef = this.scene.nodes[0].children[0];
    const frames = [];

    for (let i = 0; i <= 360; i += 10) {
      frames.push({
        nodeKeyframePairs: [
          {
            node: headRef,
            keyframe: {
              rotation: [0, 0, i]
            }
          }
        ]
      })
    }

    return [
      {
        name: "head-rotation",
        frames: frames
      }
    ]
  }
}