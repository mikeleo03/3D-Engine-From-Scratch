import { WebGLType } from "@/lib/cores";
import { Accessor } from "../../buffers/Accessor";
import { BufferView } from "../../buffers/BufferView";
import { GLBufferAttribute } from "../../buffers/GLBufferAttribute";
import { GLTFBuffer } from "../../buffers/GLTFBuffer";
import { Float32ArrayConverter, Uint16ArrayConverter } from "../../buffers/typedarrayconverters";
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

        const vertexBytesCount = vertexCount * 4 * 3;
        const indicesBytesCount = indicesCount * 2;
        const faceNormalBytesCount = faceNormalCount * 4 * 3;
        const vertexNormalBytesCount = vertexNormalCount * 4 * 3;
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
            BufferViewTarget.ELEMENT_ARRAY_BUFFER
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
            WebGLType.UNSIGNED_SHORT, 
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
        const ushortConverter = new Uint16ArrayConverter();
        const positionAttribute = new GLBufferAttribute(positionAccessor, 3, floatConverter);
        const indicesAttribute = new GLBufferAttribute(indicesAccessor, 1, ushortConverter);
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
            const indexData = Uint16Array.from(indices);
            indicesAccessor.setData(ushortConverter.tobytes(indexData));
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
        materialOption: MaterialOptions,
        options: {
            offset?: [number, number, number],
        } = {}
    ): Mesh {


        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        // make sure to follow the right-hand rule
        // 6 vertex per square face

        const offset = options.offset || [0, 0, 0];

        // define 8 vertices of the cuboid
        const vertices: [number, number, number][] = [
            // front face
            [-halfWidth, -halfHeight, halfDepth],
            [halfWidth, -halfHeight, halfDepth],
            [halfWidth, halfHeight, halfDepth],
            [-halfWidth, halfHeight, halfDepth],
            // back face
            [-halfWidth, -halfHeight, -halfDepth],
            [halfWidth, -halfHeight, -halfDepth],
            [halfWidth, halfHeight, -halfDepth],
            [-halfWidth, halfHeight, -halfDepth],
        ];
        
        // apply offset
        for (let i = 0; i < vertices.length; i++) {
            vertices[i][0] += offset[0];
            vertices[i][1] += offset[1];
            vertices[i][2] += offset[2];
        }

        // define the indices of the cuboid
        const indices = [
            0, 1, 2,
            0, 2, 3,
            1, 5, 6,
            1, 6, 2,
            5, 4, 7,
            5, 7, 6,
            4, 0, 3,
            4, 3, 7,
            3, 2, 6,
            3, 6, 7,
            4, 5, 1,
            4, 1, 0,
        ];

        this.addGeometry(
            vertices,
            materialOption,
            { indices }
        );

        return this.createMesh();
    }
}