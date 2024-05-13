let REST_DENS = 400;
let GAS_CONST = 2000;
let H = 16;
let HSQ = H * H;
let MASS = 10;
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
    fill(255, 255, 255);
    circle(this.pos.x, this.pos.y, H / 2);
  }
}

class MouseParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.v = createVector();
    this.rho = 0;
    this.f = createVector();
    this.p = 0;
    this.h = 40;
    this.radius =  20;
    this.scu = createVector();
  }
  show() {
    fill(0, 0, 0);
    circle(this.pos.x, this.pos.y, this.radius);
  }
}


function densityPressure() {
  column = particles[0].length;
  for (let i = 1; i < particles.length - 1; i++) {
    for (let j = 1; j < column - 1; j++) {
      particle_count = particles[i][j].length;
      for (let k = 0; k < particle_count; k++) {
        let p = particles[i][j][k];
        p.rho = 0;
        for (direction of checkDirection) {
          let i_recent = i + direction[0];
          let j_recent = j + direction[1];
          for (let p_check of particles[i_recent][j_recent]) {
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
  column = particles[0].length;
  for (let i = 1; i < particles.length - 1; i++) {
    for (let j = 1; j < column - 1; j++) {
      particle_count = particles[i][j].length;
      for (let k = 0; k < particle_count; k++) {
        let p = particles[i][j][k];

        let force_press = createVector();
        let force_visc = createVector();

        for (direction of checkDirection) {
          let i_recent = i + direction[0];
          let j_recent = j + direction[1];
          for (let p_check of particles[i_recent][j_recent]) {
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
              force_press.add(a);
              force_visc.add(p5.Vector.mult(p5.Vector.sub(p_check.v, p.v), con));
            }
          }
        }
        let force_gravity = p5.Vector.mult(G, MASS / p.rho);

        let fo = createVector();

        fo.add(force_press);
        fo.add(force_visc);
        fo.add(force_gravity);
        p.f = fo;
      }
    }
  }
}

function integrate() {
  column = particles[0].length;
  let total_rows = Math.ceil(height / (3 * H) + 2);
  let total_columns = Math.ceil(width / (3 * H) + 2);

  new_particles = create3DArray(total_rows, total_columns);

  for (let i = 1; i < particles.length - 1; i++) {
    for (let j = 1; j < column - 1; j++) {
      particle_count = particles[i][j].length;

      for (let k = 0; k < particle_count; k++) {
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
        // if (!meta) {
        p.show();
        // }
        new_particles[Math.floor(p.pos.y / (3 * H)) + 1][
          Math.floor(p.pos.x / (3 * H)) + 1
        ].push(p);
      }
    }
  }
  particles = new_particles;
}
