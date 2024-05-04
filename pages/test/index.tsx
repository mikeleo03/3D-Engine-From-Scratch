import { Float32ArrayConverter, Uint16ArrayConverter } from "@/lib/data/buffers/typedarrayconverters";
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
      const { Camera } = await import('@/lib/data/components/Camera');
      const { CameraView, BufferViewTarget, AccessorComponentType } = await import('@/lib/data/types/gltftypes');
      const { WebGLType } = await import('@/lib/cores/gltypes');
      const { GLTFBuffer } = await import('@/lib/data/buffers/GLTFBuffer');
      const { BufferView } = await import('@/lib/data/buffers/BufferView');
      const { Accessor } = await import('@/lib/data/buffers/Accessor');
      const { SceneNode } = await import('@/lib/data/SceneNode');
      const { MeshBufferAttribute } = await import('@/lib/data/buffers/MeshBufferAttribute');

      const glContainer = new GLContainer(canvas);

      const camera = new Camera(
        CameraView.PERSPECTIVE,
        1,
        1,
        1,
        1
      );

      const gltfBufferRaw: BufferType = {
        "uri": "data:application/octet-stream;base64,AAABAAIAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAAAAAACAPwAAAAA=",
        "byteLength": 44
      }

      const gltfBuffer = GLTFBuffer.fromRaw(gltfBufferRaw);
      const gltfBuffers = [gltfBuffer];


      const indicesBufferView = new BufferView(gltfBuffer, 0, 6, BufferViewTarget.ELEMENT_ARRAY_BUFFER);
      const verticesBufferView = new BufferView(gltfBuffer, 8, 36, BufferViewTarget.ARRAY_BUFFER);
      const bufferViews = [indicesBufferView, verticesBufferView];

      const uShortConverter = new Uint16ArrayConverter();
      const floatConverter = new Float32ArrayConverter();

      const indicesAccessor = new Accessor(
        indicesBufferView, 0, WebGLType.UNSIGNED_SHORT, 3, AccessorComponentType.SCALAR, [2], [0]);
      const verticesAccessor = new Accessor(
        verticesBufferView, 0, WebGLType.FLOAT, 3, AccessorComponentType.VEC3, [1, 1, 0], [0, 0, 0]);

      const positionAttribute = new MeshBufferAttribute(
        verticesAccessor, 
        3, 
        floatConverter, 
        {
          offset: 2,
          stride: 4
        }
      );
      positionAttribute.set(1, Float32Array.from([5, 5.22, 3.21]));

      const node = new SceneNode();

      const parser = new GLTFParser();

    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}