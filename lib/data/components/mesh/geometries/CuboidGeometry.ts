import { GLTFBuffer } from "@/lib/data/buffers/GLTFBuffer";
import { MeshBufferGeometry } from "./MeshBufferGeometry";
import { BasicMaterial } from "../../materials";
import { Color, WebGLType } from "@/lib/cores";
import { BufferView } from "@/lib/data/buffers/BufferView";
import { AccessorComponentType, BufferViewTarget } from "@/lib/data/types/gltftypes";
import { Accessor } from "@/lib/data/buffers/Accessor";
import { GLBufferAttribute } from "@/lib/data/buffers/GLBufferAttribute";
import { Float32ArrayConverter } from "@/lib/data/buffers/typedarrayconverters";

export class CuboidGeometry extends MeshBufferGeometry {
    static readonly MATERIAL_NAME = "CuboidMaterial";
    constructor(
        width: number = 1,
        height: number = 1,
        depth: number = 1,
    ) {
        const vertexBytesCount = 36 * 6 * 2;
        const normalBytesCount = vertexBytesCount;
        const totalBytesCount = vertexBytesCount + normalBytesCount;

        const buffer = GLTFBuffer.empty(totalBytesCount);
        const positionBufferView = new BufferView(buffer, 0, vertexBytesCount, BufferViewTarget.ARRAY_BUFFER);
        const normalBufferView = new BufferView(buffer, vertexBytesCount, normalBytesCount, BufferViewTarget.ARRAY_BUFFER)
        const positionAccessor = new Accessor(positionBufferView, 0, WebGLType.FLOAT, 36, AccessorComponentType.VEC3, [], []);
        const normalAccessor = new Accessor(normalBufferView, 0, WebGLType.FLOAT, 36, AccessorComponentType.VEC3, [], []);
        const floatConverter = new Float32ArrayConverter();
        const positionAttribute = new GLBufferAttribute(positionAccessor, 3, floatConverter);
        const normalAttribute = new GLBufferAttribute(normalAccessor, 3, floatConverter);

        const attributes = {
            position: positionAttribute,
            normal: normalAttribute,
        };

        const vertices = Float32Array.from([
            // front-first half
            -width / 2, -height / 2, depth / 2,
            width / 2, -height / 2, depth / 2,
            width / 2, height / 2, depth / 2,

            // front-second half
            width / 2, height / 2, depth / 2,
            -width / 2, height / 2, depth / 2,
            -width / 2, -height / 2, depth / 2,

            // back-first half
            -width / 2, -height / 2, -depth / 2,
            width / 2, -height / 2, -depth / 2,
            width / 2, height / 2, -depth / 2,

            // back-second half
            width / 2, height / 2, -depth / 2,
            -width / 2, height / 2, -depth / 2,
            -width / 2, -height / 2, -depth / 2,

            // top-first half
            -width / 2, height / 2, depth / 2,
            width / 2, height / 2, depth / 2,
            width / 2, height / 2, -depth / 2,

            // top-second half
            width / 2, height / 2, -depth / 2,
            -width / 2, height / 2, -depth / 2,
            -width / 2, height / 2, depth / 2,

            // bottom-first half
            -width / 2, -height / 2, depth / 2,
            width / 2, -height / 2, depth / 2,
            width / 2, -height / 2, -depth / 2,

            // bottom-second half
            width / 2, -height / 2, -depth / 2,
            -width / 2, -height / 2, -depth / 2,
            -width / 2, -height / 2, depth / 2,

            // right-first half
            width / 2, -height / 2, depth / 2,
            width / 2, -height / 2, -depth / 2,
            width / 2, height / 2, -depth / 2,

            // right-second half
            width / 2, height / 2, -depth / 2,
            width / 2, height / 2, depth / 2,
            width / 2, -height / 2, depth / 2,

            // left-first half
            -width / 2, -height / 2, depth / 2,
            -width / 2, -height / 2, -depth / 2,
            -width / 2, height / 2, -depth / 2,

            // left-second half
            -width / 2, height / 2, -depth / 2,
            -width / 2, height / 2, depth / 2,
            -width / 2, -height / 2, depth / 2,
        ]);

        positionAccessor.setData(floatConverter.tobytes(vertices));

        const material = new BasicMaterial({name: CuboidGeometry.MATERIAL_NAME, color: Color.fromRGBA(255, 0, 0, 255)});

        super(attributes, material);

        this.calculateNormals(normalAccessor);
    }
}