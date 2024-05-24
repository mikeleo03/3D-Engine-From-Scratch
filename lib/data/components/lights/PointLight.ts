import { Color } from "../../../cores/Color";
import { Vector3 } from "../../math";
import { LightType, LightTypeString } from "../../types/gltftypes";
import { Light } from "./Light";

export class PointLight extends Light {
    private _target: Vector3;
    private _ambientColor: Color;
    private _diffuseColor: Color;
    private _specularColor: Color;
    private _constant: number;
    private _linear: number;
    private _quadratic: number;

    constructor(
        color: Color, 
        intensity: number = 1, 
        target: Vector3, 
        ambientColor: Color, 
        diffuseColor: Color, 
        specularColor: Color,
        constant: number,
        linear: number,
        quadratic: number
    ) {
        super(LightTypeString.POINT, color, intensity);

        this._target = target || new Vector3(0, -1, 0);
        this._ambientColor = ambientColor;
        this._diffuseColor = diffuseColor;
        this._specularColor = specularColor;
        this._constant = constant;
        this._linear = linear;
        this._quadratic = quadratic;
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

    get constant(): number {
        return this._constant;
    }

    get linear(): number {
        return this._linear;
    }

    get quadratic(): number {
        return this._quadratic;
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
            type: LightTypeString.POINT,
            point: {
                color: this.color.buffer,
                intensity: this.intensity,
                target: this.target.toRaw(),
                ambientColor: this.ambientColor.buffer,
                diffuseColor: this.diffuseColor.buffer,
                specularColor: this.specularColor.buffer,
                constant: this.constant,
                linear: this.linear,
                quadratic: this.quadratic,
            },
        };
    }
}