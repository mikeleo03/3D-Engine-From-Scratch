import { Color, UniformSingleDataType } from "@/lib/cores";
import { ShaderMaterial } from "./ShaderMaterial";
import { MaterialType, MaterialTypeString } from "@/lib/data/types/gltftypes";
import basicFragment from "./shaders/BasicFragment";
import basicVertex from "./shaders/BasicVertex";

export class BasicMaterial extends ShaderMaterial {
    public static readonly DEFAULT_NAME = "Basic Material";

    private _color: Color;

    constructor(
        color: Color,
        options: {
            name?: string,
        } = {}
    ) {

        const name = options.name || BasicMaterial.DEFAULT_NAME;

        super(
            name,
            MaterialTypeString.BASIC,
            basicVertex,
            basicFragment,
        );

        this._color = color;
    }

    get color() {
        return this._color.clone();
    }

    set color(color: Color) {
        this._color = color.clone();
    }

    override toRaw(_: {}): MaterialType {
        return {
            type: MaterialTypeString.BASIC,
            name: this.name,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            uniforms: {
                color: this._color.toRaw()
            }
        };
    }

    override getUniforms() {
        return {
            color: this._color
        };
    }

    override getBufferUniforms(): { [key: string]: UniformSingleDataType } {
        const uniform = this.getUniforms();
        return {
            color: uniform.color.buffer
        };
    }
}
