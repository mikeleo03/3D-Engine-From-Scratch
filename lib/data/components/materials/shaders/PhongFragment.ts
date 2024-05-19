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
    vec3 lightDir = normalize(u_lightPosition - v_pos);

    // Convert colors from 0-255 to 0-1
    vec3 ambient = u_ambientColor.rgb / 255.0;
    vec3 diffuse = u_diffuseColor.rgb / 255.0;
    vec3 specular = u_specularColor.rgb / 255.0;

    // Ambient, processed with Ka = 0.1

    // Diffuse, process labertian
    float lambertian = max(dot(normal, lightDir), 0.0);

    // Specular, Lambert's cosine law
    float spec = 0.0;
    if (lambertian > 0.0) {
        vec3 reflectDir = reflect(-lightDir, normal);       // Reflected light vector
        vec3 viewDir = normalize(-v_pos);                   // Vector to viewer
        // Compute the specular term
        float specAngle = max(dot(reflectDir, viewDir), 0.0);
        spec = pow(specAngle, u_shininess);
    }

    // Combine all
    vec3 color = 1.0 * ambient * u_ambientColor.a / 255.0 +
                1.0 * lambertian * diffuse * u_diffuseColor.a / 255.0 +
                1.0 * spec * specular * u_specularColor.a / 255.0;

    // Apply vertex color
    gl_FragColor = vec4(color, 1.0);
}
`;