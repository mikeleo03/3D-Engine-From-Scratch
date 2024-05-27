import { Color } from "@/lib/cores"
import { Scene } from "../../Scene"
import { SceneNode } from "../../SceneNode"
import { AnimationClip, AnimationPath } from "../../components/animations"
import { BasicMaterial, PhongMaterial } from "@/lib/data/components/materials";
import { MeshFactory } from "@/lib/data/components/mesh/MeshFactory";
import { Model } from "../Model"
import { Vector3 } from "../../math"
import { AnimationTRS } from "../../types/gltftypes"

export class HollowMarthenModel extends Model {
  private _cylinder?: SceneNode;

  constructor() {
    super();
  }

  private getCylinder(): SceneNode {
    const meshFactory = new MeshFactory();
    const crossMaterial = new BasicMaterial(new Color(52, 25, 0), { name: "Cylinder" });
    const phongCylinderMaterial = new PhongMaterial({
      name: "Cylinder-phong",
      ambientColor: new Color(52, 25, 0),
      diffuseColor: new Color(204, 102, 0),
      specularColor: new Color(255, 255, 255),
      shininess: 60
    });
    const hollowCylinderMesh = meshFactory.hollowCylinder(
80, 80, 80, 10,
      { basicMaterial: crossMaterial, phongMaterial: phongCylinderMaterial }
    )

    return new SceneNode({ name: 'Cylinder', mesh: hollowCylinderMesh });
  }

  protected override getScene(): Scene {
    const cylinder = this.getCylinder();
    cylinder.translate(new Vector3(10, 10, 10));
    cylinder.rotateByDegrees(new Vector3(30, 30, 0));
    this._cylinder = cylinder;
    return new Scene([cylinder]);
  }

  override getAnimations(): AnimationClip[] {
    const bodyRef = this.scene.nodes[0];
    const frames: AnimationPath[] = [];

    for (let i = 0; i <= 360; i += 10) {
      frames.push({
        nodeKeyframePairs: [
          {
            node: bodyRef,
            keyframe: {
              rotation: [i, i, i]
            }
          }
        ]
      })
    }

    return [
      {
        name: "cylinder-rotation",
        frames: frames
      }
    ]
  }
}