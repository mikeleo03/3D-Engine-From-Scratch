export default `
#define PI 3.1415926535897932384626433832795
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform vec4 u_color;
uniform bool u_useVertexColor;

varying vec4 v_color;

void main() {
    vec4 wPos =  u_worldMatrix * a_position;

    gl_Position = wPos;
    v_color = mix(vec4(1,1,1,1), a_color, float(u_useVertexColor)) * u_color;
}
`;