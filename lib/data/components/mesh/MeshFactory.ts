import { WebGLType } from "@/lib/cores";
import { Accessor } from "../../buffers/Accessor";
import { BufferView } from "../../buffers/BufferView";
import { GLBufferAttribute } from "../../buffers/GLBufferAttribute";
import { GLTFBuffer } from "../../buffers/GLTFBuffer";
import { Float32ArrayConverter } from "../../buffers/typedarrayconverters";
import { AccessorComponentType, BufferViewTarget } from "../../types/gltftypes";
import { ShaderMaterial } from "../materials";
import { MeshBufferGeometry } from "./MeshBufferGeometry";
import { Mesh } from "./Mesh";

export class MeshFactory {
    private _geometries: MeshBufferGeometry[] = [];

    addGeometry(positions: [number, number, number][], material: ShaderMaterial): void {
        const vertexBytesCount = positions.length * 4 * 3;
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

        const vertices = Float32Array.from(positions.flat());

        positionAccessor.setData(floatConverter.tobytes(vertices));

        const geometry = new MeshBufferGeometry(attributes, material);
        geometry.calculateNormals(normalAccessor);

        this._geometries.push(geometry);
    }

    createMesh(): Mesh {
        const mesh = new Mesh(this._geometries);
        this._geometries = [];
        return mesh;
    }

    cuboid(width: number, height: number, depth: number, ...materials: ShaderMaterial[]): Mesh {
        if (materials.length === 0) {
            throw new Error("At least one material is required");
        }

        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        var materialIndex = 0;

        // make sure to follow the right-hand rule
        // 6 vertex per square face

        // front face
        this.addGeometry([
            [-halfWidth, -halfHeight, halfDepth],
            [halfWidth, -halfHeight, halfDepth],
            [halfWidth, halfHeight, halfDepth],
            [-halfWidth, halfHeight, halfDepth],
            [-halfWidth, -halfHeight, halfDepth],
            [halfWidth, halfHeight, halfDepth],
        ], materials[materialIndex]);

        if (materials.length > 1) {
            materialIndex++;
        }

        // back face
        this.addGeometry([
            [halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
            [halfWidth, halfHeight, -halfDepth],
            [halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
        ], materials[materialIndex]);

        if (materials.length > 2) {
            materialIndex++;
        }

        // top face
        this.addGeometry([
            [-halfWidth, halfHeight, halfDepth],
            [halfWidth, halfHeight, halfDepth],
            [halfWidth, halfHeight, -halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
            [-halfWidth, halfHeight, halfDepth],
            [halfWidth, halfHeight, -halfDepth],
        ], materials[materialIndex]);

        if (materials.length > 3) {
            materialIndex++;
        }

        // bottom face
        this.addGeometry([
            [-halfWidth, -halfHeight, -halfDepth],
            [halfWidth, -halfHeight, -halfDepth],
            [halfWidth, -halfHeight, halfDepth],
            [-halfWidth, -halfHeight, halfDepth],
            [-halfWidth, -halfHeight, -halfDepth],
            [halfWidth, -halfHeight, halfDepth],
        ], materials[materialIndex]);

        if (materials.length > 4) {
            materialIndex++;
        }

        // right face
        this.addGeometry([
            [halfWidth, -halfHeight, halfDepth],
            [halfWidth, -halfHeight, -halfDepth],
            [halfWidth, halfHeight, -halfDepth],
            [halfWidth, halfHeight, halfDepth],
            [halfWidth, -halfHeight, halfDepth],
            [halfWidth, halfHeight, -halfDepth],
        ], materials[materialIndex]);

        if (materials.length > 5) {
            materialIndex++;
        }

        // left face
        this.addGeometry([
            [-halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, -halfHeight, halfDepth],
            [-halfWidth, halfHeight, halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
            [-halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, halfHeight, halfDepth],
        ], materials[materialIndex]);

        return this.createMesh();
    }
}