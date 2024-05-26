export default `
precision mediump float;

attribute vec3 a_position;
attribute vec3 a_faceNormal;
attribute vec3 a_vertexNormal;
attribute vec2 a_displacementUV;
attribute vec2 a_diffuseUV;
attribute vec2 a_specularUV;
attribute vec2 a_texcoord;
attribute vec3 a_tangent;
attribute vec3 a_bitangent;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform sampler2D u_displacementMap;
uniform float u_displacementScale;
uniform float u_displacementBias;

varying vec3 normalSurface;
varying vec3 vertexPosition;
varying vec2 diffuseUV;
varying vec2 specularUV;
varying mat3 v_tbn;
varying vec2 v_texcoord;
varying vec3 v_pos;

void main() {
    vec4 displacement = texture2D(u_displacementMap, a_displacementUV);

    vec4 displacementVector = normalize(vec4(a_vertexNormal.xyz, 0.0)) * (displacement.r * u_displacementScale + u_displacementBias);

    vec4 vertexPosition4 = u_worldMatrix * (vec4(a_position, 1.0) + displacementVector);
    vertexPosition = vec3(vertexPosition4) / vertexPosition4.w;
    normalSurface = (u_viewMatrix * u_worldMatrix * vec4(a_faceNormal, 1.0)).xyz;
    diffuseUV = a_diffuseUV;
    specularUV = a_specularUV;
    
    vec3 T = normalize(vec3(u_worldMatrix * vec4(a_tangent, 0.0)));
    vec3 B = normalize(vec3(u_worldMatrix * vec4(a_bitangent, 0.0)));
    vec3 N = normalize(vec3(u_worldMatrix * vec4(a_faceNormal, 0.0)));

    v_tbn = mat3(T, B, N);
    v_texcoord = a_texcoord;
    v_pos = a_position;
    
    gl_Position = u_viewMatrix * vertexPosition4;
}
`;
