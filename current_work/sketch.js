let particles;
let cSize = 8;
let cols;
let rows;
let useLerp = true;
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

function cornersBinaryToDecimal(corner0, corner1, corner2, corner3) {
  return corner0 * 8 + corner1 * 4 + corner2 * 2 + corner3 * 1;
}

function LERP(value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
}
function vecLine(a, b, v) {
  if (v != undefined) {
    vertex(a.x, a.y);
    vertex(b.x, b.y);
  } else {
    line(a.x, a.y, b.x, b.y);
  }
}

function setup() {
  createCanvas(640, 640);
  G = createVector(0, 50);
  gravity = createSlider(10, 100, 50, 1);
  gravity.position(10, 10);
  gasConstSlider = createSlider(200, 3000, 2000, 10);
  gasConstSlider.position(20, 80);
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
  text("FPS:" + frameRate(), 20, 20);
  text(
    // "Press R to toggle Render and Space to add particles. You can drag stuff too",
    "Press Space to add more particles in the mouse's postion, and you can use mouse drag particles",
    20,
    40
  );
  text("User the slider change gravity in the canvas", 20, 55);
  densityPressure();
  forces();
  integrate();
  // if (meta) {
  //   let corners = [];
  //   let samples = [];
  //   for (let i = 0; i < cols; i++) {
  //     samples.push([]);
  //     corners.push([]);
  //     for (let j = 0; j < rows; j++) {
  //       let x = i * cSize;
  //       let y = j * cSize;
  //       let sum = 0;

  //       let num_row = particles.length;
  //       let num_col = particles[0].length;
  //       for (let m = 1; m < num_row - 1; m++) {
  //         for (let n = 1; n < num_col - 1; n++) {
  //           for (let temp of particles[m][n]) {
  //             let dx = temp.pos.x - x;
  //             let dy = temp.pos.y - y;
  //             let distance = dx ** 2 + dy ** 2;
  //             sum = sum + temp.radius ** 2 / distance;
  //           }
  //         }
  //       }

  //       samples[i].push(sum);
  //       corners[i].push(samples[i][j] > 1);

  //       if (j > 0 && i > 0) {
  //         let I = i - 1;
  //         let J = j - 1;
  //         let a;
  //         let b;
  //         let c;
  //         let d;

  //         if (useLerp) {
  //           const aVal = samples[I][J];
  //           const bVal = samples[I + 1][J];
  //           const cVal = samples[I + 1][J + 1];
  //           const dVal = samples[I][J + 1];

  //           let amt = (1 - aVal) / (bVal - aVal);

  //           a = createVector(LERP(x, x + cSize, amt), y);

  //           amt = (1 - bVal) / (cVal - bVal);
  //           b = createVector(x + cSize, LERP(y, y + cSize, amt));

  //           amt = (1 - dVal) / (cVal - dVal);
  //           c = createVector(LERP(x, x + cSize, amt), y + cSize);

  //           amt = (1 - aVal) / (dVal - aVal);
  //           d = createVector(x, LERP(y, y + cSize, amt));
  //         } else {
  //           a = createVector(x + cSize / 2, y);
  //           b = createVector(x + cSize, y + cSize / 2);
  //           c = createVector(x + cSize / 2, y + cSize);
  //           d = createVector(x, y + cSize / 2);
  //         }
  //         const state = cornersBinaryToDecimal(
  //           corners[I][J],
  //           corners[I + 1][J],
  //           corners[I + 1][J + 1],
  //           corners[I][J + 1]
  //         );
  //         stroke(0, 0, (height - y + 50) * 2);
  //         fill(0, 0, (height - y + 50) * 2);
  //         //console.log(a.x)
  //         switch (state) {
  //           case 0:
  //             break;
  //           case 1:
  //             //vecLine(d, c)

  //             beginShape();
  //             vertex(d.x, d.y);
  //             vertex(c.x, c.y);
  //             vertex(d.x, c.y);
  //             endShape(CLOSE);
  //             break;
  //           case 2:
  //             //vecLine(b, c)

  //             beginShape();
  //             vertex(b.x, b.y);
  //             vertex(c.x, c.y);
  //             vertex(b.x, c.y);
  //             endShape(CLOSE);
  //             break;
  //           case 3:
  //             //vecLine(d, b)
  //             beginShape();
  //             vertex(d.x, d.y);
  //             vertex(b.x, b.y);
  //             vertex(b.x, c.y);
  //             vertex(d.x, c.y);
  //             endShape(CLOSE);
  //             break;
  //           case 4:
  //             //vecLine(a, b)

  //             beginShape();
  //             vertex(a.x, a.y);
  //             vertex(b.x, b.y);
  //             vertex(b.x, a.y);
  //             endShape(CLOSE);
  //             break;
  //           case 5:
  //             // vecLine(a, d)
  //             // vecLine(b, c)
  //             beginShape();

  //             endShape(CLOSE);
  //             break;
  //           case 6:
  //             //vecLine(a, c)
  //             beginShape();
  //             vertex(a.x, a.y);
  //             vertex(c.x, c.y);
  //             vertex(b.x, c.y);
  //             vertex(b.x, a.y);
  //             endShape(CLOSE);
  //             break;
  //           case 7:
  //             //vecLine(a, d)

  //             beginShape();
  //             vertex(a.x, a.y);
  //             vertex(d.x, d.y);
  //             vertex(d.x, c.y);
  //             vertex(b.x, c.y);
  //             vertex(b.x, a.y);
  //             endShape(CLOSE);
  //             // fill(0)
  //             // stroke(0)
  //             // circle(d.x,c.y,2)
  //             break;
  //           case 8:
  //             //vecLine(a, d)

  //             beginShape();
  //             vertex(a.x, a.y);
  //             vertex(d.x, d.y);
  //             vertex(d.x, a.y);
  //             endShape(CLOSE);

  //             //circle()
  //             break;
  //           case 9:
  //             //vecLine(a, c)
  //             beginShape();
  //             vertex(a.x, a.y);
  //             vertex(c.x, c.y);
  //             vertex(d.x, c.y);
  //             vertex(d.x, a.y);
  //             endShape(CLOSE);

  //             break;
  //           case 10:
  //             // vecLine(a, b,true)
  //             // vecLine(c, d,true)
  //             break;
  //           case 11:
  //             //vecLine(a, b)
  //             beginShape();
  //             vertex(a.x, a.y);
  //             vertex(b.x, b.y);
  //             vertex(b.x, c.y);
  //             vertex(d.x, c.y);
  //             vertex(d.x, a.y);
  //             endShape(CLOSE);

  //             break;
  //           case 12:
  //             //vecLine(b, d)
  //             beginShape();
  //             vertex(d.x, d.y);
  //             vertex(b.x, b.y);
  //             vertex(b.x, a.y);
  //             vertex(d.x, a.y);
  //             endShape(CLOSE);

  //             break;
  //           case 13:
  //             //vecLine(b, c)
  //             beginShape();
  //             vertex(b.x, b.y);
  //             vertex(c.x, c.y);
  //             vertex(d.x, c.y);
  //             vertex(d.x, a.y);
  //             vertex(b.x, a.y);
  //             //vertex(a.x,b.y)
  //             endShape(CLOSE);

  //             break;
  //           case 14:
  //             //vecLine(d, c)
  //             beginShape();
  //             vertex(d.x, d.y);
  //             vertex(c.x, c.y);
  //             vertex(b.x, c.y);
  //             vertex(b.x, a.y);
  //             vertex(d.x, a.y);

  //             endShape(CLOSE);

  //             break;
  //           case 15:
  //             beginShape();
  //             // vertex(a.x,a.y)
  //             // vertex(b.x,a.y)
  //             // vertex(b.x,c.y)
  //             // vertex(a.x,c.y)
  //             // endShape(CLOSE)
  //             // beginShape()
  //             // vertex(d.x,a.y)
  //             // vertex(a.x,a.y)
  //             // vertex(a.x,c.y)
  //             // vertex(d.x,c.y)
  //             // endShape(CLOSE)
  //             rect(d.x, a.y, cSize);
  //             break;
  //         }
  //       }
  //     }
  //   }
  // }
  for (let p of lockChamber) {
    p.pos = createVector(mouseX, mouseY);
    p.pos.add(p.scu);
    p.v.mult(0);
  }
}

function mousePressed() {
  mouseDown = true;
  lockChamber = [];

  num_row = particles.length;
  num_col = particles[0].length;
  for (let i = 1; i < num_row - 1; i++) {
    for (let j = 1; j < num_col - 1; j++) {
      for (let p of particles[i][j]) {
        if (dist(p.pos.x, p.pos.y, mouseX, mouseY) < 50) {
          p.scu = p5.Vector.sub(p.pos, createVector(mouseX, mouseY));
          lockChamber.push(p);
        }
      }
    }
  }
}
function mouseReleased() {
  mouseDown = false;
  lockChamber = [];
}
function keyPressed() {
  if (keyCode == 32) {
    for (let y = mouseY - H * 2; y < mouseY + H * 2; y += H) {
      for (let x = mouseX - H * 2; x < mouseX + H * 2; x += H) {
        let temp = new Particle(x, y);
        row = Math.floor(y / (3 * H)) + 1;
        col = Math.floor(x / (3 * H)) + 1;
        particles[row][col].push(temp);
      }
    }
  }
  // if (keyCode == 82) {
  //   meta = !meta;
  // }
}
