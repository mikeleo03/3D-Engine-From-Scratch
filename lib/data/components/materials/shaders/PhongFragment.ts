export default `
precision mediump float;

// Material uniform
uniform float u_shininess;
uniform vec4 u_ambientColor;
uniform vec4 u_diffuseColor;
uniform vec4 u_specularColor;

// Light uniform
uniform int u_numLights;

// Light properties
uniform float u_lightType_0;
uniform vec3 u_lightPosition_0;
uniform vec4 u_lightColor_0;
uniform vec4 u_lightAmbient_0;
uniform vec4 u_lightDiffuse_0;
uniform vec4 u_lightSpecular_0;
uniform vec3 u_lightTarget_0;
uniform float u_lightConstant_0;
uniform float u_lightLinear_0;
uniform float u_lightQuadratic_0;

uniform float u_lightType_1;
uniform vec3 u_lightPosition_1;
uniform vec4 u_lightColor_1;
uniform vec4 u_lightAmbient_1;
uniform vec4 u_lightDiffuse_1;
uniform vec4 u_lightSpecular_1;
uniform vec3 u_lightTarget_1;
uniform float u_lightConstant_1;
uniform float u_lightLinear_1;
uniform float u_lightQuadratic_1;

uniform float u_mode;

varying vec3 normalSurface;
varying vec3 vertexPosition;

void main() {
    vec3 N = normalize(normalSurface);
    vec3 finalAmbient = vec3(0.0);
    vec3 finalDiffuse = vec3(0.0);
    vec3 finalSpecular = vec3(0.0);

    // Convert colors from 0-255 to 0-1
    vec3 ambientColor = u_ambientColor.rgb / 255.0;
    vec3 diffuseColor = u_diffuseColor.rgb / 255.0;
    vec3 specularColor = u_specularColor.rgb / 255.0;

    for (int i = 0; i < 2; i++) {
        vec3 L;
        if (i == 0 && u_lightType_0 == 0.0) {
            // Directional Light
            L = normalize(u_lightTarget_0 - vertexPosition);
        } else if (i == 1 && u_lightType_1 == 0.0) {
            // Directional Light
            L = normalize(u_lightTarget_1 - vertexPosition);
        } else if (i == 0 && u_lightType_0 == 1.0) {
            // Point Light
            L = normalize(u_lightPosition_0 - vertexPosition);
        } else {
            // Point Light
            L = normalize(u_lightPosition_1 - vertexPosition);
        }

        vec3 lightAmbient = (i == 0) ? (u_lightAmbient_0.rgb / 255.0) : (u_lightAmbient_1.rgb / 255.0);
        vec3 lightDiffuse = (i == 0) ? (u_lightDiffuse_0.rgb / 255.0) : (u_lightDiffuse_1.rgb / 255.0);
        vec3 lightSpecular = (i == 0) ? (u_lightSpecular_0.rgb / 255.0) : (u_lightSpecular_1.rgb / 255.0);

        // Lambert's cosine law
        float lambertian = max(dot(N, L), 0.0);
        float specular = 0.0;
        if (lambertian > 0.0) {
            vec3 R = reflect(-L, N);       // Reflected light vector
            vec3 V = normalize(-vertexPosition);  // Vector to viewer
            
            // Compute the specular term
            float specAngle = max(dot(R, V), 0.0);
            specular = pow(specAngle, u_shininess);
        }

        // Directional light calculation
        vec3 directionalAmbient = lightAmbient * ambientColor;
        vec3 directionalDiffuse = lightDiffuse * lambertian * diffuseColor;
        vec3 directionalSpecular = lightSpecular * specular * specularColor;

        // Point light calculation 1
        float distance1 = length(u_lightPosition_0 - vertexPosition);
        float attenuation1 = 1.0 / (u_lightConstant_0 + u_lightLinear_0 * distance1 + u_lightQuadratic_0 * distance1 * distance1);

        vec3 pointAmbient1 = attenuation1 * lightAmbient * ambientColor;
        vec3 pointDiffuse1 = attenuation1 * lightDiffuse * lambertian * diffuseColor;
        vec3 pointSpecular1 = attenuation1 * lightSpecular * specular * specularColor;

        // Point light calculation 2
        float distance2 = length(u_lightPosition_1 - vertexPosition);
        float attenuation2 = 1.0 / (u_lightConstant_1 + u_lightLinear_1 * distance2 + u_lightQuadratic_1 * distance2 * distance2);

        vec3 pointAmbient2 = attenuation2 * lightAmbient * ambientColor;
        vec3 pointDiffuse2 = attenuation2 * lightDiffuse * lambertian * diffuseColor;
        vec3 pointSpecular2 = attenuation2 * lightSpecular * specular * specularColor;

        // Processing by u_mode
        // Mode 1 : 1st Directional, 2nd Point
        if (u_mode == 1.0) {
            if (i == 0) {
                finalAmbient += directionalAmbient;
                finalDiffuse += directionalDiffuse;
                finalSpecular += directionalSpecular;
            } else if (i == 1) {
                finalAmbient += pointAmbient2;
                finalDiffuse += pointDiffuse2;
                finalSpecular += pointSpecular2;
            }
        }
        // Mode 2 : 1st Point, 2nd Directional
        else if (u_mode == 2.0) {
            if (i == 0) {
                finalAmbient += pointAmbient1;
                finalDiffuse += pointDiffuse1;
                finalSpecular += pointSpecular1;
            } else if (i == 1) {
                finalAmbient += directionalAmbient;
                finalDiffuse += directionalDiffuse;
                finalSpecular += directionalSpecular;
            }
        }
        // Mode 3 : 1st Directional, 2nd None
        else if (u_mode == 3.0 && i == 0) {
            finalAmbient += directionalAmbient;
            finalDiffuse += directionalDiffuse;
            finalSpecular += directionalSpecular;
        }
        // Mode 4 : 1st Point, 2nd None
        else if (u_mode == 4.0) {
            finalAmbient += pointAmbient1;
            finalDiffuse += pointAmbient1;
            finalSpecular += pointAmbient1;
        }
    }

    vec3 finalColor = finalAmbient + finalDiffuse + finalSpecular;
    gl_FragColor = vec4(finalColor, 1.0);
}
`;