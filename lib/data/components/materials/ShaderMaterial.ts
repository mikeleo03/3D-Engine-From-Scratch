import { ProgramInfo, UniformSingleDataType } from "@/lib/cores";
import { MaterialType } from "@/lib/data/types/gltftypes";
import { Vector3 } from "@/lib/data/math/Vector";
import { Color } from "@/lib/cores/Color";

export class ShaderMaterial {
    static idCounter: number = 0;

    private _name: string;
    private _id: string = "M" + (ShaderMaterial.idCounter++).toString();
    private _type: string;
    private _vertexShader: string;
    private _fragmentShader: string;
    private _uniforms: { [key: string]: any } = {};
    private _programInfos: { [key: string]: ProgramInfo } = {};

    constructor(options: MaterialType) {
        const { name, vertexShader, fragmentShader, uniforms, type } = options;
        this._name = name || "Shader Material";
        this._vertexShader = vertexShader || '';
        this._fragmentShader = fragmentShader || '';
        this._uniforms = uniforms || {};
        this._type = type;
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

    get bufferUniforms(): { [key: string]: UniformSingleDataType } {
        const bufferUniforms: { [key: string]: UniformSingleDataType } = {};
        for (const key in this._uniforms) {
            const uniform = this._uniforms[key];
            if (uniform instanceof Vector3) {
                bufferUniforms[key] = uniform.buffer;
            }
            else if (uniform instanceof Color) {
                bufferUniforms[key] = uniform.buffer;
            }

            else if (typeof uniform === 'number') {
                bufferUniforms[key] = uniform;
            }

            else {
                throw new Error(`Uniform type not supported: ${uniform}`);
            }
        }
        return bufferUniforms;
    }

    getProgramInfo(key: string): ProgramInfo | null {
        return this._programInfos[key] || null;
    }

    get type() {
        return this._type;
    }

    setProgramInfo(key: string, programInfo: ProgramInfo | null) {
        if (!programInfo) {
            delete this._programInfos[key];
            return;
        }

        this._programInfos[key] = programInfo;
    }

    equals(material: ShaderMaterial): boolean {
        return this._id == material._id;
    }
    
    static fromRaw(raw: MaterialType, obj: ShaderMaterial | null = null): ShaderMaterial {
        const uniforms: { [key: string]: any } = {};
        for (const key in raw.uniforms) {
            const uniform = raw.uniforms[key];
            if (key === 'color' || key === 'ambientColor' || key === 'diffuseColor' || key === 'specularColor') {
                uniforms[key] = Color.fromRaw(uniform as number[]);
            } else if (key === 'lightPosition') {
                uniforms[key] = Vector3.fromRaw(uniform as number[]);
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
                uniformsData[key] = uniform.toRaw();
            } else if (uniform instanceof Vector3) {
                uniformsData[key] = uniform.toRaw();
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
