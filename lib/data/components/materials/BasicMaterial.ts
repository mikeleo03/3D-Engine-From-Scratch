import { Color } from "../../../cores/Color";
import { ShaderMaterial } from "./index";
import basicFragment from "./shaders/BasicFragment";
import basicVertex from "./shaders/BasicVertex";

export class BasicMaterial extends ShaderMaterial {
    private _color: Color;

    constructor(options: { name?: string; color?: Color }) {
        const { name, color } = options || {};
        super({
            name: name,
            vertexShader: basicVertex,
            fragmentShader: basicFragment,
            uniforms: {
                color: color || Color.white(),
            },
        });
        this._color = this.uniforms['color'];
    }

    get id() {
        return "Basic Material";
    }

    get color() {
        return this._color;
    }

    override toRaw(): MaterialType {
        // TODO: leon
    }
}
