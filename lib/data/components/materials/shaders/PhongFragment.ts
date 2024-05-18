export default `
precision mediump float;

uniform float u_shininess;
uniform vec3 u_lightPosition;
uniform vec3 u_cameraPosition;
uniform vec4 u_ambientColor;
uniform vec4 u_diffuseColor;
uniform vec4 u_specularColor;

varying vec4 v_color;
varying vec3 v_normal, v_pos;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(normalize(u_lightPosition) - v_pos);
    vec3 viewDir = normalize(lightDir + normalize(u_cameraPosition));

    // Convert colors from 0-255 to 0-1
    vec3 ambient = u_ambientColor.rgb / 255.0;
    vec3 diffuse = u_diffuseColor.rgb / 255.0;
    vec3 specular = u_specularColor.rgb / 255.0;

    // Ambient
    vec3 ambientComponent = ambient * u_ambientColor.a / 255.0;

    // Diffuse
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuseComponent = diff * diffuse * u_diffuseColor.a / 255.0;

    // Specular
    // vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(normal, viewDir), 0.0), u_shininess);
    vec3 specularComponent = spec * specular * u_specularColor.a / 255.0;

    // Combine all
    vec3 color = ambientComponent + diffuseComponent + specularComponent;

    // Apply vertex color
    gl_FragColor = v_color * vec4(color, 1.0);
}
`;