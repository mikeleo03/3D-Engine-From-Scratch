import { LightType, LightTypeString } from "../../types/gltftypes";
import { Light } from "./Light";
import { Color } from "@/lib/cores";
import { DirectionalLight } from "./DirectionalLight";
import { Vector3 } from "../../math";
import { PointLight } from "./PointLight";

export class LightUtil {
    static fromRaw(raw: LightType): Light { 
        if (raw.type === LightTypeString.DIRECTIONAL) {
            return new DirectionalLight(
                new Color(...raw.directional.color),
                raw.directional.intensity,
                Vector3.fromRaw(raw.directional.target),
                new Color(...raw.directional.ambientColor),
                new Color(...raw.directional.diffuseColor),
                new Color(...raw.directional.specularColor),
            );
        } else if (raw.type === LightTypeString.POINT) {
            return new PointLight(
                new Color(...raw.point.color),
                raw.point.intensity,
                new Color(...raw.point.ambientColor),
                new Color(...raw.point.diffuseColor),
                new Color(...raw.point.specularColor),
                raw.point.constant,
                raw.point.linear,
                raw.point.quadratic,
            );
        }

        throw new Error(`Unknown Light type}`);
    }
}