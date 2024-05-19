export default `
precision mediump float;

attribute vec3 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform float u_canvasWidth;
uniform float u_canvasHeight;

varying vec4 v_color;
varying vec3 v_normal, v_pos;

void main() {
    // Transform the vertex position into the clip space
    vec4 worldPosition = u_worldMatrix * vec4(a_position, 1.0);
    vec4 viewPosition = u_viewMatrix * worldPosition;
    vec2 normalizedPos = vec2(viewPosition.x / u_canvasWidth + 0.5, viewPosition.y / u_canvasHeight + 0.5);

    gl_Position = vec4(normalizedPos * 2.0 - 1.0, viewPosition.zw);

    // Pass the color attribute to the fragment shader
    v_color = a_color;

    // Calculate the normal in eye coordinates
    v_normal = mat3(u_worldMatrix) * a_normal;

    // Pass the position in eye coordinates to the fragment shader    
    v_pos = vec3(gl_Position);
}
`;
