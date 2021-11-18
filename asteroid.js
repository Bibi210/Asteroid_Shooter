import { gen_poly_concave, Point, Rand_Between } from "./lib.js";
import { HEIGHT, WIDTH } from "./test.js";

// Actual step : 
// Spawn asteroids on the side

let CONVEXE = 0
let CONCAVE = 1

export class Asteroid {
    constructor(x, y, side_count, max_size, mode) {
        if (mode == CONCAVE) {
            this.poly = gen_poly_concave(x, y, side_count, max_size);
        }
        this.speed = 4
        this.direction = rand_direction(this.speed);
    }

    move_asteroid() {
        let dx = WIDTH + this.poly.Size;
        let dy = HEIGHT + this.poly.Size;

        if (this.poly.Barycenter.x < -this.poly.Size / 2) {
            this.poly.move(dx, 0);
        }
        if (this.poly.Barycenter.x > WIDTH + this.poly.Size / 2) {
            this.poly.move(-dx, 0);
        }
        if (this.poly.Barycenter.y < -this.poly.Size / 2) {
            this.poly.move(0, dy);

        }
        if (this.poly.Barycenter.y > HEIGHT + this.poly.Size / 2) {
            this.poly.move(0, -dy);
        }

        this.poly.move(this.direction.x, this.direction.y);
    }
}

export function spawn_asteroid(x, y) {
    let size = 200;

    // instantiate an asteroid
    let a = new Asteroid(x - (size / 2), y - (size / 2), 20, size, CONCAVE);

    // return the asteroid
    return a;
}

function rand_direction(speed) {
    let a = Math.floor(Rand_Between(0, 360)) * Math.PI / 180
    return new Point(speed * Math.sin(a), speed * Math.cos(a))
}