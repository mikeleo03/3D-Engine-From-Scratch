import { MaterialType } from "../../types/gltftypes";
import { Color } from "../../../cores/index";
import { Vector3 } from "../../math/index";
import { ShaderMaterial } from "./index";
import phongFragment from "./shaders/PhongFragment";
import phongVertex from "./shaders/PhongVertex";

export class PhongMaterial extends ShaderMaterial {
    constructor(options: {
        name: string;
        ambientColor?: Color;
        diffuseColor?: Color;
        specularColor?: Color;
        shininess?: number;
    }) {
        const {
            name,
            ambientColor,
            diffuseColor,
            specularColor,
            shininess,
        } = options;
        super({
            name: name,
            vertexShader: phongVertex,
            fragmentShader: phongFragment,
            uniforms: {
                ambientColor: ambientColor || Color.white(),
                diffuseColor: diffuseColor || Color.white(),
                specularColor: specularColor || Color.white(),
                shininess: shininess === undefined ? 30 : shininess
            },
            type: "Phong Material"
        });
    }

    get id() {
        return "Phong Material";
    }

    get ambientColor(): Color {
        return this.uniforms.ambientColor;
    }

    get diffuseColor(): Color {
        return this.uniforms.diffuseColor;
    }

    get specularColor(): Color {
        return this.uniforms.specularColor;
    }

    get shininess(): number {
        return this.uniforms.shininess;
    }

    set diffuseColor(val: Color) {
        this.uniforms.diffuseColor = val;
    }

    set ambientColor(val: Color) {
        this.uniforms.ambientColor = val;
    }

    set specularColor(val: Color) {
        this.uniforms.specularColor = val;
    }

    set shininess(val: number) {
        this.uniforms.shininess = val;
    }

    get type() {
        return 'Phong Material';
    }

    override toRaw(): MaterialType {
        const { vertexShader, fragmentShader, ...other } = super.toRaw();
        return {
            vertexShader, fragmentShader, ...other, type: this.type
        };
    }
}
