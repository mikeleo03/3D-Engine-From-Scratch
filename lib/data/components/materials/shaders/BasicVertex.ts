export default `
#define PI 3.1415926535897932384626433832795
attribute vec4 a_position;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform vec4 u_color;

varying vec4 v_color;

void main() {    
    gl_Position = u_viewMatrix * u_worldMatrix * a_position;
    v_color = u_color;
}
`;