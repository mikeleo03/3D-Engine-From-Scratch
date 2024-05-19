import { Color } from "../../../cores/Color";
import { Vector3 } from "../../math";
import { LightType, LightTypeString } from "../../types/gltftypes";
import { Light } from "./Light";

export class DirectionalLight extends Light {
    private _target: Vector3;
    private _ambientColor: Color;
    private _diffuseColor: Color;
    private _specularColor: Color;

    constructor(
        color: Color, 
        intensity: number = 1, 
        target: Vector3, 
        ambientColor: Color, 
        diffuseColor: Color, 
        specularColor: Color
    ) {
        super(LightTypeString.DIRECTIONAL, color, intensity);

        this._target = target || new Vector3(0, -1, 0);
        this._ambientColor = ambientColor;
        this._diffuseColor = diffuseColor;
        this._specularColor = specularColor;
    }

    get target(): Vector3 {
        return this._target;
    }

    get ambientColor(): Color {
        return this._ambientColor;
    }

    get diffuseColor(): Color {
        return this._diffuseColor;
    }

    get specularColor(): Color {
        return this._specularColor;
    }

    set target(target: Vector3) {
        this._target = target;
    }

    set ambientColor(ambientColor: Color) {
        this._ambientColor = ambientColor;
    }

    set diffuseColor(diffuseColor: Color) {
        this._diffuseColor = diffuseColor;
    }

    set specularColor(specularColor: Color) {
        this._specularColor = specularColor;
    }

    override toRaw(): LightType {
        return {
            type: LightTypeString.DIRECTIONAL,
            directional: {
                color: this.color,
                intensity: this.intensity,
                target: this.target,
                ambientColor: this.ambientColor,
                diffuseColor: this.diffuseColor,
                specularColor: this.specularColor,
            },
        };
    }
}