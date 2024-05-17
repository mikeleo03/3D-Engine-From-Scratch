export default `
#define PI 3.1415926535897932384626433832795
attribute vec4 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform bool u_useVertexColor;
uniform float u_canvasWidth;
uniform float u_canvasHeight;

varying vec4 v_color;
varying vec3 v_normal, v_pos;

void main() {
    vec4 wPos = u_viewMatrix * u_worldMatrix * a_position;
    vec2 normalizedPos = vec2(wPos.x / u_canvasWidth + 0.5, wPos.y / u_canvasHeight + 0.5);
    gl_Position = vec4(normalizedPos * 2.0 - 1.0, wPos.zw);

    v_pos = gl_Position.xyz / gl_Position.w;
    v_normal = mat3(u_worldMatrix) * a_normal;
    v_color = mix(vec4(1,1,1,1), a_color, float(u_useVertexColor));
}
`;