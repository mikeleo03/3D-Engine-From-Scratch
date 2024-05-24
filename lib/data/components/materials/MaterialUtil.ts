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
                diffuseMaps: TextureData[],
                normalMaps: TextureData[],
                displacementMaps: DisplacementData[],
                specularMaps: TextureData[],
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
                diffuseMaps: [],
                normalMaps: [],
                displacementMaps: [],
                specularMaps: []
            };

            const  diffuseMaps = raw.uniforms.diffuseMaps.map((rawMap) => {
                return TextureData.fromRaw(rawMap, options.textures!, options.accessors!);
            });

            const normalMaps = raw.uniforms.normalMaps.map((rawMap) => {
                return TextureData.fromRaw(rawMap, options.textures!, options.accessors!);
            });

            const displacementMaps = raw.uniforms.displacementMaps.map((rawMap) => {
                return DisplacementData.fromRaw(rawMap, options.textures!, options.accessors!);
            });

            const specularMaps = raw.uniforms.specularMaps.map((rawMap) => {
                return TextureData.fromRaw(rawMap, options.textures!, options.accessors!);
            });

            params.diffuseMaps = diffuseMaps;
            params.normalMaps = normalMaps;
            params.displacementMaps = displacementMaps;
            params.specularMaps = specularMaps;

            if (raw.uniforms.diffuseMap !== undefined) {
                params.diffuseMap = diffuseMaps[raw.uniforms.diffuseMap];
            }

            if (raw.uniforms.normalMap !== -1) {
                params.normalMap = normalMaps[raw.uniforms.normalMap];
            }

            if (raw.uniforms.displacementMap !== -1) {
                params.displacementMap = displacementMaps[raw.uniforms.displacementMap];
            }

            if (raw.uniforms.specularMap !== -1) {
                params.specularMap = specularMaps[raw.uniforms.specularMap];
            }

            return new PhongMaterial(params);
        }

        throw new Error(`Unknown material type}`);
    }
}