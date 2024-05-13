let particles;
let cSize = 8;
let cols;
let rows;
let mouseDown = false;
// let meta = false;
let lockChamber = [];

function create3DArray(dim1, dim2) {
  let array = new Array(dim1);
  for (let i = 0; i < dim1; i++) {
    array[i] = new Array(dim2);
    for (let j = 0; j < dim2; j++) {
      array[i][j] = new Array();
    }
  }
  return array;
}

function setup() {
  createCanvas(640, 640);
  G = createVector(0, 50);
  let sliderContainer = createDiv("");
  sliderContainer.id("slider-container");

  // Create sliders
  let gravityLabel = createP("Gravity Slider (slide to change the gravity)");
  gravityLabel.parent(sliderContainer);
  gravity = createSlider(10, 100, 50, 1);
  gravity.parent(sliderContainer);
  gravity.id("gravity-slider");

  let gasConstLabel = createP("Gas Constant (slide to change the gas constant)");
  gasConstLabel.parent(sliderContainer);
  gasConstSlider = createSlider(200, 3000, 2000, 10);
  gasConstSlider.parent(sliderContainer);
  gasConstSlider.id("gasConst-slider");

  let viscLabel = createP("Visc Constant (slide to change the visc constant)");
  viscLabel.parent(sliderContainer);
  viscSlider = createSlider(1, 1000, 100, 1);
  viscSlider.parent(sliderContainer);
  viscSlider.id("visc-slider");

  cols = width / cSize;
  rows = height / cSize;
  let num_rows = Math.ceil(height / (3 * H) + 2);
  let num_cols = Math.ceil(width / (3 * H) + 2);
  particles = create3DArray(num_rows, num_cols);
  for (let y = height / 9; y < height / 1.5; y += H) {
    for (let x = 150; x < 250; x += H) {
      row = Math.floor(y / (3 * H)) + 1;
      new_x = x + random(-3, 3);
      col = Math.floor(new_x / (3 * H)) + 1;
      particles[row][col].push(new Particle(new_x, y));
    }
  }
  densityPressure();
  forces();
}

function draw() {
  background(0, 0, 0);
  stroke(0);
  fill(255);
  G = createVector(0, gravity.value());
  GAS_CONST = gasConstSlider.value();
  VISC = viscSlider.value();

  densityPressure();
  forces();
  integrate();

  for (let p of lockChamber) {
    p.pos = createVector(mouseX, mouseY);
    p.pos.add(p.scu);
    p.v.mult(0);
  }
}

function mousePressed() {
  // create a particle(invislble) at the mouse place

  let temp = new MouseParticle(mouseX, mouseY);
  let row = Math.floor(mouseY / (3 * H)) + 1;
  let col = Math.floor(mouseX / (3 * H)) + 1;
  if (row >= 0 && col >= 0 && row < particles.length && col < particles[row].length) {
    particles[row][col].push(temp);  // Add particle if it's within the grid bounds
  }
  console.log(particles[row][col]);

  lockChamber.push(temp);
}


function mouseDragged() {

  // find the particle in the grid and move it
  let row = Math.floor(mouseY / (3 * H)) + 1;
  let col = Math.floor(mouseX / (3 * H)) + 1;
  for (p of lockChamber) {
    p.pos = createVector(mouseX, mouseY);
    p.pos.add(p.scu);
  }

}


function mouseReleased() {
  // delete the particle
  let row = Math.floor(mouseY / (3 * H)) + 1;
  let col = Math.floor(mouseX / (3 * H)) + 1;
  if (row >= 0 && col >= 0 && row < particles.length && col < particles[row].length) {
    particles[row][col] = particles[row][col].filter(p => p instanceof Particle);  // Add particle if it's within the grid bounds
  }
  console.log(particles[row][col]);
  console.log(particles);

  mouseDown = false;
  lockChamber = [];
}

function doubleClicked() {
  let radius = H * 2;  
  for (let angle = 0; angle < 360; angle += 360 / 50) { 
    let x = mouseX + radius * cos(radians(angle)); 
    let y = mouseY + radius * sin(radians(angle));  
    let temp = new Particle(x, y);
    let row = Math.floor(y / (3 * H)) + 1;
    let col = Math.floor(x / (3 * H)) + 1;
    if (row >= 0 && col >= 0 && row < particles.length && col < particles[row].length) {
      particles[row][col].push(temp);  
    }
  }
}
