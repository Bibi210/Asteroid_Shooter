import { gen_poly_concave, Point, Rand_Between } from "./lib.js";
import { CENTER, HEIGHT, WIDTH } from "./test.js";

let CONVEXE = 0;
let CONCAVE = 1;

export let RANDO = 1;
export let GIVEN = 0;

let LVL_MAX = 6;
let MAX_SPEED = 4;
let MIN_SPEED = 0.1;

let COLOR = [
    "rgb(37, 150, 190)", // Jaune
    "rgb(37, 150, 190)", // Orange
    "rgb(190, 49, 68)", // Rouge
    "rgb(122, 108, 93)", // Gris
    "rgb(83, 53, 73)", // Gris foncé
    "rgb(32, 37, 71)" // Bleu Marine
];

export class Asteroid {
    constructor(pos, side_count, max_size, lvl, mode) {
        if (mode == CONCAVE)
            this.poly = gen_poly_concave(pos.x, pos.y, side_count, max_size);
        this.speed = speed_from_lvl(lvl);
        this.direction = rand_direction(this.speed);
        this.lvl = lvl
    }

    move_asteroid() {
        // Check asteroid position => wrap asteroid on the other side of the screen
        wrap_asteroid(this);

        // Move asteroid
        this.poly.move(this.direction.x, this.direction.y);
    }
}

export function spawn_asteroid(mode, lvl, pos = new Point(0, 0)) {
    let size = 100 * lvl

    if (mode)
        pos = rand_position(size);

    // instantiate an asteroid
    let a = new Asteroid(pos, 10, size, lvl, CONCAVE);

    // return the asteroid
    return a;
}

function wrap_asteroid(asteroid) {
    let dx = WIDTH + asteroid.poly.Size;
    let dy = HEIGHT + asteroid.poly.Size;

    if (asteroid.poly.Barycenter.x < -asteroid.poly.Size / 2)
        asteroid.poly.move(dx, 0);

    if (asteroid.poly.Barycenter.x > WIDTH + asteroid.poly.Size / 2)
        asteroid.poly.move(-dx, 0);

    if (asteroid.poly.Barycenter.y < -asteroid.poly.Size / 2)
        asteroid.poly.move(0, dy);

    if (asteroid.poly.Barycenter.y > HEIGHT + asteroid.poly.Size / 2)
        asteroid.poly.move(0, -dy);
}

export function spawn_on_colision(asteroids, spawn_count) {
    if (!asteroids.length) {
        return
    }

    // Choose a random asteroids
    let idx = random_element(asteroids.length)

    // get the position of the destroyed asteroids
    let rm_a = asteroids.splice(idx, 1)
    let new_pos = new Point(rm_a[0].poly.Barycenter.x - rm_a[0].poly.Size / 2, rm_a[0].poly.Barycenter.y - rm_a[0].poly.Size / 2)

    // instantiate new asteroids
    if (rm_a[0].lvl != 0) {
        for (let i = 0; i < spawn_count; i++) {
            asteroids.push(spawn_asteroid(GIVEN, rm_a[0].lvl - 1, new_pos))
        }
    }
}

function push_horizontaly(x, size) {
    x += (x > CENTER.x) ? WIDTH - x : -(x + size);
    return x;
}

function push_verticaly(y, size) {
    y += (y > CENTER.y) ? HEIGHT - y : -(y + size);
    return y;
}

function rand_direction(speed) {
    let a = Math.floor(Rand_Between(0, 361)) * Math.PI / 180;
    return new Point(speed * Math.sin(a), speed * Math.cos(a));
}

function rand_position(size) {
    let x = Rand_Between(0, WIDTH + 1);
    let y = Rand_Between(0, HEIGHT + 1);

    let xp = (WIDTH - x) - x;
    let yp = (HEIGHT - y) - y;

    if (xp > yp) {
        y = push_verticaly(y, size);
    }
    else {
        x = push_horizontaly(x, size)
    }

    return new Point(x, y);
}

function random_element(length) {
    return Math.floor(Rand_Between(0, length))
}

function speed_from_lvl(lvl) {
    let k = (MAX_SPEED - MIN_SPEED) / LVL_MAX;
    return MIN_SPEED + (k * (LVL_MAX - lvl));
}