import { ProgramInfo, UniformSingleDataType } from "@/lib/cores";
import { MaterialType } from "@/lib/data/types/gltftypes";
import { Texture } from "./textures/Texture";
import { Accessor } from "../../buffers/Accessor";

export abstract class ShaderMaterial {
    private _name: string;
    private _type: string;
    private _vertexShader: string;
    private _fragmentShader: string;
    private _programInfos: { [key: string]: ProgramInfo } = {};

    constructor(
        name: string,
        type: string,
        vertexShader: string,
        fragmentShader: string,
    ) {
        this._name = name;
        this._type = type;
        this._vertexShader = vertexShader;
        this._fragmentShader = fragmentShader;
    }

    get name() {
        return this._name;
    }

    get vertexShader() {
        return this._vertexShader;
    }

    get fragmentShader() {
        return this._fragmentShader;
    }

    abstract getUniforms(): { [key: string]: any };
    abstract getBufferUniforms(): { [key: string]: UniformSingleDataType };

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

    abstract toRaw(
        options: {
            textureMap?: Map<Texture, number>,
            accessorMap?: Map<Accessor, number>
        }
    ): MaterialType;
}
