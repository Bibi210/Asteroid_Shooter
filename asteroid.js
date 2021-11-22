import { gen_poly_concave, Point, Rand_Between } from "./lib.js";
import { CENTER, HEIGHT, WIDTH } from "./main.js";

// let CONVEXE = 0;
let CONCAVE = 1;

export let LVL_MAX = 6;
let MAX_SPEED = 4;
let MIN_SPEED = 0.1;
let DISPERSION = 180;

// let COLOR = [
//     "rgb(37, 150, 190)", //, Math.) Jaune
//     "rgb(37, 150, 190)", // Orange
//     "rgb(190, 49, 68)", // Rouge
//     "rgb(122, 108, 93)", // Gris
//     "rgb(83, 53, 73)", // Gris foncé
//     "rgb(32, 37, 71)" // Bleu Marine
// ];

export class Asteroid {
    constructor(pos, side_count, max_size, lvl, mode) {
        if (mode == CONCAVE)
            this.poly = gen_poly_concave(pos.x, pos.y, side_count, max_size);
        this.speed = speed_from_lvl(lvl);
        this.direction = better_direction(this.speed, pos); // rand_direction(this.speed);
        this.lvl = lvl
    }

    move_asteroid() {
        // Check asteroid position => wrap asteroid on the other side of the screen
        wrap_asteroid(this);

        // Move asteroid
        this.poly.move(this.direction.x, this.direction.y);
    }
}

export function draw_asteroids(asteroids, ctx) {
    asteroids.forEach(asteroid => {
        asteroid.poly.draw(ctx);
    });
}

export function move_asteroids(asteroids) {
    asteroids.forEach(asteroid => {
        asteroid.move_asteroid();
    });
}

export function spawn_asteroid(lvl, pos = undefined) {
    let size = 1 / (LVL_MAX - lvl) * 100 // FIND A BETTER WAY TO SIZE

    if (!pos)
        pos = rand_position_on_side(size);

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

export function rand_direction(speed) {
    let a = Math.floor(Rand_Between(0, 361)) * Math.PI / 180;
    return new Point(speed * Math.sin(a), speed * Math.cos(a));
}

export function better_direction(speed, pos) {
    let a = get_angle(CENTER, pos);
    let d = rand_angle_from_dispersion(a - to_radian(DISPERSION / 2), DISPERSION);
    return new Point(speed * Math.sin(d), speed * Math.cos(d));
}

function get_angle(A, O) {
    return (to_radian(360) - Math.atan2(A.y - O.y, A.x - O.x)) % to_radian(360);
}

function rand_angle_from_dispersion(min, dispersion) {
    let a = to_radian(Rand_Between(0, dispersion)) + to_radian(90);
    return (min + a);
}

function rand_position_on_side(size) {
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

function to_radian(angle) {
    return angle * Math.PI / 180
}