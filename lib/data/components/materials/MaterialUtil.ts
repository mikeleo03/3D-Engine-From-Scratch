import { Color } from "@/lib/cores";
import { Accessor } from "../../buffers/Accessor";
import { MaterialType, MaterialTypeString } from "../../types/gltftypes";
import { ShaderMaterial } from "./ShaderMaterial";
import { Texture } from "./textures/Texture";
import { BasicMaterial } from "./BasicMaterial";
import { DisplacementData, PhongMaterial, TextureData } from "./PhongMaterial";

export class MaterialUtil {
    static fromRaw(
        raw: MaterialType, 
        options: {
            textures?: Texture[],
            accessors?: Accessor[]
        } = {}
    ): ShaderMaterial { 
        if (raw.type === MaterialTypeString.BASIC) {
            return new BasicMaterial(
                Color.fromRaw(raw.uniforms.color),
                {
                    name: raw.name
                }
            );
        }
        else if (raw.type === MaterialTypeString.PHONG) {
            if (!options.textures || !options.accessors) {
                throw new Error(`Textures and accessors must be provided to create PhongMaterial`);
            }
            
            const params: {
                name: string,
                ambientColor: Color,
                diffuseColor: Color,
                specularColor: Color,
                shininess: number,
                diffuseMap?: TextureData,
                normalMap?: TextureData,
                displacementMap?: DisplacementData,
                specularMap?: TextureData
            
            } = {
                name: raw.name,
                ambientColor: Color.fromRaw(raw.uniforms.ambientColor),
                diffuseColor: Color.fromRaw(raw.uniforms.diffuseColor),
                specularColor: Color.fromRaw(raw.uniforms.specularColor),
                shininess: raw.uniforms.shininess,
            };

            if (raw.uniforms.diffuseMap) {
                params.diffuseMap = TextureData.fromRaw(raw.uniforms.diffuseMap, options.textures, options.accessors);
            }

            if (raw.uniforms.normalMap) {
                params.normalMap = TextureData.fromRaw(raw.uniforms.normalMap, options.textures, options.accessors);
            }

            if (raw.uniforms.displacementMap) {
                params.displacementMap = DisplacementData.fromRaw(raw.uniforms.displacementMap, options.textures, options.accessors);
            }

            if (raw.uniforms.specularMap) {
                params.specularMap = TextureData.fromRaw(raw.uniforms.specularMap, options.textures, options.accessors);
            }

            return new PhongMaterial(params);
        }

        throw new Error(`Unknown material type}`);
    }
}