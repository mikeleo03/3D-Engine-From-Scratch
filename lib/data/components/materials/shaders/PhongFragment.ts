export default `
precision mediump float;

// Material uniform
uniform float u_shininess;
uniform vec4 u_ambientColor;
uniform vec4 u_diffuseColor;
uniform vec4 u_specularColor;

// Light uniform
uniform vec4 u_lightColor; 
uniform vec4 u_lightAmbient; 
uniform vec4 u_lightDiffuse; 
uniform vec4 u_lightSpecular; 
uniform vec3 u_lightPosition;

varying vec3 normalSurface;
varying vec3 vertexPosition;

void main() {
    vec3 N = normalize(normalSurface);
    vec3 L = normalize(u_lightPosition - vertexPosition);

    // Convert colors from 0-255 to 0-1
    vec3 ambientColor = u_ambientColor.rgb / 255.0;
    vec3 diffuseColor = u_diffuseColor.rgb / 255.0;
    vec3 specularColor = u_specularColor.rgb / 255.0;
    vec3 lightAmbient = u_lightAmbient.rgb / 255.0;
    vec3 lightDiffuse = u_lightDiffuse.rgb / 255.0;
    vec3 lightSpecular = u_lightSpecular.rgb / 255.0;
  
    // Lambert's cosine law
    float lambertian = max(dot(N, L), 0.0);
    float specular = 0.0;
    if (lambertian > 0.0) {
        vec3 R = reflect(-L, N);       // Reflected light vector
        vec3 V = normalize(-vertexPosition);  // Vector to viewer
        
        // Compute the specular term
        float specAngle = max(dot(R, V), 0.0);
        specular = pow(specAngle, u_shininess);
    }

    gl_FragColor = vec4(lightAmbient * ambientColor +
        lightDiffuse * lambertian * diffuseColor +
        lightSpecular * specular * specularColor, 1.0);
}
`;
