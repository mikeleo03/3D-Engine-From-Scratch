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

export class MarthenModel extends Model {
  constructor() {
    super();
  }

  private getHead() {
    const meshFactory = new MeshFactory();
    const headMaterial = new BasicMaterial({ name: "head", color: new Color(187, 226, 236) });
    const headMesh = meshFactory.cuboid(50, 50, 50, [headMaterial], { offset: [0, 12.5, 0] });
    return new SceneNode({mesh: headMesh});
  }

  private getBody() {
    const meshFactory = new MeshFactory();
    const bodyMaterial = new BasicMaterial({ name: "body", color: new Color(13, 146, 118) });
    const bodyMesh = meshFactory.cuboid(100, 70, 100, [bodyMaterial]);
    return new SceneNode({mesh: bodyMesh});
  }

  private getLeg() {
    const meshFactory = new MeshFactory();
    const legMaterial = new BasicMaterial({ name: "leg", color: new Color(64, 162, 227) });
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
    const body = this.getBody();
    const leftFrontLeg = this.getLeg();
    const rightFrontLeg = this.getLeg();
    const leftBackLeg = this.getLeg();
    const rightBackLeg = this.getLeg();
    const leftEye = this.getEye();
    const rightEye = this.getEye();
    const mouth = this.getMouth();

    // translation to make the position of the limbs and other parts of the body
    body.translate(new Vector3(0, 10, -80));
    leftFrontLeg.translate(new Vector3(-35, -20, -120));
    rightFrontLeg.translate(new Vector3(35, -20, -120));
    leftBackLeg.translate(new Vector3(-35, -20, -50));
    rightBackLeg.translate(new Vector3(35, -20, -50));

    leftEye.translate(new Vector3(-15, 20, 25));
    rightEye.translate(new Vector3(15, 20, 25));
    mouth.translate(new Vector3(0, 0, 25));

    head.add(leftEye);
    head.add(rightEye);
    head.add(mouth);

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
    const headRef = this.scene.nodes[0].children[0];
    return [
      {
        name: "idle",
        frames: [
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 0],
                  translation: [0, 0, 0]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  translation: [0, 0, 15],
                  rotation: [0, 0, 15]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  translation: [0, 0, 30],
                  rotation: [0, 0, 30]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  translation: [0, 0, 45]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 60]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 75]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 90]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 105]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 120]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 135]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 150]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 165]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 180]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 195]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 210]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 225]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 240]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 255]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 270]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 285]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 300]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 315]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 330]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 345]
                }
              }
            ]
          },
          {
            nodeKeyframePairs: [
              {
                node: headRef,
                keyframe: {
                  rotation: [0, 0, 360]
                }
              }
            ]
          }
        ]
      }
    ];
  }
}