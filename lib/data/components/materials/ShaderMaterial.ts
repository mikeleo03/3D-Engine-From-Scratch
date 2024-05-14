import { ProgramInfo } from "@/lib/cores";
import { MaterialType } from "@/lib/data/types/gltftypes";
import { Vector3 } from "@/lib/data/math/Vector";
import { Color } from "@/lib/cores/Color";

export class ShaderMaterial {
    static idCounter: number = 0;

    private _name: string;
    private _id: string = "M" + (ShaderMaterial.idCounter++).toString();
    private _vertexShader: string;
    private _fragmentShader: string;
    private _uniforms: { [key: string]: any } = {};
    private _programInfo: ProgramInfo | null = null;

    constructor(options: MaterialType) {
        const { name, vertexShader, fragmentShader, uniforms } = options;
        this._name = name || "Shader Material";
        this._vertexShader = vertexShader || '';
        this._fragmentShader = fragmentShader || '';
        this._uniforms = uniforms || {};
    }

    get id() {
        return this._id;
    }

    get vertexShader() {
        return this._vertexShader;
    }

    get fragmentShader() {
        return this._fragmentShader;
    }

    get uniforms() {
        return this._uniforms;
    }

    get programInfo(): ProgramInfo | null {
        return this._programInfo;
    }

    get type() {
        return 'Shader Material';
    }

    set programInfo(programInfo: ProgramInfo) {
        this._programInfo = programInfo;
    }

    equals(material: ShaderMaterial): boolean {
        return this._id == material._id;
    }
    
    static fromRaw(raw: MaterialType, obj: ShaderMaterial | null = null): ShaderMaterial {
        const uniforms: { [key: string]: any } = {};
        for (const key in raw.uniforms) {
            const uniform = raw.uniforms[key];
            if (Array.isArray(uniform) && uniform[0] === 'Color') {
                uniforms[key] = Color.fromRaw(uniform[1]);
            } else if (Array.isArray(uniform) && uniform[0] === 'Vector3') {
                uniforms[key] = Vector3.fromRaw(uniform[1]);
            } else {
                uniforms[key] = uniform;
            }
        }

        raw.uniforms = uniforms;
        if (!obj) {
            obj = new ShaderMaterial(raw);
        } else {
            obj._uniforms = raw.uniforms;
        }
        return obj;
    }

    toRaw(): MaterialType {
        const uniformsData: { [key: string]: any } = {};
        for (const key in this._uniforms) {
            const uniform = this._uniforms[key];
            if (uniform instanceof Color) {
                uniformsData[key] = ['Color', uniform.toRaw()];
            } else if (uniform instanceof Vector3) {
                uniformsData[key] = ['Vector3', uniform.toRaw()];
            } else {
                uniformsData[key] = uniform;
            }
        }
        return {
            name: this._name,
            vertexShader: this._vertexShader,
            fragmentShader: this._fragmentShader,
            uniforms: uniformsData,
            type: this.type,
        };
    }
}
