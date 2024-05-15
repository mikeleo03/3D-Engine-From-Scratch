import { Float32ArrayConverter, Uint16ArrayConverter } from "@/lib/data/buffers/typedarrayconverters";
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
      const { CameraView, BufferViewTarget, AccessorComponentType } = await import('@/lib/data/types/gltftypes');
      const { WebGLType } = await import('@/lib/cores/gltypes');
      const { GLTFBuffer } = await import('@/lib/data/buffers/GLTFBuffer');
      const { BufferView } = await import('@/lib/data/buffers/BufferView');
      const { Accessor } = await import('@/lib/data/buffers/Accessor');
      const { SceneNode } = await import('@/lib/data/SceneNode');
      const { MeshBufferAttribute } = await import('@/lib/data/buffers/MeshBufferAttribute');
      const { MeshBufferGeometry } = await import('@/lib/data/buffers/MeshBufferGeometry');
      const { Mesh } = await import('@/lib/data/components/Mesh');
      const { Scene } = await import('@/lib/data/Scene');
      const { GLTFState } = await import('@/lib/data/GLTFState');
      const { GLTFRawState } = await import('@/lib/data/GLTFRawState');
      const { GLRenderer } = await import('@/lib/rendering/GLRenderer');
      const { RenderManager } = await import('@/lib/rendering/RenderManager');
      const { BasicMaterial } = await import ('@/lib/data/components/materials/BasicMaterial');

      const glContainer = new GLContainer(canvas);

      const camera = new PerspectiveCamera(16 / 9, 0.5, 0.1, 100);

      const cameras = [camera];
      const cameraMap = new Map();
      cameraMap.set(camera, 0);

      const gltfBufferRaw: BufferType = {
        "uri": "data:application/octet-stream;base64,AAABAAIAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8=",
        "byteLength": 80
      }

      const gltfBuffer = GLTFBuffer.fromRaw(gltfBufferRaw);
      const gltfBuffers = [gltfBuffer];


      const indicesBufferView = new BufferView(gltfBuffer, 0, 6, BufferViewTarget.ELEMENT_ARRAY_BUFFER);
      const verticesBufferView = new BufferView(gltfBuffer, 8, 72, BufferViewTarget.ARRAY_BUFFER);
      const bufferViews = [indicesBufferView, verticesBufferView];

      const uShortConverter = new Uint16ArrayConverter();
      const floatConverter = new Float32ArrayConverter();

      const indicesAccessor = new Accessor(
        indicesBufferView, 0, WebGLType.UNSIGNED_SHORT, 3, AccessorComponentType.SCALAR, [2], [0]);
      const verticesAccessor = new Accessor(
        verticesBufferView, 0, WebGLType.FLOAT, 3, AccessorComponentType.VEC3, [1, 1, 0], [0, 0, 0]);
      const normalAccessor = new Accessor(
        verticesBufferView, 36, WebGLType.FLOAT, 3, AccessorComponentType.VEC3, [0, 0, 1], [0, 0, 1]);
      const accessors = [indicesAccessor, verticesAccessor, normalAccessor];
      const accessorMap = new Map();
      accessorMap.set(indicesAccessor, 0);
      accessorMap.set(verticesAccessor, 1);
      accessorMap.set(normalAccessor, 2);

      const positionAttribute = new MeshBufferAttribute(
        verticesAccessor,
        3,
        floatConverter,
      );
      const indicesAttribute = new MeshBufferAttribute(
        indicesAccessor,
        1,
        uShortConverter,
      );
      const normalAttribute = new MeshBufferAttribute(
        normalAccessor,
        3,
        floatConverter,
      );

      const material = new BasicMaterial({name: "test"});
      const materials = [material];

      const geometry = new MeshBufferGeometry({
        POSITION: positionAttribute,
        NORMAL: normalAttribute,
      }, material, indicesAttribute);
      // geometry.calculateNormals(normalAccessor);

      const mesh = new Mesh([geometry]);

      const meshes = [mesh];
      const meshMap = new Map();
      meshMap.set(mesh, 0);

      const node = new SceneNode(
        new Vector3(0, 0, 0),
        new Quaternion(0, 0, 0, 1),
        new Vector3(1, 1, 1),
        undefined,
        mesh,
        camera,
      );
      const nodes = [node];
      const nodeMap = new Map();
      nodeMap.set(node, 0);

      const scene = new Scene(nodes);
      const scenes = [scene];

      const gltfState = new GLTFState(
        gltfBuffers,
        bufferViews,
        accessors,
        materials,
        meshes,
        cameras,
        nodes,
        scenes,
        0
      );

      // console.log(GLTFRawState.fromGLTFState(gltfState));

      const parser = new GLTFParser();

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

      const file = parser.write(gltfState);

      // downloadFile(file);
      // console.log(await parser.parse(file));

      const glRenderer = new GLRenderer(glContainer);
      // const renderManager = new RenderManager(gltfState, glRenderer);

      // renderManager.loop(30);
      glRenderer.render(scene);
    };

    initializeGL();
  }, [canvasRef.current]);

  return (
    <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
  );
}