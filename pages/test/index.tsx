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
      const { GLTFParser } = await import('@/lib/data/GLTFParser');
      const { PerspectiveCamera } = await import('@/lib/data/components/cameras/PerspectiveCamera');
      const { OrthographicCamera } = await import('@/lib/data/components/cameras/OrthographicCamera');
      const { ObliqueCamera } = await import('@/lib/data/components/cameras/ObliqueCamera');
      const { SceneNode } = await import('@/lib/data/SceneNode');
      const { MeshFactory } = await import('@/lib/data/components/mesh/MeshFactory');
      const { Mesh } = await import('@/lib/data/components/mesh/Mesh');
      const { Scene } = await import('@/lib/data/Scene');
      const { GLTFState } = await import('@/lib/data/GLTFState');
      const { GLTFRawState } = await import('@/lib/data/GLTFRawState');
      const { GLRenderer } = await import('@/lib/rendering/GLRenderer');
      const { RenderManager } = await import('@/lib/rendering/RenderManager');
      const { BasicMaterial } = await import('@/lib/data/components/materials/BasicMaterial');
      const { PhongMaterial } = await import('@/lib/data/components/materials/PhongMaterial');
      const { Color } = await import('@/lib/cores');
      const { AnimationClipUtil } = await import('@/lib/data/components/animations');

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
        1,
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

      const material1 = new BasicMaterial({ name: "test", color: Color.black() });
      const material2 = new BasicMaterial({ name: "test", color: Color.red() });
      const material3 = new BasicMaterial({ name: "test", color: Color.green() });
      const material4 = new BasicMaterial({ name: "test", color: Color.blue() });
      const material5 = new BasicMaterial({ name: "test", color: new Color(255, 255, 0, 255)});
      const material6 = new BasicMaterial({ name: "test", color: new Color(255, 0, 255, 255)});

      // const material = new PhongMaterial({ name: "test", ambientColor: Color.black(), diffuseColor: Color.black(), specularColor: Color.black(), shininess: 30, lightPosition: new Vector3(400, 400, 300) });

      const meshFactory = new MeshFactory();
      const cubeMesh = meshFactory.cuboid(50, 50, 50, material1, material2, material3, material4, material5, material6);

      const cubeNode = new SceneNode(
        new Vector3(0, 0, -50),
        new Quaternion(0, 0, 0, 1),
        new Vector3(1, 1, 1),
        undefined,
        cubeMesh
      );

      cubeNode.rotateByDegrees(new Vector3(0, -135, 0));

      const cameraNode = new SceneNode(
        new Vector3(0, 0, 0),
        new Quaternion(0, 0, 0, 1),
        new Vector3(1, 1, 1),
        undefined,
        undefined,
        camera
      );

      const nodes = [cubeNode, cameraNode];

      const scene = new Scene(nodes);

      function downloadFile(file: File) {
        // Create a temporary URL for the File object
        const url = window.URL.createObjectURL(file);

        // Create a link element
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name; // Use the file name from the File object

        // Simulate a click on the link to trigger the download
        link.click();

        // Clean up by revoking the Object URL
        window.URL.revokeObjectURL(url);
      }

      const glRenderer = new GLRenderer(glContainer);
      glRenderer.render(scene);
    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}