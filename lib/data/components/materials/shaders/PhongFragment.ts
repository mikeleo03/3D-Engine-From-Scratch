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
    vec3 fColor;
    vec3 H = normalize(L + E);

    // Convert colors from 0-255 to 0-1
    vec3 ambient = u_ambientColor.rgb / 255.0;
    vec3 diffuse = u_diffuseColor.rgb / 255.0;
    vec3 specular = u_specularColor.rgb / 255.0;
    vec3 lightAmbient = u_lightAmbient.rgb / 255.0;
    vec3 lightDiffuse = u_lightDiffuse.rgb / 255.0;
    vec3 lightSpecular = u_lightSpecular.rgb / 255.0;

    // Ambient composition
    vec3 ambientComp = lightAmbient * (ambient * u_ambientColor.a / 255.0);

    // Diffuse composition
    float Kd = max(dot(L, N), 0.0);
    vec3 diffuseComp = lightDiffuse * (Kd * diffuse * u_diffuseColor.a / 255.0);

    // Specular composition
    float Ks = pow(max(dot(N, H), 0.0), u_shininess);
    vec3 specularComp = lightSpecular * (Ks * specular * u_specularColor.a / 255.0);
    if(dot(L, N) < 0.0) {
        specularComp = vec3(0.0, 0.0, 0.0);
    }

    // Combine all
    fColor = ambientComp + diffuseComp + specularComp;
    gl_FragColor = vec4(fColor, 1.0);
}
`;
