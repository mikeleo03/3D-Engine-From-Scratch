import { WebGLType } from "@/lib/cores";
import { Accessor } from "../../buffers/Accessor";
import { BufferView } from "../../buffers/BufferView";
import { GLBufferAttribute } from "../../buffers/GLBufferAttribute";
import { GLTFBuffer } from "../../buffers/GLTFBuffer";
import { Float32ArrayConverter, Uint16ArrayConverter } from "../../buffers/typedarrayconverters";
import { AccessorComponentType, BufferViewTarget } from "../../types/gltftypes";
import { BasicMaterial, PhongMaterial, ShaderMaterial } from "../materials";
import { MaterialOptions, MeshBufferGeometry, GeometryAttributes } from "./MeshBufferGeometry";
import { Mesh } from "./Mesh";

export class MeshFactory {
    static readonly CUBOID_INDICES = [
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
        const vertexNormalCount = indicesCount;

        const vertexBytesCount = vertexCount * 4 * 3;
        const indicesBytesCount = indicesCount * 2;
        const faceNormalBytesCount = faceNormalCount * 4 * 3;
        const vertexNormalBytesCount = vertexNormalCount * 4 * 3;
        const totalBytesCount = vertexBytesCount + faceNormalBytesCount + vertexNormalBytesCount + indicesBytesCount;

        const buffer = GLTFBuffer.empty(totalBytesCount);

        const tangentBytesCount = vertexNormalBytesCount;
        const bitangentBytesCount = vertexNormalBytesCount;
        const bufferTB  = GLTFBuffer.empty(tangentBytesCount + bitangentBytesCount);

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
        const tangentBufferView = new BufferView(
            bufferTB,
            0,
            vertexNormalBytesCount,
            BufferViewTarget.ARRAY_BUFFER
        )
        const bitangentBufferView = new BufferView(
            bufferTB,
            vertexNormalBytesCount,
            vertexNormalBytesCount,
            BufferViewTarget.ARRAY_BUFFER
        )

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
        const tangentAccessor = new Accessor(
            tangentBufferView,
            0,
            WebGLType.FLOAT,
            vertexNormalCount,
            AccessorComponentType.VEC3,
            [],
            []
        );
        const bitangentAccessor = new Accessor(
            bitangentBufferView,
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
        const tangentAttribute = new GLBufferAttribute(tangentAccessor, 3, floatConverter);
        const bitangentAttribute = new GLBufferAttribute(bitangentAccessor, 3, floatConverter);

        const attributes: GeometryAttributes = {
            position: positionAttribute,
            faceNormal: faceNormalAttribute,
            vertexNormal: vertexNormalAttribute,
            tangent: tangentAttribute,
            bitangent: bitangentAttribute
        };

        const vertices = Float32Array.from(positions.flat());
        positionAccessor.setData(floatConverter.tobytes(vertices));

        if (indices) {
            const indexData = Uint16Array.from(indices);
            indicesAccessor.setData(ushortConverter.tobytes(indexData));
        }

        const meshBufferOptions: { indices?: GLBufferAttribute, indicesAccessor?: Accessor } = {}

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
        geometry.calculateVertexNormals({ forceNewAttribute: false, accessor: vertexNormalAccessor });
        // geometry.calculateTangentBitangent(tangentAccessor, bitangentAccessor);

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
        

        this.addGeometry(
            vertices,
            materialOption,
            { indices: MeshFactory.CUBOID_INDICES }
        );

        return this.createMesh();
    }

    hollowCuboid(
        outerWidth: number,
        outerHeight: number,
        innerWidth: number,
        innerHeight: number,
        depth: number,
        materialOption: MaterialOptions,
        options: {
            offset?: [number, number, number],
        } = {}
    ): Mesh {
        const halfOuterWidth = outerWidth / 2;
        const halfOuterHeight = outerHeight / 2;
        const halfInnerWidth = innerWidth / 2;
        const halfInnerHeight = innerHeight / 2;
        const halfDepth = depth / 2;

        const offset = options.offset || [0, 0, 0];

        // define 16 vertices of the hollow cuboid
        const vertices: [number, number, number][] = [
            // outer bottom vertices
            [-halfOuterWidth, -halfOuterHeight, halfDepth],
            [halfOuterWidth, -halfOuterHeight, halfDepth],
            [halfOuterWidth, halfOuterHeight, halfDepth],
            [-halfOuterWidth, halfOuterHeight, halfDepth],
            // outer back face
            [-halfOuterWidth, -halfOuterHeight, -halfDepth],
            [halfOuterWidth, -halfOuterHeight, -halfDepth],
            [halfOuterWidth, halfOuterHeight, -halfDepth],
            [-halfOuterWidth, halfOuterHeight, -halfDepth],

            // inner front face
            [-halfInnerWidth, -halfInnerHeight, halfDepth],
            [halfInnerWidth, -halfInnerHeight, halfDepth],
            [halfInnerWidth, halfInnerHeight, halfDepth],
            [-halfInnerWidth, halfInnerHeight, halfDepth],
            // inner back face
            [-halfInnerWidth, -halfInnerHeight, -halfDepth],
            [halfInnerWidth, -halfInnerHeight, -halfDepth],
            [halfInnerWidth, halfInnerHeight, -halfDepth],
            [-halfInnerWidth, halfInnerHeight, -halfDepth]
        ];

        // apply offset
        for (let i = 0; i < vertices.length; i++) {
            vertices[i][0] += offset[0];
            vertices[i][1] += offset[1];
            vertices[i][2] += offset[2];
        }

        // define the indices of the hollow triangle
        const indices = [
            // outer front face
            0, 1, 2,
            0, 2, 3,
            // outer back face
            4, 5, 6,
            4, 6, 7,
            // outer left face
            0, 3, 7,
            0, 7, 4,
            // outer right face
            1, 2, 6,
            1, 6, 5,
            // outer top face
            2, 3, 7,
            2, 7, 6,
            // outer bottom face
            0, 1, 5,
            0, 5, 4,

            // inner front face
            8, 9, 10,
            8, 10, 11,
            // inner back face
            12, 13, 14,
            12, 14, 15,
            // inner left face
            8, 11, 15,
            8, 15, 12,
            // inner right face
            9, 10, 14,
            9, 14, 13,
            // inner top face
            10, 11, 15,
            10, 15, 14,
            // inner bottom face
            8, 9, 13,
            8, 13, 12,

            // connecting faces
            0, 1, 9,
            0, 9, 8,
            1, 5, 13,
            1, 13, 9,
            5, 4, 12,
            5, 12, 13,
            4, 0, 8,
            4, 8, 12,
            3, 2, 10,
            3, 10, 11,
            2, 6, 14,
            2, 14, 10,
            6, 7, 15,
            6, 15, 14,
            7, 3, 11,
            7, 11, 15,
        ];

        this.addGeometry(
            vertices,
            materialOption,
            { indices }
        );

        return this.createMesh();
    }

    hollowTriangle(
        outerWidth: number,
        outerHeight: number,
        innerWidth: number,
        innerHeight: number,
        depth: number,
        materialOption: MaterialOptions,
        options: {
            offset?: [number, number, number],
        } = {}
    ): Mesh {
        const halfOuterWidth = outerWidth / 2;
        const halfOuterHeight = outerHeight / 2;
        const halfInnerWidth = innerWidth / 2;
        const halfInnerHeight = innerHeight / 2;
        const halfDepth = depth / 2;

        const offset = options.offset || [0, 0, 0];

        // define 12 vertices of the hollow triangle
        const vertices: [number, number, number][] = [
            // outer bottom vertices
            [-halfOuterWidth, -halfOuterHeight, halfDepth],
            [-halfOuterWidth, -halfOuterHeight, -halfDepth],
            [halfOuterWidth, -halfOuterHeight, halfDepth],
            [halfOuterWidth, -halfOuterHeight, -halfDepth],

            // outer top vertices
            [0, halfOuterHeight, halfDepth],
            [0, halfOuterHeight, -halfDepth],

            // inner bottom vertices
            [-halfInnerWidth, -halfInnerHeight, halfDepth],
            [-halfInnerWidth, -halfInnerHeight, -halfDepth],
            [halfInnerWidth, -halfInnerHeight, halfDepth],
            [halfInnerWidth, -halfInnerHeight, -halfDepth],

            // inner top vertices
            [0, halfInnerHeight, halfDepth],
            [0, halfInnerHeight, -halfDepth],
        ];

        // apply offset
        for (let i = 0; i < vertices.length; i++) {
            vertices[i][0] += offset[0];
            vertices[i][1] += offset[1];
            vertices[i][2] += offset[2];
        }

        // define the indices of the hollow triangle
        const indices = [
            // Outer bottom face
            0, 1, 2,
            2, 1, 3,

            // outer left face
            1, 0, 4,
            1, 4, 5,

            // outer right face
            2, 3, 4,
            4, 3, 5,

            // inner bottom face
            7, 6, 8,
            7, 8, 9,

            // inner left face
            6, 7, 10,
            10, 7, 11,

            // inner right face
            9, 8, 10,
            10, 11, 9,
            
            // left connecting front side
            0, 6, 4,
            6, 10, 4,

            // right connecting front side
            8, 2, 4,
            10, 8, 4,

            // bottom connecting front side
            0, 8, 6,
            0, 2, 8,

            // left connecting back side
            7, 1, 5,
            7, 5, 11,

            // right connecting back side
            3, 9, 5,
            9, 11, 5,

            // top connecting back side
            3, 1, 7,
            3, 7, 9,
        ];

        this.addGeometry(
            vertices,
            materialOption,
            { indices }
        );

        return this.createMesh();
    }

    hollowCylinder(
      outerRadius: number,
      innerRadius: number,
      height: number,
      segments: number,
      materialOption: MaterialOptions,
      options: {
          offset?: [number, number, number],
      } = {}
    ): Mesh {
        const halfHeight = height / 2;
        const offset = options.offset || [0, 0, 0];

        const vertices: [number, number, number][] = [];
        const indices: number[] = [];

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;

            const outerX = outerRadius * Math.cos(theta);
            const outerZ = outerRadius * Math.sin(theta);

            const innerX = innerRadius * Math.cos(theta);
            const innerZ = innerRadius * Math.sin(theta);

            // Outer top
            vertices.push([outerX + offset[0], halfHeight + offset[1], outerZ + offset[2]]);
            // Outer bottom
            vertices.push([outerX + offset[0], -halfHeight + offset[1], outerZ + offset[2]]);
            // Inner top
            vertices.push([innerX + offset[0], halfHeight + offset[1], innerZ + offset[2]]);
            // Inner bottom
            vertices.push([innerX + offset[0], -halfHeight + offset[1], innerZ + offset[2]]);

            if (i < segments) {
                const j = i * 4;
                // Outer rectangle
                indices.push(j, j + 4, j + 1, j + 1, j + 4, j + 5);
                // Inner rectangle
                indices.push(j + 2, j + 3, j + 6, j + 3, j + 7, j + 6);
                // Top rectangle
                indices.push(j, j + 2, j + 4, j + 2, j + 6, j + 4);
                // Bottom rectangle
                indices.push(j + 1, j + 5, j + 3, j + 3, j + 5, j + 7);
            }
        }

        this.addGeometry(vertices, materialOption, { indices });

        return this.createMesh();
    }
} 
