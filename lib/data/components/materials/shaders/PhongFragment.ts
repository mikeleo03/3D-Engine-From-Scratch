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
        } else {
            // Point Light
            L = normalize(u_lightPosition_0 - vertexPosition); // Example for the first light
        }

        vec3 lightAmbient = (i == 0) ? (u_lightAmbient_0.rgb / 255.0) : (u_lightAmbient_1.rgb / 255.0); // Example for the first light
        vec3 lightDiffuse = (i == 0) ? (u_lightDiffuse_0.rgb / 255.0) : (u_lightDiffuse_1.rgb / 255.0); // Example for the first light
        vec3 lightSpecular = (i == 0) ? (u_lightSpecular_0.rgb / 255.0) : (u_lightSpecular_1.rgb / 255.0); // Example for the first light

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

        if (i == 0 && u_lightType_0 == 1.0) {
            // Point light effect calculation for the first light
            float distance = length(u_lightPosition_0 - vertexPosition);
            float attenuation = 1.0 / (u_lightConstant_0 + u_lightLinear_0 * distance + u_lightQuadratic_0 * distance * distance);

            finalAmbient += attenuation * lightAmbient * ambientColor;
            finalDiffuse += attenuation * lightDiffuse * lambertian * diffuseColor;
            finalSpecular += attenuation * lightSpecular * specular * specularColor;
        } else if (i == 1 && u_lightType_1 == 1.0) {
            // Point light effect calculation for the second light
            float distance = length(u_lightPosition_1 - vertexPosition);
            float attenuation = 1.0 / (u_lightConstant_1 + u_lightLinear_1 * distance + u_lightQuadratic_1 * distance * distance);

            finalAmbient += attenuation * lightAmbient * ambientColor;
            finalDiffuse += attenuation * lightDiffuse * lambertian * diffuseColor;
            finalSpecular += attenuation * lightSpecular * specular * specularColor;
        } else {
            // Directional Light
            finalAmbient += lightAmbient * ambientColor;
            finalDiffuse += lightDiffuse * lambertian * diffuseColor;
            finalSpecular += lightSpecular * specular * specularColor;
        }
    }

    vec3 finalColor = finalAmbient + finalDiffuse + finalSpecular;
    gl_FragColor = vec4(finalColor, 1.0);
}
`;