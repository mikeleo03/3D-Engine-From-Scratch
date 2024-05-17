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
      const { GLRenderer } = await import('@/lib/rendering/GLRenderer');
      const { JojoModel } = await import('@/lib/data/models/JojoModel');
      const { RenderManager} = await import('@/lib/rendering/RenderManager');

      const glContainer = new GLContainer(canvas);

      // const camera = new PerspectiveCamera(
      //   canvas.width / canvas.height,
      //   60,
      //   0.01,
      //   1000
      // );

      const camera = new OrthographicCamera(
        1,
        -1,
        -1,
        1,
        0.01,
        1000
      );

      // const camera = new ObliqueCamera(
      //   1,
      //   -1,
      //   -1,
      //   1,
      //   0.01,
      //   100,
      //   20
      // );

      const model = new JojoModel();

      console.log(model.scene.nodes)
      // model.download();
    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}