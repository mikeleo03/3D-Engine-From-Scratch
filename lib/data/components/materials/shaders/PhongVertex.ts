export default `
precision mediump float;

attribute vec3 a_position;
attribute vec3 a_faceNormal;
attribute vec4 a_vertexNormal;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform vec3 u_lightPosition;

varying vec3 normalSurface;
varying vec3 vertexPosition;

void main() {
    vec4 vertexPosition4 = u_worldMatrix * vec4(a_position, 1.0);
    vertexPosition = vec3(vertexPosition4) / vertexPosition4.w;
    normalSurface = (u_viewMatrix * u_worldMatrix * vec4(a_faceNormal, 1.0)).xyz;
    gl_Position = u_viewMatrix * vertexPosition4;
}
`;
