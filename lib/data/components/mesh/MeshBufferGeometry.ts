import { GLBufferAttribute } from "../../buffers/GLBufferAttribute";
import { Vector3 } from "../../math/index";
import { AccessorComponentType, MeshMaterialAttribute, MeshPrimitiveAttribute } from "../../types/gltftypes";
import { Accessor } from "../../buffers/Accessor";
import { Float32ArrayConverter, Uint16ArrayConverter } from "../../buffers/typedarrayconverters";
import { BasicMaterial, PhongMaterial } from "../materials";
import { WebGLType } from "@/lib/cores";

export type MaterialOptions = {
    basicMaterial?: BasicMaterial,
    phongMaterial?: PhongMaterial,
}

export type GeometryDefaultAttributes = {
    [name in MeshPrimitiveAttribute]?: GLBufferAttribute;
}

export type GeometryAttributes = {
    [name in (MeshPrimitiveAttribute | MeshMaterialAttribute)]?: GLBufferAttribute;
};

export class MeshBufferGeometry {
    public static readonly POSITION_SIZE: number = 3;
    public static readonly NORMAL_SIZE: number = 3;
    public static readonly INDEX_SIZE: number = 1;

    private _attributes: GeometryAttributes;
    private _basicMaterial?: BasicMaterial;
    private _phongMaterial?: PhongMaterial;
    private _indices?: GLBufferAttribute;

    constructor(
        attributes: GeometryDefaultAttributes = {},
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

        const completeAttributes: GeometryAttributes = { ...attributes }

        if (materials.phongMaterial) {
            const phongMaterial = materials.phongMaterial;

            if (phongMaterial.displacementMap) {
                const displacementUVAttribute = new GLBufferAttribute(
                    phongMaterial.displacementMap.textureData.texCoords,
                    2,
                    new Uint16ArrayConverter()
                );

                completeAttributes.displacementUV = displacementUVAttribute;
            }

            // TODO: Add more material attributes if needed
            if (phongMaterial.diffuseMap) {
                const diffuseUVAttribute = new GLBufferAttribute(
                    phongMaterial.diffuseMap.texCoords,
                    2,
                    new Uint16ArrayConverter()
                );

                completeAttributes.diffuseUV = diffuseUVAttribute;
            }

            if (phongMaterial.specularMap) {
                const specularUVAttribute = new GLBufferAttribute(
                    phongMaterial.specularMap.texCoords,
                    2,
                    new Uint16ArrayConverter()
                );

                completeAttributes.specularUV = specularUVAttribute;
            }

            if (phongMaterial.normalMap) {
                const normalUVAttribute = new GLBufferAttribute(
                    phongMaterial.normalMap.texCoords,
                    2,
                    new Uint16ArrayConverter()
                );
                completeAttributes.normalUV = normalUVAttribute;
            }
        }

        this._attributes = completeAttributes;
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

    getExpandedPosition(
        accessor: Accessor
    ): GLBufferAttribute {
        if (accessor.componentType !== WebGLType.FLOAT) {
            throw new Error("Accessor component type must be FLOAT");
        }

        if (accessor.type !== AccessorComponentType.VEC3) {
            throw new Error("Accessor type must be VEC3");
        }

        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);

        if (!position) {
            throw new Error("Position attribute is required to expand positions");
        }

        const indices = this._indices;

        if (!indices) {
            throw new Error("Indices are required to expand positions");
        }

        if (accessor.count !== indices.count) {
            throw new Error("Accessor count must be the same as indices count");
        }

        const indicesData = indices.data;
        const positionData = position.data;

        const expandedPosition = new Float32Array(accessor.count * 3);

        for (let i = 0; i < indices.count; i++) {
            const index = indicesData[i] * 3;
            const expandedIndex = i * 3;

            expandedPosition[expandedIndex] = positionData[index];
            expandedPosition[expandedIndex + 1] = positionData[index + 1];
            expandedPosition[expandedIndex + 2] = positionData[index + 2];
        }

        const expandedPositionAttribute = new GLBufferAttribute(
            accessor, MeshBufferGeometry.POSITION_SIZE, new Float32ArrayConverter());

        expandedPositionAttribute.setData(expandedPosition);

        return expandedPositionAttribute;
    }


