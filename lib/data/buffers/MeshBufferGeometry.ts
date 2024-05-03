import { MeshBufferAttribute } from "./MeshBufferAttribute";
import { Vector3 } from "../math/Vector";
import { MeshPrimitiveAttribute } from "../types/gltftypes";

export enum PrimitiveAttribute {
    POSITION = 'position',
    NORMAL = 'normal',
}

export class MeshBufferGeometry {
    public readonly POSITION_SIZE: number = 3;
    public readonly NORMAL_SIZE: number = 3;
    public readonly INDEX_SIZE: number = 1;

    private _attributes: { [key in keyof typeof MeshPrimitiveAttribute]?: MeshBufferAttribute };
    private _indices?: MeshBufferAttribute;


    constructor() {
        this._attributes = {};
        this._indices = new MeshBufferAttribute(new Uint16Array(0), this.INDEX_SIZE);
    }


    get attributes() {
        return this._attributes;
    }


    get indices() {
        return this._indices;
    }


    setIndices(indices: MeshBufferAttribute): void {
        const position = this.getAttribute(PrimitiveAttribute.POSITION);

        if (indices.size !== this.INDEX_SIZE) {
            throw new Error("Indices must be a 1D array");
        }

        if (position && indices.count !== position.count) {
            throw new Error("Indices count must be the same as position count");
        }

        this._indices = indices;
    }


    resetIndices(): void {
        this._indices = undefined;
    }


    setAttribute(name: string, attribute: MeshBufferAttribute): void {
        if (name === PrimitiveAttribute.POSITION) {
            if (this.indices && attribute.count !== this.indices.count) {
                throw new Error("Position attribute count must be the same as indices count");
            }

            if (attribute.size !== this.POSITION_SIZE) {
                throw new Error("Position attribute size must be 3");
            }
        }

        this._attributes[name] = attribute;
    }


    getAttribute(name: string): MeshBufferAttribute | null {
        return this._attributes[name];
    }


    deleteAttribute(name: string): void {
        delete this._attributes[name];
    }


    protected calculateNormals(forceNewAttribute = false): void {
        const position = this.getAttribute(PrimitiveAttribute.POSITION);
        const indices = this.indices;

        if (!position || !indices) return;
        let normal = this.getAttribute(PrimitiveAttribute.NORMAL);
        if (forceNewAttribute || !normal)
            normal = new MeshBufferAttribute(new Float32Array(position.length), this.NORMAL_SIZE);

        const p = position.data;

        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices.data[i] * 3;
            const i2 = indices.data[i + 1] * 3;
            const i3 = indices.data[i + 2] * 3;

            const v1 = new Vector3(p[i1], p[i1 + 1], p[i1 + 2]);
            const v2 = new Vector3(p[i2], p[i2 + 1], p[i2 + 2]);
            const v3 = new Vector3(p[i3], p[i3 + 1], p[i3 + 2]);

            const normalVector = Vector3.cross(Vector3.sub(v2, v1), Vector3.sub(v3, v1));
            normalVector.normalize();

            normal.data[i1] += normalVector.X;
            normal.data[i1 + 1] += normalVector.Y;
            normal.data[i1 + 2] += normalVector.Z;

            normal.data[i2] += normalVector.X;
            normal.data[i2 + 1] += normalVector.Y;
            normal.data[i2 + 2] += normalVector.Z;

            normal.data[i3] += normalVector.X;
            normal.data[i3 + 1] += normalVector.Y;
            normal.data[i3 + 2] += normalVector.Z;
        }

        this.setAttribute(PrimitiveAttribute.NORMAL, normal);
    }
}
