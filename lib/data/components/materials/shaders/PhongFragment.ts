export default `
precision mediump float;

// Material uniform
uniform float u_shininess;
uniform vec4 u_ambientColor;
uniform vec4 u_diffuseColor;
uniform vec4 u_specularColor;

// Light uniform
uniform vec4 u_lightColor; 
uniform vec4 u_lightAmbient; 
uniform vec4 u_lightDiffuse; 
uniform vec4 u_lightSpecular; 

varying vec3 N, L, E;

void main() {
    vec3 H = normalize(L + E);

    // Convert colors from 0-255 to 0-1
    vec3 ambient = u_ambientColor.rgb / 255.0;
    vec3 diffuse = u_diffuseColor.rgb / 255.0;
    vec3 specular = u_specularColor.rgb / 255.0;
    vec3 lightAmbient = u_lightAmbient.rgb / 255.0;
    vec3 lightDiffuse = u_lightDiffuse.rgb / 255.0;
    vec3 lightSpecular = u_lightSpecular.rgb / 255.0;

    // Ambient composition
    vec3 ambientComp = lightAmbient * ambient;

    // Diffuse composition
    float Kd = max(dot(N, L), 0.0);
    vec3 diffuseComp = lightDiffuse * diffuse * Kd;

    // Specular composition
    float Ks = pow(max(dot(N, H), 0.0), u_shininess);
    vec3 specularComp = lightSpecular * specular * Ks;
    if(dot(N, L) < 0.0) {
        specularComp = vec3(0.0, 0.0, 0.0);
    }

    // Combine all
    vec3 fColor = ambientComp + diffuseComp + specularComp;
    gl_FragColor = vec4(fColor, 1.0);
}
`;
