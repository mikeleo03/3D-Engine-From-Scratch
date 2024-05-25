export default `
precision mediump float;

attribute vec3 a_position;
attribute vec3 a_faceNormal;
attribute vec3 a_vertexNormal;
attribute vec2 a_displacementUV;
attribute vec2 a_diffuseUV;
attribute vec2 a_specularUV;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform sampler2D u_displacementMap;
uniform float u_displacementScale;
uniform float u_displacementBias;

varying vec3 normalSurface;
varying vec3 vertexPosition;
varying vec2 diffuseUV;
varying vec2 specularUV;

void main() {
    vec4 displacement = texture2D(u_displacementMap, a_displacementUV);

    vec4 displacementVector = normalize(vec4(a_vertexNormal.xyz, 0.0)) * (displacement.r * u_displacementScale + u_displacementBias);

    vec4 vertexPosition4 = u_worldMatrix * (vec4(a_position, 1.0) + displacementVector);
    vertexPosition = vec3(vertexPosition4) / vertexPosition4.w;
    normalSurface = (u_viewMatrix * u_worldMatrix * vec4(a_faceNormal, 1.0)).xyz;
    diffuseUV = a_diffuseUV;
    specularUV = a_specularUV;
    gl_Position = u_viewMatrix * vertexPosition4;
}
`;
