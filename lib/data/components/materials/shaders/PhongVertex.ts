export default `
precision mediump float;

attribute vec4 a_position;
attribute vec4 a_faceNormal;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform vec3 u_lightPosition;

varying vec3 N, L, E;

void main() {
    vec3 pos = -(u_viewMatrix * a_position).xyz;
    vec3 light = u_lightPosition;
    L = normalize(light - pos);
    E = -pos;
    N = normalize((u_worldMatrix * a_faceNormal).xyz);
    gl_Position = u_viewMatrix * u_worldMatrix * a_position;
}
`;
