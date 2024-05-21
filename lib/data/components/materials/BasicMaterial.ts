import { Color } from "@/lib/cores";
import { ShaderMaterial } from "./ShaderMaterial";
import { MaterialType } from "@/lib/data/types/gltftypes";
import basicFragment from "./shaders/BasicFragment";
import basicVertex from "./shaders/BasicVertex";

export class BasicMaterial extends ShaderMaterial {
    constructor(options: { name: string; color?: Color }) {
        const { name, color } = options || {};
        super({
            name: name,
            vertexShader: basicVertex,
            fragmentShader: basicFragment,
            uniforms: {
                color: color || Color.white(),
            },
            type: "Basic Material"
        });
    }

    get id() {
        return "Basic Material";
    }

    get color() {
        return this.uniforms.color;
    }

    set color(color: Color) {
        this.setUniform('color', color.clone());
    }

    override toRaw(): MaterialType {
        const { vertexShader, fragmentShader, ...other } = super.toRaw();
        return {
            vertexShader, fragmentShader, ...other, type: this.type
        };
    }
}
