// Vertex shader
attribute vec3 aPosition;
attribute vec3 aVelocity;
attribute vec4 aColor;
uniform float uTime;
varying vec4 vColor;

void main() {
    vec3 position = aPosition + aVelocity * uTime;
    gl_Position = vec4(position, 1.0);
    gl_PointSize = 2.0; // Adjust point size for smaller particles
    vColor = aColor; // Pass color to fragment shader
}

