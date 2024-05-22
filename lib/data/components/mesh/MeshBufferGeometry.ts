import { GLBufferAttribute } from "../../buffers/GLBufferAttribute";
import { Vector3 } from "../../math/index";
import { AccessorComponentType, MeshPrimitiveAttribute } from "../../types/gltftypes";
import { Accessor } from "../../buffers/Accessor";
import { Float32ArrayConverter } from "../../buffers/typedarrayconverters";
import { BasicMaterial, PhongMaterial, ShaderMaterial } from "../materials";
import { WebGLType } from "@/lib/cores";

export type MaterialOptions = {
    basicMaterial?: BasicMaterial,
    phongMaterial?: PhongMaterial,
}

export type MeshBufferGeometryAttributes = {
    [name in MeshPrimitiveAttribute]?: GLBufferAttribute;
};
export class MeshBufferGeometry {
    public static readonly POSITION_SIZE: number = 3;
    public static readonly NORMAL_SIZE: number = 3;
    public static readonly INDEX_SIZE: number = 1;

    private _attributes: MeshBufferGeometryAttributes;
    private _basicMaterial?: BasicMaterial;
    private _phongMaterial?: PhongMaterial;
    private _indices?: GLBufferAttribute;

    constructor(
        attributes: MeshBufferGeometryAttributes = {},
        materials: MaterialOptions = {},
        options: {
            indices?: GLBufferAttribute,
            indicesAccessor?: Accessor,
        } = {}
    ) {

        const { indices, indicesAccessor } = options;

        if (attributes.position) {
            if (attributes.position.size !== MeshBufferGeometry.POSITION_SIZE) {
                throw new Error("Position attribute size must be 3");
            }

            if (attributes.position.accessor.type !== AccessorComponentType.VEC3) {
                throw new Error("Position attribute type must be VEC3");
            }

            if (attributes.position.accessor.componentType !== WebGLType.FLOAT) {
                throw new Error("Position attribute component type must be FLOAT");
            }
        }

        if (attributes.faceNormal) {
            if (attributes.faceNormal.size !== MeshBufferGeometry.NORMAL_SIZE) {
                throw new Error("Face normal attribute size must be 3");
            }

            if (attributes.faceNormal.accessor.type !== AccessorComponentType.VEC3) {
                throw new Error("Face normal attribute type must be VEC3");
            }

            if (attributes.faceNormal.accessor.componentType !== WebGLType.FLOAT) {
                throw new Error("Face normal attribute component type must be FLOAT");
            }
        }

        if (attributes.vertexNormal) {
            if (attributes.vertexNormal.size !== MeshBufferGeometry.NORMAL_SIZE) {
                throw new Error("Vertex normal attribute size must be 3");
            }

            if (attributes.vertexNormal.accessor.type !== AccessorComponentType.VEC3) {
                throw new Error("Vertex normal attribute type must be VEC3");
            }

            if (attributes.vertexNormal.accessor.componentType !== WebGLType.FLOAT) {
                throw new Error("Vertex normal attribute component type must be FLOAT");
            }
        }

        if (indices && indicesAccessor) {
            throw new Error("Indices and indices accessor cannot be used together");
        }

        if (attributes.position && !indices && !indicesAccessor) {
            throw new Error("Indices or indices accessor is required");
        }

        this._attributes = attributes;
        this._basicMaterial = materials.basicMaterial;
        this._phongMaterial = materials.phongMaterial;
        this._indices = indices;

        if (attributes.position && !indices && indicesAccessor) {
            this.setDefaultIndices(indicesAccessor);
        }
    }

    get attributes() {
        return this._attributes;
    }

    get basicMaterial() {
        return this._basicMaterial;
    }

    get phongMaterial() {
        return this._phongMaterial;
    }

    get indices() {
        return this._indices;
    }

    private setDefaultIndices(accessor: Accessor): void {

        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);

        if (!position) {
            return;
        }

        if (accessor.componentType !== WebGLType.UNSIGNED_SHORT) {
            throw new Error("Indices must be of type UNSIGNED_SHORT");
        }

        if (accessor.type !== AccessorComponentType.SCALAR) {
            throw new Error("Indices must be of type SCALAR");
        }

        if (accessor.count % 3 !== 0) {
            throw new Error("Indices count must be a multiple of 3");
        }

        if (accessor.count !== position.count) {
            throw new Error("Indices count must be the same as position count");
        }

        const converter = new Float32ArrayConverter();
        this._indices = new GLBufferAttribute(accessor, MeshBufferGeometry.INDEX_SIZE, converter);

