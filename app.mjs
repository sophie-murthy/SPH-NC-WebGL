// WebGL context initialization
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
}

// Shader sources
const vsSource = `
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
`;

const fsSource = `
    // Fragment shader
    precision mediump float;
    varying vec4 vColor;

    void main() {
        // Calculate distance from the center of the point (0.5, 0.5) is the center of a point sprite
        float distance = length(gl_PointCoord - vec2(0.5, 0.5));
        if (distance > 0.5) discard; // Discard pixels outside the circle radius

        gl_FragColor = vColor; // Color the pixel
    }
`;

// Shader compilation and program setup
function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initShaderProgram(vsSource, fsSource) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

const shaderProgram = initShaderProgram(vsSource, fsSource);
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aColor'),
    },
    uniformLocations: {
        uTime: gl.getUniformLocation(shaderProgram, 'uTime'),
    },
};

// Buffer initialization
let numParticles = 2000;
let particlePositions = new Float32Array(numParticles * 3);
let particleVelocities = new Float32Array(numParticles * 3);
let particleColors = new Float32Array(numParticles * 4);

for (let i = 0; i < numParticles; i++) {
    particlePositions[i * 3] = Math.random() * 2 - 1; // X
    particlePositions[i * 3 + 1] = Math.random() * 2 - 1; // Y, randomly distribute
    particlePositions[i * 3 + 2] = 0; // Z

    particleVelocities[i * 3] = 0;                // No horizontal movement
    particleVelocities[i * 3 + 1] = -0.04;        // Downward movement
    particleVelocities[i * 3 + 2] = 0;            // No depth movement

    particleColors[i * 4] = 0.0; // Red
    particleColors[i * 4 + 1] = 0.0; // Green
    particleColors[i * 4 + 2] = 1.0; // Blue
    particleColors[i * 4 + 3] = 1.0; // Alpha
}


// Additional setup and animation loop would go here


// Setup buffers and transfer data to GPU
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, particlePositions, gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, particleColors, gl.STATIC_DRAW);

// Setup to capture the time elapsed
let lastTime = 0;

function animate(time) {
    time *= 0.001;  // convert time to seconds
    const deltaTime = time - lastTime;
    lastTime = time;

    // Update particle positions based on their velocities
    for (let i = 0; i < numParticles; i++) {
        particlePositions[i * 3 + 1] += particleVelocities[i * 3 + 1] * deltaTime;

        // Reset particles that move below a certain Y threshold (e.g., below the viewable area)
        if (particlePositions[i * 3 + 1] < -1.0) {  // Assuming Y coordinate is normalized to [-1,1]
            particlePositions[i * 3 + 1] = 1.0;    // Reset to the top of the viewable area
            particlePositions[i * 3] = Math.random() * 2 - 1; // Randomize the X position
        }
    }

    // Update the position buffer with new positions
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, particlePositions);

    // Clear the canvas and draw the particles
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use the combined shader program
    gl.useProgram(programInfo.program);

    // Set the time uniform
    gl.uniform1f(programInfo.uniformLocations.uTime, time);

    // Enable the position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Enable the color attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    // Draw the particles
    gl.drawArrays(gl.POINTS, 0, numParticles);

    // Call animate again on the next frame
    requestAnimationFrame(animate);
}


// Start the animation loop
requestAnimationFrame(animate);

