import { Color } from "../../../cores/Color";
import { LightType, LightTypeString } from "../../types/gltftypes";
import { NodeComponent } from "../NodeComponent";

export abstract class Light extends NodeComponent {
    static readonly COMPONENT_NAME: string = "Light";

    private _type: LightTypeString;
    private _color: Color;
    private _intensity: number;

    constructor(type: LightTypeString, color: Color, intensity: number = 1) {
        super(Light.COMPONENT_NAME);

        this._type = type;
        this._color = color;
        this._intensity = intensity;
    }

    get type(): LightTypeString {
        return this._type;
    }

    get color(): Color {
        return this._color;
    }
    
    get intensity(): number {
        return this._intensity;
    }

    set type(type: LightTypeString) {
        this._type = type;
    }

    set color(color: Color) {
        this._color = color;
    }

    set intensity(intensity: number) {
        this._intensity = intensity;
    }

    abstract toRaw(): LightType;
}