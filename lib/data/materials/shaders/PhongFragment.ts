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
    vec3 N = normalize(v_normal);
    vec3 L = normalize(normalize(u_lightPosition) - v_pos);
    vec3 H = normalize(L + normalize(u_cameraPosition));

    float kDiff = max(dot(L, N), 0.0);
    vec3 diffuse = kDiff * u_diffuseColor.rgb;

    float kSpec = pow(max(dot(N, H), 0.0), u_shininess);
    vec3 specular = kSpec * u_specularColor.rgb;

    gl_FragColor = v_color * vec4(
        0.1 * u_ambientColor.a * u_ambientColor.rgb + 
        u_diffuseColor.a * diffuse +
        u_specularColor.a * specular
    , 1.0);
}
`;