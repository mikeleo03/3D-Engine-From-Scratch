import { WebGLType } from "@/lib/cores";
import { Accessor } from "../../buffers/Accessor";
import { BufferView } from "../../buffers/BufferView";
import { GLBufferAttribute } from "../../buffers/GLBufferAttribute";
import { GLTFBuffer } from "../../buffers/GLTFBuffer";
import { Float32ArrayConverter, Uint32ArrayConverter } from "../../buffers/typedarrayconverters";
import { AccessorComponentType, BufferViewTarget } from "../../types/gltftypes";
import { BasicMaterial, PhongMaterial, ShaderMaterial } from "../materials";
import { MaterialOptions, MeshBufferGeometry, MeshBufferGeometryAttributes } from "./MeshBufferGeometry";
import { Mesh } from "./Mesh";

export class MeshFactory {
    private _geometries: MeshBufferGeometry[] = [];

    addGeometry(
        positions: [number, number, number][],
        materials: MaterialOptions = {},
        options: {
            indices?: number[]
        } = {}
    ): void {

        const indices = options.indices;

        if (indices && indices.length % 3 !== 0) {
            throw new Error("Indices must be a multiple of 3");
        }

        if (!indices && positions.length % 3 !== 0) {
            throw new Error("Positions must be a multiple of 3");
        }

        const vertexCount = positions.length;
        const indicesCount = indices ? indices.length : vertexCount;
        const faceNormalCount = indicesCount;
        const vertexNormalCount = vertexCount;

        const vertexBytesCount = positions.length * 4 * 3;
        const indicesBytesCount = (indices ? indices.length : positions.length) * 4;
        const faceNormalBytesCount = indicesBytesCount * 3;
        const vertexNormalBytesCount = vertexBytesCount;
        const totalBytesCount = vertexBytesCount + faceNormalBytesCount + vertexNormalBytesCount + indicesBytesCount;

        const buffer = GLTFBuffer.empty(totalBytesCount);

        const positionBufferView = new BufferView(
            buffer, 
            0, 
            vertexBytesCount, 
            BufferViewTarget.ARRAY_BUFFER
        );
        const indicesBufferView = new BufferView(
            buffer, 
            vertexBytesCount, 
            indicesBytesCount, 
            BufferViewTarget.ELEMENT_ARRAY_BUFFER
        );
        const faceNormalBufferView = new BufferView(
            buffer, 
            vertexBytesCount + indicesBytesCount, 
            faceNormalBytesCount, 
            BufferViewTarget.ARRAY_BUFFER
        )
        const vertexNormalBufferView = new BufferView(
            buffer, 
            vertexBytesCount + indicesBytesCount + faceNormalBytesCount, 
            vertexNormalBytesCount, 
            BufferViewTarget.ARRAY_BUFFER
        );

        const positionAccessor = new Accessor(
            positionBufferView, 
            0, 
            WebGLType.FLOAT, 
            vertexCount, 
            AccessorComponentType.VEC3, 
            [], 
            []
        );
        const indicesAccessor = new Accessor(
            indicesBufferView, 
            0, 
            WebGLType.UNSIGNED_INT, 
            indicesCount, 
            AccessorComponentType.SCALAR, 
            [], 
            []
        );
        const faceNormalAccessor = new Accessor(
            faceNormalBufferView, 
            0, 
            WebGLType.FLOAT, 
            faceNormalCount, 
            AccessorComponentType.VEC3, 
            [], 
            []
        );
        const vertexNormalAccessor = new Accessor(
            vertexNormalBufferView, 
            0, 
            WebGLType.FLOAT, 
            vertexNormalCount, 
            AccessorComponentType.VEC3, 
            [], 
            []
        );
        const floatConverter = new Float32ArrayConverter();
        const uintConverter = new Uint32ArrayConverter();
        const positionAttribute = new GLBufferAttribute(positionAccessor, 3, floatConverter);
        const indicesAttribute = new GLBufferAttribute(indicesAccessor, 1, uintConverter);
        const faceNormalAttribute = new GLBufferAttribute(faceNormalAccessor, 3, floatConverter);
        const vertexNormalAttribute = new GLBufferAttribute(vertexNormalAccessor, 3, floatConverter);

        const attributes: MeshBufferGeometryAttributes = {
            position: positionAttribute,
            faceNormal: faceNormalAttribute,
            vertexNormal: vertexNormalAttribute,
        };

        const vertices = Float32Array.from(positions.flat());
        positionAccessor.setData(floatConverter.tobytes(vertices));
        
        if (indices) {
            const indexData = Uint32Array.from(indices);
            indicesAccessor.setData(uintConverter.tobytes(indexData));
        }

        const meshBufferOptions: {indices?: GLBufferAttribute, indicesAccessor?: Accessor} = {}

        if (indices) {
            meshBufferOptions.indices = indicesAttribute;
        }

        else {
            meshBufferOptions.indicesAccessor = indicesAccessor;
        }

        const geometry = new MeshBufferGeometry(
            attributes, 
            materials,
            meshBufferOptions
        );

        geometry.calculateFaceNormals(faceNormalAccessor);
        geometry.calculateVertexNormals(vertexNormalAccessor);

        this._geometries.push(geometry);
    }

