import { Float32ArrayConverter, Uint16ArrayConverter } from "@/lib/data/buffers/typedarrayconverters";
import { AnimationClip, AnimationPath } from "@/lib/data/components/animations";
import { Quaternion } from "@/lib/data/math/Quaternion";
import { Vector3 } from "@/lib/data/math/Vector";
import { BufferType } from "@/lib/data/types/gltftypes";
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

      const glContainer = new GLContainer(canvas);

      // const camera = new PerspectiveCamera(
      //   canvas.width / canvas.height,
      //   60,
      //   0.01,
      //   1000
      // );

      const camera = new OrthographicCamera(
        canvas.height / 2,
        -canvas.height / 2,
        -canvas.width / 2,
        canvas.width / 2,
        0.01,
        1000
      );

      // const camera = new ObliqueCamera(
      //   canvas.height / 2,
      //   -canvas.height / 2,
      //   -canvas.width / 2,
      //   canvas.width / 2,
      //   0.01,
      //   100,
      //   20
      // );

      const model = new JojoModel(camera);
     
      const glRenderer = new GLRenderer(glContainer);
      console.log(model.scene);
      glRenderer.render(model.scene);
    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}