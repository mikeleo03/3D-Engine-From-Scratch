import { ProgramInfo } from "@/lib/cores";
import { MaterialType } from "../types/gltftypes";

export abstract class ShaderMaterial {
    static idCounter: number = 0;

    private _name: string;
    private _id: string = "M" + (ShaderMaterial.idCounter++).toString();
    private _vertexShader: string;
    private _fragmentShader: string;
    private _uniforms: { [key: string]: any } = {};
    private _programInfo: ProgramInfo | null = null;

    constructor(options: { name?: string, vertexShader?: string, fragmentShader?: string, uniforms?: object } = {}) {
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

    set programInfo(programInfo: ProgramInfo) {
        this._programInfo = programInfo;
    }

    equals(material: ShaderMaterial): boolean {
        return this._id == material._id;
    }
    
    static fromRaw(raw: MaterialType): ShaderMaterial {
        // TODO: leon
    }

    abstract toRaw(): MaterialType;


}