    calculateFaceNormals(
        accessor?: Accessor,
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


        let normal = this.getAttribute(MeshPrimitiveAttribute.FACE_NORMAL);
        if (forceNewAttribute || !normal) {

            if (!accessor) {
                throw new Error("Accessor is required to calculate face normals");
            }

            if (accessor.count !== indices.count) {
                throw new Error("Accessor count must be the same as indices count");
            }

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

    calculateVertexNormals(
        options: {
            forceNewAttribute: boolean,
            accessor?: Accessor,
            faceNormalAccessor?: Accessor
        } = { forceNewAttribute: false }
    ): void {
        const { forceNewAttribute, faceNormalAccessor, accessor } = options;

        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);

        if (!position) {
            throw new Error("Position attribute is required to calculate vertex normals");
        }

        const indices = this.indices;

        if (!indices) {
            throw new Error("Indices are required to calculate normals");
        }

        let normal = this.getAttribute(MeshPrimitiveAttribute.FACE_NORMAL);

        if (!normal) {
            if (!faceNormalAccessor) {
                throw new Error("Face normal accessor is required to calculate vertex normals");
            }

            this.calculateFaceNormals(faceNormalAccessor);

            normal = this.getAttribute(MeshPrimitiveAttribute.FACE_NORMAL)!;
        }

        let vertexNormal = this.getAttribute(MeshPrimitiveAttribute.VERTEX_NORMAL);

        if (forceNewAttribute || !vertexNormal) {
            if (!accessor) {
                throw new Error("Accessor is required to calculate vertex normals");
            }

            if (accessor.componentType !== WebGLType.FLOAT) {
                throw new Error("Accessor component type must be FLOAT");
            }

            if (accessor.type !== AccessorComponentType.VEC3) {
                throw new Error("Accessor type must be VEC3");
            }

            if (accessor.count !== indices.count) {
                throw new Error("Accessor count must be the same as indices count");
            }

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

            const normalIndex = i * 3;

            const faceNormal = [n[normalIndex], n[normalIndex + 1], n[normalIndex + 2]];

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
                const vertexNormalIndex = i * 3;
                const x = accumulatedNormals[vertexNormalIndex] / count;
                const y = accumulatedNormals[vertexNormalIndex + 1] / count;
                const z = accumulatedNormals[vertexNormalIndex + 2] / count;

                const length = Math.sqrt(x * x + y * y + z * z);

                const normalizedX = x / length;
                const normalizedY = y / length;
                const normalizedZ = z / length;

                if (length > 0) {
                    accumulatedNormals[vertexNormalIndex] = normalizedX;
                    accumulatedNormals[vertexNormalIndex + 1] = normalizedY;
                    accumulatedNormals[vertexNormalIndex + 2] = normalizedZ;
                }
            }
        }

        // define the vertex normal for each index
        const finalVertexNormals = new Float32Array(indicesData.length * 3);

        for (let i = 0; i < indicesData.length; i++) {
            const index = indicesData[i] * 3;
            const vertexNormalIndex = i * 3;
            finalVertexNormals[vertexNormalIndex] = accumulatedNormals[index];
            finalVertexNormals[vertexNormalIndex + 1] = accumulatedNormals[index + 1];
            finalVertexNormals[vertexNormalIndex + 2] = accumulatedNormals[index + 2];
        }

        // Assign the calculated vertex normals to the vertex normal attribute
        vertexNormal.setData(finalVertexNormals);
        this.setAttribute(MeshPrimitiveAttribute.VERTEX_NORMAL, vertexNormal);
    }

    calculateTangentBitangent(
        accessorTangent?: Accessor,
        accessorBitangent?: Accessor,
        forcenewAttribute = false
    ): void {
        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);
        if (!position) {
            throw new Error("Position attribute is required to calculate tangent and bitangent");
        }

        const texcoord = this._phongMaterial?.normalMap;
        if (!texcoord) return; // no normalMap = no normalTexture = no need to calculate TBN

        let tangent, bitangent, normal;
        if (accessorTangent) {
            tangent = this.getAttribute(MeshPrimitiveAttribute.VERTEX_NORMAL);
        }
        if (accessorBitangent) {
            bitangent = this.getAttribute(MeshPrimitiveAttribute.VERTEX_NORMAL);
        }

        // keep the normal attribute if it exists
        const old_normal = this.getAttribute(MeshPrimitiveAttribute.FACE_NORMAL);
        const accessorNormal = old_normal?.accessor;
        if (!accessorNormal) {
            throw new Error("Normal attribute is required to calculate tangent and bitangent");
        }

        let T = new Vector3();
        let B = new Vector3()

        let v1 = new Vector3();
        let v2 = new Vector3();
        let v3 = new Vector3();

        let uv1 = new Vector3();
        let uv2 = new Vector3();
        let uv3 = new Vector3();

        for (let i = 0; i < position.length; i += 3) {
            v1 = new Vector3(position.data[i], position.data[i + 1], position.data[i + 2]);
            v2 = new Vector3(position.data[i + 3], position.data[i + 4], position.data[i + 5]);
            v3 = new Vector3(position.data[i + 6], position.data[i + 7], position.data[i + 8]);

            uv1 = new Vector3(texcoord.texCoords[i], texcoord.texCoords[i + 1], 0);
            uv2 = new Vector3(texcoord.texCoords[i + 2], texcoord.texCoords[i + 3], 0);
            uv3 = new Vector3(texcoord.texCoords[i + 4], texcoord.texCoords[i + 5], 0);

            let e1 = Vector3.sub(v2, v1);
            let e2 = Vector3.sub(v3, v1);
            let dUV1 = Vector3.sub(uv2, v1);
            let dUV2 = Vector3.sub(uv3, v1);

            const f = 1.0 / (dUV1.X * dUV2.Y - dUV2.X * dUV1.Y);

            T.X = f * (dUV2.Y * e1.X - dUV1.Y * e2.X);
            T.Y = f * (dUV2.Y * e1.Y - dUV1.Y * e2.Y);
            T.Z = f * (dUV2.Y * e1.Z - dUV1.Y * e2.Z);

            B.X = f * (dUV2.X * e1.X - dUV1.X * e2.X);
            B.Y = f * (dUV2.X * e1.Y - dUV1.X * e2.Y);
            B.Z = f * (dUV2.X * e1.Z - dUV1.X * e2.Z);

            for (let j = 0; j < 3; j++) {
                tangent.set(i + j, Float32Array.from([T.X, T.Y, T.Z]));
                bitangent.set(i + j, Float32Array.from([B.X, B.Y, B.Z]));
            }
        }

        this.setAttribute(MeshPrimitiveAttribute.TANGENT, tangent);
        this.setAttribute(MeshPrimitiveAttribute.BITANGENT, bitangent);
    }
}
