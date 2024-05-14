import { Color } from "../../../cores/index";
import { Vector3 } from "../../math/index";
import { ShaderMaterial } from "./index";
import phongFragment from "./shaders/PhongFragment";
import phongVertex from "./shaders/PhongVertex";

export class PhongMaterial extends ShaderMaterial {
    constructor(options: {
        name?: string;
        ambientColor?: Color;
        diffuseColor?: Color;
        specularColor?: Color;
        shininess?: number;
        lightPosition?: Vector3;
    } = {}) {
        const {
            name,
            ambientColor,
            diffuseColor,
            specularColor,
            shininess,
            lightPosition,
        } = options;
        super({
            name,
            vertexShader: phongVertex,
            fragmentShader: phongFragment,
            uniforms: {
                ambientColor: ambientColor || Color.white(),
                diffuseColor: diffuseColor || Color.white(),
                specularColor: specularColor || Color.white(),
                shininess: shininess || 30,
                lightPosition: lightPosition || new Vector3(400, 400, 300),
            },
        });
    }

    get id() {
        return "Phong Material";
    }

    get ambientColor(): Color {
        return this.ambientColor;
    }

    get diffuseColor(): Color {
        return this.diffuseColor;
    }

    get specularColor(): Color {
        return this.specularColor;
    }

    get lightPosition(): Vector3 {
        return this.lightPosition;
    }

    get shininess(): number {
        return this.shininess;
    }

    set shininess(val: number) {
        this.shininess = val;
    }
}
