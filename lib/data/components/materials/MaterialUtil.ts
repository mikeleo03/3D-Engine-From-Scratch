import { MaterialType } from "../../types/gltftypes";
import { ShaderMaterial } from "./ShaderMaterial";
import { BasicMaterial } from "./BasicMaterial";
import { PhongMaterial } from "./PhongMaterial";

export class MaterialUtil {
    static fromRaw(raw: MaterialType): ShaderMaterial { 
        console.log(raw);
        if (raw.type === "Basic Material") {
            const obj = new BasicMaterial(raw);
            ShaderMaterial.fromRaw(raw, obj);
            return obj;
        }
        else if (raw.type === "Phong Material") {
            const obj = new PhongMaterial(raw);
            ShaderMaterial.fromRaw(raw, obj);
            return obj;
        }

        throw new Error(`Unknown material type}`);
    }
}