import { useEffect, useRef } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const initializeGL = async () => {
      // IMPORTANT: use dynamic import to avoid loading the entire library at server side
      const { GLContainer } = await import('@/lib/cores/GLContainer');
      const { OrthographicCamera } = await import('@/lib/data/components/cameras/OrthographicCamera');
      const { PerspectiveCamera } = await import('@/lib/data/components/cameras/PerspectiveCamera');
      const { ObliqueCamera } = await import('@/lib/data/components/cameras/ObliqueCamera');
      const { GLRenderer } = await import('@/lib/rendering/GLRenderer');
      const { LeonModel } = await import('@/lib/data/models/LeonModel');
      const { RenderManager} = await import('@/lib/rendering/RenderManager');
      const { SceneNode } = await import('@/lib/data/SceneNode');

      const glContainer = new GLContainer(canvas);

      const orthographicCamera = new OrthographicCamera(
        canvas.height/2,
        -canvas.height/2,
        -canvas.width/2,
        canvas.width/2,
        0.01,
        1000
      );

      const perspectiveCamera = new PerspectiveCamera(
          canvas.width / canvas.height,
          20,
          0.01,
          9999
      );

      const obliqueCamera = new ObliqueCamera(
          1,
          -1,
          -1,
          1,
          0.01,
          100,
          20
      );

      const cameraNodes = [
          new SceneNode(undefined, undefined, undefined, undefined, undefined, orthographicCamera),
          new SceneNode(undefined, undefined, undefined, undefined, undefined, perspectiveCamera),
          new SceneNode(undefined, undefined, undefined, undefined, undefined, obliqueCamera)
      ]

      const leonModel = new LeonModel();
      
      const glRenderer = new GLRenderer(glContainer);

      const scene = leonModel.scene;

      scene.addNode(cameraNodes[1]);

      glRenderer.render(scene);
      // leonModel.download();
    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}