import { Accessor } from "../../buffers/Accessor";
import { GLBufferAttribute } from "../../buffers/GLBufferAttribute";
import { MeshBufferGeometry, MeshBufferGeometryAttributes } from "./MeshBufferGeometry";
import { Float32ArrayConverter, Uint16ArrayConverter } from "../../buffers/typedarrayconverters";
import { BasicMaterial, PhongMaterial, ShaderMaterial } from "../materials";
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
            const faceNormal = primitive.attributes.FACE_NORMAL !== undefined ? accessors[primitive.attributes.FACE_NORMAL] : undefined;
            const vertexNormal = primitive.attributes.VERTEX_NORMAL !== undefined ? accessors[primitive.attributes.VERTEX_NORMAL] : undefined;
            const indices = primitive.indices !== undefined ? accessors[primitive.indices] : undefined;
            const basicMaterial = primitive.basicMaterial !== undefined ? materials[primitive.basicMaterial] as BasicMaterial : undefined;
            const phongMaterial = primitive.phongMaterial !== undefined ? materials[primitive.phongMaterial] as PhongMaterial : undefined;

            const attribute: MeshBufferGeometryAttributes = {
                position: position ? new GLBufferAttribute(
                    position,
                    MeshBufferGeometry.POSITION_SIZE,
                    new Float32ArrayConverter(),
                ) : undefined,
                faceNormal: faceNormal ? new GLBufferAttribute(
                    faceNormal,
                    MeshBufferGeometry.NORMAL_SIZE,
                    new Float32ArrayConverter(),
                ) : undefined,
                vertexNormal: vertexNormal ? new GLBufferAttribute(
                    vertexNormal,
                    MeshBufferGeometry.NORMAL_SIZE,
                    new Float32ArrayConverter(),
                ) : undefined,
            };

            return new MeshBufferGeometry(
                attribute,
                {
                    basicMaterial,
                    phongMaterial,
                },
                {
                    indices: indices ? new GLBufferAttribute(
                        indices,
                        MeshBufferGeometry.INDEX_SIZE,
                        new Uint16ArrayConverter(),
                    ) : undefined
                }
            );
                
        });

        return new Mesh(geometries);
    }

    private getPrimitives(
        accessorMap: Map<Accessor, number>,
        materialMap: Map<ShaderMaterial, number>
    ): MeshPrimitiveType[] {
        return this._geometries.map(geometry => {
            const position = geometry.attributes.position;
            const faceNormal = geometry.attributes.faceNormal;
            const vertexNormal = geometry.attributes.vertexNormal;
            const indices = geometry.indices;

            if (position && !accessorMap.has(position.accessor)) {
                throw new Error("Position accessor not found");
            }

            if (faceNormal && !accessorMap.has(faceNormal.accessor)) {
                throw new Error("Normal accessor not found");
            }

            if (vertexNormal && !accessorMap.has(vertexNormal.accessor)) {
                throw new Error("Normal accessor not found");
            }

            if (indices && !accessorMap.has(indices.accessor)) {
                throw new Error("Indices accessor not found");
            }

            const primitive: MeshPrimitiveType = {
                attributes: {
                    POSITION: position ? accessorMap.get(position.accessor)!! : undefined,
                    FACE_NORMAL: faceNormal ? accessorMap.get(faceNormal.accessor)!! : undefined,
                    VERTEX_NORMAL: vertexNormal ? accessorMap.get(vertexNormal.accessor)!! : undefined,
                },
                basicMaterial: geometry.basicMaterial ? materialMap.get(geometry.basicMaterial)!! : undefined,
                phongMaterial: geometry.phongMaterial ? materialMap.get(geometry.phongMaterial)!! : undefined,
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