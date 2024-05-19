export default `
precision mediump float;

uniform float u_shininess;
uniform vec3 u_cameraPosition;
uniform vec4 u_ambientColor;
uniform vec4 u_diffuseColor;
uniform vec4 u_specularColor;

varying vec4 v_color;
varying vec3 v_normal, v_pos;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightPosition = vec3(0, 0, 0);
    vec3 lightDir = normalize(lightPosition - v_pos);

    // Convert colors from 0-255 to 0-1
    vec3 ambient = u_ambientColor.rgb / 255.0;
    vec3 diffuse = u_diffuseColor.rgb / 255.0;
    vec3 specular = u_specularColor.rgb / 255.0;

    // Ambient light
    vec3 ambientLight = vec3(0.7) * ambient;

    // Diffuse light (Lambertian reflectance)
    float lambertian = max(dot(normal, lightDir), 0.0);
    vec3 diffuseLight = vec3(0.5) * lambertian * diffuse;

    // Specular light
    vec3 viewDir = normalize(u_cameraPosition - v_pos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float specAngle = max(dot(reflectDir, viewDir), 0.0);
    float specularFactor = pow(specAngle, u_shininess);
    vec3 specularLight = vec3(1.0) * specularFactor * specular;

    // Combine all
    vec3 color = ambientLight * u_ambientColor.a / 255.0 +
                 diffuseLight * u_diffuseColor.a / 255.0 +
                 specularLight * u_specularColor.a / 255.0;

    // Apply vertex color
    gl_FragColor = vec4(color, 1.0);
}
`;