        for (let i = 0; i < position.count; i++) {
            this._indices.set(i, Uint32Array.from([i]));
        }
    }

    getSortedPositions(): Float32Array {
        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);

        if (!position) {
            throw new Error("Position attribute is required");
        }

        return position.data as Float32Array;
    }

    setIndices(indices: GLBufferAttribute): void {
        if (!this.attributes.position) {
            throw new Error("Position attribute is required to set indices");
        }

        if (indices.size !== MeshBufferGeometry.INDEX_SIZE) {
            throw new Error("Indices must be a 1D array");
        }

        if (indices.length % 3 !== 0) {
            throw new Error("Indices length must be a multiple of 3");
        }

        const data = indices.data;
        const positionLength = this._attributes.position!!.length

        for (let i = 0; i < data.length; i++) {
            if (data[i] < 0 || data[i] >= positionLength) {
                throw new Error("Index out of range");
            }
        }

        this._indices = indices;
    }

    resetIndices(): void {
        if (!this._indices) {
            return;
        }

        const indicesAccessor = this._indices.accessor;

        this.setDefaultIndices(indicesAccessor);
    }


    setAttribute(name: MeshPrimitiveAttribute, attribute: GLBufferAttribute): void {
        if (name === MeshPrimitiveAttribute.POSITION) {
            if (this.indices && attribute.count !== this.indices.count) {
                throw new Error("Position attribute count must be the same as indices count");
            }

            if (attribute.size !== MeshBufferGeometry.POSITION_SIZE) {
                throw new Error("Position attribute size must be 3");
            }

            if (attribute.accessor.type !== AccessorComponentType.VEC3) {
                throw new Error("Position attribute type must be VEC3");
            }

            if (attribute.accessor.componentType !== WebGLType.FLOAT) {
                throw new Error("Position attribute component type must be FLOAT");
            }
        }

        if (name === MeshPrimitiveAttribute.FACE_NORMAL) {
            if (attribute.size !== MeshBufferGeometry.NORMAL_SIZE) {
                throw new Error("Face normal attribute size must be 3");
            }

            if (attribute.accessor.type !== AccessorComponentType.VEC3) {
                throw new Error("Face normal attribute type must be VEC3");
            }

            if (attribute.accessor.componentType !== WebGLType.FLOAT) {
                throw new Error("Face normal attribute component type must be FLOAT");
            }
        }

        if (name === MeshPrimitiveAttribute.VERTEX_NORMAL) {
            if (attribute.size !== MeshBufferGeometry.NORMAL_SIZE) {
                throw new Error("Vertex normal attribute size must be 3");
            }

            if (attribute.accessor.type !== AccessorComponentType.VEC3) {
                throw new Error("Vertex normal attribute type must be VEC3");
            }

            if (attribute.accessor.componentType !== WebGLType.FLOAT) {
                throw new Error("Vertex normal attribute component type must be FLOAT");
            }
        }

        this._attributes[name] = attribute;
    }


    getAttribute(name: MeshPrimitiveAttribute): GLBufferAttribute | null {
        return this._attributes[name] || null;
    }


    deleteAttribute(name: MeshPrimitiveAttribute): void {
        delete this._attributes[name];
    }


    calculateFaceNormals(
        accessor: Accessor,
        forceNewAttribute = false
    ): void {
        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);
        const indices = this.indices;

        if (!position) {
            throw new Error("Position attribute is required to calculate normals");
        }

        if (!indices) {
            throw new Error("Indices are required to calculate normals");
        }

        if (accessor.count !== indices.count) {
            throw new Error("Accessor count must be the same as indices count");
        }

        let normal = this.getAttribute(MeshPrimitiveAttribute.FACE_NORMAL);
        if (forceNewAttribute || !normal) {
            const converter = new Float32ArrayConverter();
            normal = new GLBufferAttribute(accessor, MeshBufferGeometry.NORMAL_SIZE, converter);
        }

        const p = position.data;
        const indicesData = indices.data;

        for (let i = 0; i < indices.count; i += 3) {
            const i1 = indicesData[i] * 3;
            const i2 = indicesData[i + 1] * 3;
            const i3 = indicesData[i + 2] * 3;

            const v1 = new Vector3(p[i1], p[i1 + 1], p[i1 + 2]);
            const v2 = new Vector3(p[i2], p[i2 + 1], p[i2 + 2]);
            const v3 = new Vector3(p[i3], p[i3 + 1], p[i3 + 2]);

            const normalVector = Vector3.cross(Vector3.sub(v2, v1), Vector3.sub(v3, v1));
            normalVector.normalize(true);

            normal.set(i, Float32Array.from([normalVector.X, normalVector.Y, normalVector.Z]));
            normal.set(i + 1, Float32Array.from([normalVector.X, normalVector.Y, normalVector.Z]));
            normal.set(i + 2, Float32Array.from([normalVector.X, normalVector.Y, normalVector.Z]));
        }

        this.setAttribute(MeshPrimitiveAttribute.FACE_NORMAL, normal);
    }

    private isNumberEqual(a: number, b: number, epsilon = 1e-9): boolean {
        return Math.abs(a - b) < epsilon;
    }

    calculateVertexNormals(
        accessor: Accessor,
        options: {
            forceNewAttribute: boolean,
            faceNormalAccessor?: Accessor
        } = { forceNewAttribute: false }
    ): void {
        const { forceNewAttribute, faceNormalAccessor } = options;

        if (!accessor) {
            throw new Error("Accessor is required to calculate vertex normals");
        }

        if (accessor.componentType !== WebGLType.FLOAT) {
            throw new Error("Accessor component type must be FLOAT");
        }

        if (accessor.type !== AccessorComponentType.VEC3) {
            throw new Error("Accessor type must be VEC3");
        }

        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);

        if (!position) {
            throw new Error("Position attribute is required to calculate vertex normals");
        }

        const indices = this.indices;

        if (!indices) {
            throw new Error("Indices are required to calculate normals");
        }

        if (accessor.count !== indices.count) {
            throw new Error("Accessor count must be the same as indices count");
        }

        let normal = this.getAttribute(MeshPrimitiveAttribute.FACE_NORMAL);

        if (!normal) {
            if (!faceNormalAccessor) {
                throw new Error("Face normal accessor is required to calculate vertex normals");
            }

            this.calculateFaceNormals(faceNormalAccessor);

            normal = this.getAttribute(MeshPrimitiveAttribute.FACE_NORMAL)!!;
        }

        let vertexNormal = this.getAttribute(MeshPrimitiveAttribute.VERTEX_NORMAL);

        if (forceNewAttribute || !vertexNormal) {
            const converter = new Float32ArrayConverter();
            vertexNormal = new GLBufferAttribute(accessor, MeshBufferGeometry.NORMAL_SIZE, converter);
        }

        const p = position.data;
        const n = normal.data;
        const indicesData = indices.data;
        const vertexCount = p.length / 3;

        // Initialize an array to accumulate normals for each vertex
        const accumulatedNormals = new Float32Array(p.length).fill(0);
        const counts = new Uint32Array(vertexCount).fill(0);

        // Iterate through each face
        for (let i = 0; i < indicesData.length; i += 3) {
            const i1 = indicesData[i];
            const i2 = indicesData[i + 1];
            const i3 = indicesData[i + 2];

            const nIndex = i * 3;

            const faceNormal = [n[nIndex], n[nIndex + 1], n[nIndex + 2]];

            // Accumulate the face normals for each vertex of the face
            for (const vertexIndex of [i1, i2, i3]) {
                accumulatedNormals[vertexIndex * 3] += faceNormal[0];
                accumulatedNormals[vertexIndex * 3 + 1] += faceNormal[1];
                accumulatedNormals[vertexIndex * 3 + 2] += faceNormal[2];
                counts[vertexIndex]++;
            }
        }

        // Normalize the accumulated normals for each vertex
        for (let i = 0; i < vertexCount; i++) {
            const count = counts[i];
            if (count > 0) {
                const x = accumulatedNormals[i * 3] / count;
                const y = accumulatedNormals[i * 3 + 1] / count;
                const z = accumulatedNormals[i * 3 + 2] / count;

                const length = Math.sqrt(x * x + y * y + z * z);
                if (length > 0) {
                    accumulatedNormals[i * 3] = x / length;
                    accumulatedNormals[i * 3 + 1] = y / length;
                    accumulatedNormals[i * 3 + 2] = z / length;
                }
            }
        }

        // define the vertex normal for each index
        const finalVertexNormals = new Float32Array(indicesData.length * 3);

        for (let i = 0; i < indicesData.length; i++) {
            const index = indicesData[i];
            finalVertexNormals[i * 3] = accumulatedNormals[index * 3];
            finalVertexNormals[i * 3 + 1] = accumulatedNormals[index * 3 + 1];
            finalVertexNormals[i * 3 + 2] = accumulatedNormals[index * 3 + 2];
        }

        // Assign the calculated vertex normals to the vertex normal attribute
        vertexNormal.setData(finalVertexNormals);
        this.setAttribute(MeshPrimitiveAttribute.VERTEX_NORMAL, vertexNormal);
    }
}
