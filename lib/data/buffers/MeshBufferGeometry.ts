import { MeshBufferAttribute } from "./MeshBufferAttribute";
import { Vector3 } from "../math/index";
import { MeshPrimitiveAttribute } from "../types/gltftypes";
import { Accessor } from "./Accessor";
import { Float32ArrayConverter } from "./typedarrayconverters";
import { ShaderMaterial } from "../materials";

export type MeshBufferGeometryAttributes = {
    [name in MeshPrimitiveAttribute]?: MeshBufferAttribute;
};
export class MeshBufferGeometry {
    public static readonly POSITION_SIZE: number = 3;
    public static readonly NORMAL_SIZE: number = 3;
    public static readonly INDEX_SIZE: number = 1;

    private _attributes: MeshBufferGeometryAttributes;
    private _material: ShaderMaterial;
    private _indices?: MeshBufferAttribute;

    constructor(
        attributes: MeshBufferGeometryAttributes = {}, 
        material: ShaderMaterial,
        indices?: MeshBufferAttribute
    ) {
        this._attributes = attributes;
        this._material = material;
        this._indices = indices;
    }

    get attributes() {
        return this._attributes;
    }

    get material() {
        return this._material;
    }

    get indices() {
        return this._indices;
    }


    setIndices(indices: MeshBufferAttribute): void {
        if (indices.size !== MeshBufferGeometry.INDEX_SIZE) {
            throw new Error("Indices must be a 1D array");
        }

        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);

        if (position && indices.count !== position.count) {
            throw new Error("Indices count must be the same as position count");
        }

        this._indices = indices;
    }


    resetIndices(): void {
        this._indices = undefined;
    }


    setAttribute(name: MeshPrimitiveAttribute, attribute: MeshBufferAttribute): void {
        if (name === MeshPrimitiveAttribute.POSITION) {
            if (this.indices && attribute.count !== this.indices.count) {
                throw new Error("Position attribute count must be the same as indices count");
            }

            if (attribute.size !== MeshBufferGeometry.POSITION_SIZE) {
                throw new Error("Position attribute size must be 3");
            }
        }

        this._attributes[name] = attribute;
    }


    getAttribute(name: MeshPrimitiveAttribute): MeshBufferAttribute | null {
        MeshPrimitiveAttribute[name]
        return this._attributes[name] || null;
    }


    deleteAttribute(name: MeshPrimitiveAttribute): void {
        delete this._attributes[name];
    }


    calculateNormals(
        accessor: Accessor,
        forceNewAttribute = false
    ): void {
        // TODO: error when force new attribute
        const position = this.getAttribute(MeshPrimitiveAttribute.POSITION);
        const indices = this.indices;

        if (!position || !indices) return;
        let normal = this.getAttribute(MeshPrimitiveAttribute.NORMAL);
        if (forceNewAttribute || !normal) {
            const converter = new Float32ArrayConverter();
            normal = new MeshBufferAttribute(accessor, MeshBufferGeometry.NORMAL_SIZE, converter);
        }

        const p = position.data;
        const indicesData = indices.data;

        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indicesData[i] * 3;
            const i2 = indicesData[i + 1] * 3;
            const i3 = indicesData[i + 2] * 3;

            const v1 = new Vector3(p[i1], p[i1 + 1], p[i1 + 2]);
            const v2 = new Vector3(p[i2], p[i2 + 1], p[i2 + 2]);
            const v3 = new Vector3(p[i3], p[i3 + 1], p[i3 + 2]);

            const normalVector = Vector3.cross(Vector3.sub(v2, v1), Vector3.sub(v3, v1));
            normalVector.normalize();

            normal.set(i, Float32Array.from([normalVector.X, normalVector.Y, normalVector.Z]));
            normal.set(i + 1, Float32Array.from([normalVector.X, normalVector.Y, normalVector.Z]));
            normal.set(i + 2, Float32Array.from([normalVector.X, normalVector.Y, normalVector.Z]));
        }

        this.setAttribute(MeshPrimitiveAttribute.NORMAL, normal);
    }
}
