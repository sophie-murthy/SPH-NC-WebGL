let REST_DENS = 400;
let GAS_CONST = 2000;
let H = 16;
let HSQ = H * H;
let MASS = 5;
let VISC = 100;
let POLY6 = Math.sqrt(H) / (Math.PI * Math.pow(H, 8));
let SPIKY_GRAD = -(Math.sqrt(H) + 6) / (Math.PI * H ** 5);
let VISC_LAP = (Math.sqrt(H) * 10) / (Math.PI * H ** 5);
let EPS = H;
let BOUND_DAMP = -0.5;
let G;
let DT = 0.0007;
let checkDirection = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 0],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.v = createVector();
    this.rho = 0;
    this.f = createVector();
    this.p = 0;
    this.radius = H / 2;
    this.scu = createVector();
  }
  show() {
    circle(this.pos.x, this.pos.y, H / 2);
  }
}

function densityPressure() {
  num_row = particles.length;
  num_col = particles[0].length;
  for (let i = 1; i < num_row - 1; i++) {
    for (let j = 1; j < num_col - 1; j++) {
      num_particles = particles[i][j].length;
      for (let k = 0; k < num_particles; k++) {
        let p = particles[i][j][k];
        p.rho = 0;
        for (direction of checkDirection) {
          let new_i = i + direction[0];
          let new_j = j + direction[1];
          for (let p_check of particles[new_i][new_j]) {
            let distance_vector = p5.Vector.sub(p_check.pos, p.pos);
            let distance = distance_vector.magSq();
            if (distance < HSQ) {
              p.rho += MASS * POLY6 * pow(HSQ - distance, 3);
            }
          }
        }
        p.p = GAS_CONST * (p.rho - REST_DENS);
      }
    }
  }
}

function forces() {
  num_row = particles.length;
  num_col = particles[0].length;
  for (let i = 1; i < num_row - 1; i++) {
    for (let j = 1; j < num_col - 1; j++) {
      num_particles = particles[i][j].length;
      for (let k = 0; k < num_particles; k++) {
        let p = particles[i][j][k];

        let fpress = createVector();
        let fvisc = createVector();

        for (direction of checkDirection) {
          let new_i = i + direction[0];
          let new_j = j + direction[1];
          for (let p_check of particles[new_i][new_j]) {
            if (p_check == p) {
              continue;
            }
            let distance_vector = p5.Vector.sub(p_check.pos, p.pos);
            let distance = distance_vector.mag();

            if (distance < H) {
              let a = p5.Vector.mult(
                distance_vector.normalize(),
                (-MASS *
                  (p_check.p + p.p) *
                  SPIKY_GRAD *
                  pow(H - distance, 3)) /
                  (2 * p_check.rho)
              );
              let con = (VISC * MASS * VISC_LAP * (H - distance)) / p_check.rho;
              fpress.add(a);
              fvisc.add(p5.Vector.mult(p5.Vector.sub(p_check.v, p.v), con));
            }
          }
        }
        let fgrav = p5.Vector.mult(G, MASS / p.rho);
        let fo = createVector();
        fo.add(fpress);
        fo.add(fvisc);
        fo.add(fgrav);
        p.f = fo;
      }
    }
  }
}

function integrate() {
  num_row = particles.length;
  num_col = particles[0].length;
  let num_rows = Math.ceil(height / (3 * H) + 2);
  let num_cols = Math.ceil(width / (3 * H) + 2);
  new_particles = create3DArray(num_rows, num_cols);
  for (let i = 1; i < num_row - 1; i++) {
    for (let j = 1; j < num_col - 1; j++) {
      num_particles = particles[i][j].length;
      for (let k = 0; k < num_particles; k++) {
        let p = particles[i][j][k];
        p.v.add(p5.Vector.mult(p.f, DT / p.rho));
        p.pos.add(p5.Vector.mult(p.v, DT));
        if (p.pos.y + H > height) {
          p.v.y *= BOUND_DAMP;
          p.pos.y = height - EPS;
        }
        if (p.pos.y < H) {
          p.v.y *= BOUND_DAMP;
          p.pos.y = H;
        }
        if (p.pos.x + EPS > width) {
          p.v.x *= BOUND_DAMP;
          p.pos.x = width - EPS;
        }
        if (p.pos.x < EPS) {
          p.v.x *= BOUND_DAMP;
          p.pos.x = EPS;
        }
        if (!meta) {
          p.show();
        }
        new_particles[Math.floor(p.pos.y / (3 * H)) + 1][
          Math.floor(p.pos.x / (3 * H)) + 1
        ].push(p);
      }
    }
  }
  particles = new_particles;
}
