
import { GLContainer } from "@/lib/cores";
import { SceneNode } from "@/lib/data/SceneNode";
import { ObliqueCamera, OrthographicCamera, PerspectiveCamera } from "@/lib/data/components/cameras";
import { Vector3 } from "@/lib/data/math";
import { JojoModel } from "@/lib/data/models/JojoModel";
import { LeonModel } from "@/lib/data/models/LeonModel";
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
        1,
        -1,
        -1,
        1,
        0.01,
        1000,
        1
      );

      const perspectiveCamera = new PerspectiveCamera(
          canvas.width / canvas.height,
          60,
          0.01,
          1000,
          1
      );

      const obliqueCamera = new ObliqueCamera(
          1,
          -1,
          -1,
          1,
          0.01,
          1000,
          1,
          0,
          0
      );

      const cameraNodes = [
          new SceneNode({camera: orthographicCamera, position: new Vector3(0, 0, -100)}),
          new SceneNode({camera: perspectiveCamera}, ),
          new SceneNode({camera: obliqueCamera})
      ]

      cameraNodes[0].rotateByDegrees(new Vector3(0, 0, 0));

      const model = new JojoModel();

      const glRenderer = new GLRenderer(glContainer);

      const scene = model.scene;

      // change camera here
      scene.addNode(cameraNodes[0]);

      glRenderer.render(scene);
      
      // model.download();
    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}