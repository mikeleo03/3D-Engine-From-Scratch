import { LightType, LightTypeString } from "../../types/gltftypes";
import { Light } from "./Light";
import { Color } from "@/lib/cores";
import { DirectionalLight } from "./DirectionalLight";

export class LightUtil {
    static fromRaw(raw: LightType): Light { 
        if (raw.type === LightTypeString.DIRECTIONAL) {
            return new DirectionalLight(
                new Color(...raw.directional.color),
                raw.directional.intensity,
                raw.directional.target,
                new Color(...raw.directional.ambientColor),
                new Color(...raw.directional.diffuseColor),
                new Color(...raw.directional.specularColor),
            );
        }

        throw new Error(`Unknown Light type}`);
    }
}