
import { GLContainer } from "@/lib/cores";
import { SceneNode } from "@/lib/data/SceneNode";
import { ObliqueCamera, OrthographicCamera, PerspectiveCamera } from "@/lib/data/components/cameras";
import { DirectionalLight } from "@/lib/data/components/lights";
import { Quaternion, Vector3 } from "@/lib/data/math";
import { Color } from "@/lib/cores/Color";
import { JojoModel } from "@/lib/data/models/JojoModel";
import { LeonModel } from "@/lib/data/models/LeonModel";
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
        canvas.height/2,
        -canvas.height/2,
        -canvas.width/2,
        canvas.width/2,
        0.01,
        1000,
        1
      );

      const perspectiveCamera = new PerspectiveCamera(
          canvas.width / canvas.height,
          1000,
          0.01,
          9999,
          1
      );

      const obliqueCamera = new ObliqueCamera(
          canvas.height/2,
          -canvas.height/2,
          -canvas.width/2,
          canvas.width/2,
          0.01,
          1000,
          1,
          0,
          0
      );

      const directionalLight = new DirectionalLight(
        new Color(255, 255, 255),
        40,
        new Vector3(0, 0, 0),
        new Color(0.2 * 255, 0.2 * 255, 0.2 * 255),
        new Color(0.5 * 255, 0.5 * 255, 0.5 * 255),
        new Color(255, 255, 255)
      );

      const lightPosition = new Vector3(-300, -1000, 300);

      const cameraNodes = [
          new SceneNode({camera: orthographicCamera, position: new Vector3(0, 0, 100)}),
          new SceneNode({camera: perspectiveCamera, position: new Vector3(0, 0, 100)}),
          new SceneNode({camera: obliqueCamera, position: new Vector3(0, 0, 100)})
      ]

      const lightNodes = [
        new SceneNode({light: directionalLight, position: lightPosition})
      ]

      const jojo = new JojoModel();

      const glRenderer = new GLRenderer(glContainer);
      const scene = jojo.scene;

      scene.addNode(lightNodes[0])

      const leon = jojo.scene.nodes[0];
      // leon.translate(new Vector3(-700, 0, 0));
      // cameraNodes[0].lookAt(leon.position);
      // lightNodes[0].lookAt(leon.position);
      cameraNodes[0].lookAt(jojo.scene.nodes[0].position);

      // change camera here
      // scene.addNode(cameraNodes[0]);
      // scene.addNode(lightNodes[0]);

      glRenderer.render(scene, cameraNodes[0]);
      
      jojo.download();
    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}