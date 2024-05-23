import { GLContainer } from "@/lib/cores";
import { SceneNode } from "@/lib/data/SceneNode";
import { ObliqueCamera, OrthographicCamera, PerspectiveCamera } from "@/lib/data/components/cameras";
import { DirectionalLight } from "@/lib/data/components/lights";
import { Quaternion, Vector3 } from "@/lib/data/math";
import { Color } from "@/lib/cores/Color";
import { JojoModel } from "@/lib/data/models/JojoModel";
import { LeonModel } from "@/lib/data/models/LeonModel";
import { MaggieModel } from "@/lib/data/models/MaggieModel";
import { CubeModel } from "@/lib/data/models/CubeModel";
import { GLRenderer } from "@/lib/rendering/GLRenderer";
import { useEffect, useRef } from "react";

export default function TestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const initializeGL = async () => {
      const glContainer = new GLContainer(canvas);

      const orthographicCamera = new OrthographicCamera(
        canvas.height / 2,
        -canvas.height / 2,
        -canvas.width / 2,
        canvas.width / 2,
        0.01,
        1000,
        3
      );

      const perspectiveCamera = new PerspectiveCamera(
        canvas.width / canvas.height,
        1000,
        0.01,
        9999,
        1
      );

      const obliqueCamera = new ObliqueCamera(
        canvas.height / 2,
        -canvas.height / 2,
        -canvas.width / 2,
        canvas.width / 2,
        0.01,
        1000,
        1,
        0,
        0
      );

      const directionalLight = new DirectionalLight(
        new Color(255, 255, 255),
        1,
        new Vector3(0, 0, 0),
        new Color(255, 255, 255),
        new Color(255, 255, 255),
        new Color(255, 255, 255)
      );

      const lightPosition = new Vector3(2.6, -1.8, 0);

      const cameraNodes = [
        new SceneNode({ camera: orthographicCamera, position: new Vector3(0, 0, 200) }),
        new SceneNode({ camera: perspectiveCamera, position: new Vector3(0, 0, 100) }),
        new SceneNode({ camera: obliqueCamera, position: new Vector3(0, 0, 100) })
      ]

      const lightNodes = [
        new SceneNode({ light: directionalLight, position: lightPosition })
      ]

      const cube = new CubeModel();
      const jojo = new JojoModel();
      const leon = new LeonModel();
      const maggie = new MaggieModel();

      // change model here
      const model = cube;

      const glRenderer = new GLRenderer(glContainer);

      const scene = model.scene;

      scene.addNode(lightNodes[0])

      const obj = model.scene.nodes[0];

      cameraNodes[0].lookAt(obj.position);
      lightNodes[0].translate(new Vector3(0, 0, 0));
      lightNodes[0].lookAt(obj.position);

      // change camera here
      // scene.addNode(cameraNodes[0]);
      // scene.addNode(lightNodes[0]);

      glRenderer.enablePhongShading = true;
      glRenderer.render(scene, cameraNodes[0]);

      cube.download();
      // jojo.download();
      // leon.download();
      // maggie.download();
    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}