    createMesh(): Mesh {
        const mesh = new Mesh(this._geometries);
        this._geometries = [];
        return mesh;
    }

    cuboid(
        width: number,
        height: number,
        depth: number,
        materialOptions: MaterialOptions[],
        options: {
            offset?: [number, number, number],
        } = {}
    ): Mesh {
        if (materialOptions.length === 0) {
            throw new Error("At least one material is required");
        }

        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        var materialIndex = 0;

        // make sure to follow the right-hand rule
        // 6 vertex per square face

        const offset = options.offset || [0, 0, 0];

        const data1: [number, number, number][] = [
            [-halfWidth, -halfHeight, halfDepth],
            [halfWidth, -halfHeight, halfDepth],
            [halfWidth, halfHeight, halfDepth],
            [-halfWidth, halfHeight, halfDepth],
            [-halfWidth, -halfHeight, halfDepth],
            [halfWidth, halfHeight, halfDepth],
        ];

        for (let i = 0; i < data1.length; i++) {
            data1[i][0] += offset[0];
            data1[i][1] += offset[1];
            data1[i][2] += offset[2];
        }

        // front face
        this.addGeometry(data1, materialOptions[materialIndex]);

        if (materialOptions.length > 1) {
            materialIndex++;
        }

        // back face
        const data2: [number, number, number][] = [
            [halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
            [halfWidth, halfHeight, -halfDepth],
            [halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
        ];

        for (let i = 0; i < data2.length; i++) {
            data2[i][0] += offset[0];
            data2[i][1] += offset[1];
            data2[i][2] += offset[2];
        }

        this.addGeometry(data2, materialOptions[materialIndex]);

        if (materialOptions.length > 2) {
            materialIndex++;
        }

        // top face
        const data3: [number, number, number][] = [
            [-halfWidth, halfHeight, halfDepth],
            [halfWidth, halfHeight, halfDepth],
            [halfWidth, halfHeight, -halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
            [-halfWidth, halfHeight, halfDepth],
            [halfWidth, halfHeight, -halfDepth],
        ];

        for (let i = 0; i < data3.length; i++) {
            data3[i][0] += offset[0];
            data3[i][1] += offset[1];
            data3[i][2] += offset[2];
        }

        this.addGeometry(data3, materialOptions[materialIndex]);

        if (materialOptions.length > 3) {
            materialIndex++;
        }

        // bottom face
        const data4: [number, number, number][] = [
            [-halfWidth, -halfHeight, -halfDepth],
            [halfWidth, -halfHeight, -halfDepth],
            [halfWidth, -halfHeight, halfDepth],
            [-halfWidth, -halfHeight, halfDepth],
            [-halfWidth, -halfHeight, -halfDepth],
            [halfWidth, -halfHeight, halfDepth],
        ];

        for (let i = 0; i < data4.length; i++) {
            data4[i][0] += offset[0];
            data4[i][1] += offset[1];
            data4[i][2] += offset[2];
        }

        this.addGeometry(data4, materialOptions[materialIndex]);

        if (materialOptions.length > 4) {
            materialIndex++;
        }

        // right face
        const data5: [number, number, number][] = [
            [halfWidth, -halfHeight, halfDepth],
            [halfWidth, -halfHeight, -halfDepth],
            [halfWidth, halfHeight, -halfDepth],
            [halfWidth, halfHeight, halfDepth],
            [halfWidth, -halfHeight, halfDepth],
            [halfWidth, halfHeight, -halfDepth],
        ];

        for (let i = 0; i < data5.length; i++) {
            data5[i][0] += offset[0];
            data5[i][1] += offset[1];
            data5[i][2] += offset[2];
        }

        this.addGeometry(data5, materialOptions[materialIndex]);

        if (materialOptions.length > 5) {
            materialIndex++;
        }

        // left face
        const data6: [number, number, number][] = [
            [-halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, -halfHeight, halfDepth],
            [-halfWidth, halfHeight, halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
            [-halfWidth, -halfHeight, -halfDepth],
            [-halfWidth, halfHeight, halfDepth],
        ];

        for (let i = 0; i < data6.length; i++) {
            data6[i][0] += offset[0];
            data6[i][1] += offset[1];
            data6[i][2] += offset[2];
        }

        this.addGeometry(data6, materialOptions[materialIndex]);

        return this.createMesh();
    }
}