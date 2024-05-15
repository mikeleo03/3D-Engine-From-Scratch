import { Accessor } from "../../buffers/Accessor";
import { GLBufferAttribute } from "../../buffers/GLBufferAttribute";
import { MeshBufferGeometry, MeshBufferGeometryAttributes } from "./geometries/MeshBufferGeometry";
import { Float32ArrayConverter, Uint16ArrayConverter } from "../../buffers/typedarrayconverters";
import { ShaderMaterial } from "../materials";
import { MeshPrimitiveType, MeshType } from "../../types/gltftypes";
import { NodeComponent } from "../NodeComponent";

export class Mesh extends NodeComponent {
    static readonly COMPONENT_NAME = "mesh";

    private _geometries: MeshBufferGeometry[];

    constructor(_geometries: MeshBufferGeometry[]) {
        super(Mesh.COMPONENT_NAME);
        this._geometries = _geometries;
    }

    get geometries(): MeshBufferGeometry[] {
        return this._geometries;
    }

    set geometries(geometries: MeshBufferGeometry[]) {
        this._geometries = geometries;
    }

    addGeometry(geometry: MeshBufferGeometry): void {
        this._geometries.push(geometry);
    }

    removeGeometry(geometry: MeshBufferGeometry): void {
        const index = this._geometries.indexOf(geometry);

        if (index !== -1) {
            this._geometries.splice(index, 1);
        }
    }

    static fromRaw(raw: MeshType, accessors: Accessor[], materials: ShaderMaterial[]): Mesh {
        const geometries = raw.primitives.map(primitive => {
            const position = primitive.attributes.POSITION !== undefined ? accessors[primitive.attributes.POSITION] : undefined;
            const normal = primitive.attributes.NORMAL !== undefined ? accessors[primitive.attributes.NORMAL] : undefined;
            const indices = primitive.indices !== undefined ? accessors[primitive.indices] : undefined;
            const material = materials[primitive.material];

            const attribute: MeshBufferGeometryAttributes = {
                POSITION: position ? new GLBufferAttribute(
                    position,
                    MeshBufferGeometry.POSITION_SIZE,
                    new Float32ArrayConverter(),
                ) : undefined,
                NORMAL: normal ? new GLBufferAttribute(
                    normal,
                    MeshBufferGeometry.NORMAL_SIZE,
                    new Float32ArrayConverter(),
                ) : undefined,
            };

            return new MeshBufferGeometry(
                attribute,
                material,
                indices ? new GLBufferAttribute(
                    indices,
                    MeshBufferGeometry.INDEX_SIZE,
                    new Uint16ArrayConverter(),
                ) : undefined);
        });

        return new Mesh(geometries);
    }

    private getPrimitives(
        accessorMap: Map<Accessor, number>,
        materialMap: Map<ShaderMaterial, number>
    ): MeshPrimitiveType[] {
        return this._geometries.map(geometry => {
            const position = geometry.attributes.POSITION;
            const normal = geometry.attributes.NORMAL;
            const indices = geometry.indices;

            if (position && !accessorMap.has(position.accessor)) {
                throw new Error("Position accessor not found");
            }

            if (normal && !accessorMap.has(normal.accessor)) {
                throw new Error("Normal accessor not found");
            }

            if (indices && !accessorMap.has(indices.accessor)) {
                throw new Error("Indices accessor not found");
            }

            const primitive: MeshPrimitiveType = {
                attributes: {
                    POSITION: position ? accessorMap.get(position.accessor)!! : undefined,
                    NORMAL: normal ? accessorMap.get(normal.accessor)!! : undefined
                },
                material: materialMap.get(geometry.material)!!,
                indices: indices ? accessorMap.get(indices.accessor)!! : undefined
            };

            return primitive;
        });
    }

    toRaw(accessorMap: Map<Accessor, number>, materialMap: Map<ShaderMaterial, number>): MeshType {
        return {
            primitives: this.getPrimitives(accessorMap, materialMap),
        };
    }
}