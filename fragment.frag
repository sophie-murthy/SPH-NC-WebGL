// Fragment shader
precision mediump float;
varying vec4 vColor;

void main() {
    // Calculate distance from the center of the point (0.5, 0.5) is the center of a point sprite
    float distance = length(gl_PointCoord - vec2(0.5, 0.5));
    if (distance > 0.5) discard; // Discard pixels outside the circle radius

    gl_FragColor = vColor; // Color the pixel
}

