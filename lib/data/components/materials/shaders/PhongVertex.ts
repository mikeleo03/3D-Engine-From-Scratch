export default `
precision mediump float;

attribute vec4 a_position;
attribute vec3 a_faceNormal;
attribute vec4 a_vertexNormal;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform vec3 u_lightPosition;
// uniform vec3 u_lightTarget;

varying vec3 N, L, E;

void main() {
    vec4 worldPosition = u_worldMatrix * a_position;
    vec4 viewPosition = u_viewMatrix * worldPosition;
    
    vec3 pos = -(u_viewMatrix * a_position).xyz;
    vec3 lightPos = (u_viewMatrix * u_worldMatrix * vec4(u_lightPosition, 1.0)).xyz;
    
    L = normalize(lightPos);
    E = normalize(-pos);
    N = normalize((u_viewMatrix * u_worldMatrix * vec4(a_faceNormal, 1.0)).xyz);
    
    gl_Position = viewPosition;
}
`;
