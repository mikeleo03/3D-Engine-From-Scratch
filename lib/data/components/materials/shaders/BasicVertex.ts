export default `
#define PI 3.1415926535897932384626433832795
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform vec4 u_color;
uniform bool u_useVertexColor;
uniform float u_canvasWidth;
uniform float u_canvasHeight;

varying vec4 v_color;

void main() {
    vec4 wPos = u_worldMatrix * a_position;

    vec2 normalizedPos = vec2(wPos.x / u_canvasWidth, wPos.y / u_canvasHeight);
    
    gl_Position = vec4(normalizedPos * 2.0 - 1.0, wPos.zw);
    v_color = mix(vec4(1,1,1,1), a_color, float(u_useVertexColor)) * u_color;
}
`;