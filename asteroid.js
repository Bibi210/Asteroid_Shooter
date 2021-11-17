import { gen_poly_concave, Point, Rand_Between } from "./lib.js";
import { HEIGHT, WIDTH } from "./test.js";

// Actual step : 
// Spawn asteroids on the side

let CONVEXE = 0
let CONCAVE = 1

export class Asteroid {
    constructor(x, y, side_count, max_size, direction, mode) {
        if (mode == CONCAVE) {
            this.poly = gen_poly_concave(x, y, side_count, max_size);
            this.direction = direction;
        }
    }

    move_asteroid() {
        if (this.poly.x > WIDTH + this.poly.Size) {
            this.poly.x = -this.poly.Size;
        }
        else if (this.poly.x < -this.poly.Size) {
            this.poly.x = WIDTH + this.poly.Size;
        }
        else if (this.poly.y > HEIGHT + this.poly.Size) {
            this.poly.y = -this.poly.Size;
        }
        else if (this.poly.y < -this.poly.Size) {
            this.poly.y = HEIGHT + this.poly.Size;
        }

        this.poly.move(this.direction.x, this.direction.y)
    }
}

export function spawn_asteroid() {
    let x, y;
    let size = 200;
    let direction;
    // Random location on the side
    // Choose side
    let side = Math.floor(Rand_Between(0, 4));
    if (side == 0) {
        x = -size / 2;
        direction = rand_direction(315, 360) + rand_direction(0, 45);
    }
    if (side == 2) {
        x = WIDTH + (size / 2);
        direction = rand_direction(135, 225);
    }
    if (side == 1) {
        y = -size / 2;
        direction = rand_direction(225, 315);
    }
    if (side == 3) {
        y = HEIGHT + (size / 2);
        direction = rand_direction(45, 135);
    }
    // Choose pos
    if (side == 0 || side == 2) {
        y = Rand_Between(-size / 2, ((HEIGHT + size) / 2) + 1);
    }
    else {
        x = Rand_Between(-size / 2, ((WIDTH + size) / 2) + 1);
    }

    // instantiate an asteroid
    let a = new Asteroid(x, y, 20, size, direction, CONCAVE);

    // return the asteroid
    return a;
}

function rand_direction(min, max) {
    let a = Math.floor(Rand_Between(min, max + 1)) * Math.PI / 180;
    return new Point(Math.sin(a), Math.cos(a));
}