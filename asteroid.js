import { gen_poly_concave, Point, Rand_Between } from "./lib.js";
import { CENTER, HEIGHT, WIDTH } from "./main.js";
import { Object } from "./SpaceShip.js"

// let CONVEXE = 0;
let CONCAVE = 1;

let LVL_MAX = 6;
let MAX_SPEED = 1;
let MIN_SPEED = 0.1;

let MAX_SIZE = 300;
let MIN_SIZE = 80;

let DISPERSION = 160;

let COLOR = [
    "#fedfd4",
    "#cb1b16",
    "#ef3c2d",
    "#f26a4f",
    "#f29479",
    "#65010c",
];

export class Asteroid extends Object {
    constructor(pos, dir, side_count, max_size, lvl, mode) {
        let poly = gen_poly_concave(pos.x, pos.y, side_count, max_size);
        if (mode == CONCAVE)
            super(poly.Point_List, 0)
        this.Size = poly.Size;
        this.Color = COLOR[lvl];
        this.speed = better_direction(proportion_from_lvl(lvl, MAX_SPEED, MIN_SPEED, 1), dir, pos);
        this.lvl = lvl
    }
    move_asteroid() {
        // Move asteroid
        this.updatePos();
    }
}

export function draw_asteroids(asteroids, ctx) {
    asteroids.forEach(asteroid => {
        asteroid.draw(ctx);
    });
}

export function move_asteroids(asteroids) {
    asteroids.forEach(asteroid => {
        asteroid.move_asteroid();
    });
}

export function spawn_asteroid(lvl, dir = undefined, pos = undefined) {
    let size = proportion_from_lvl(lvl, MAX_SIZE, MIN_SIZE, 0);

    if (!pos)
        pos = rand_position_on_side(size);
    if (!dir)
        dir = CENTER;

    let a = new Asteroid(pos, dir, 10, size, lvl, CONCAVE);

    return a;
}

export function fill_asteroids(asteroid_count, lvl) {
    let asteroids = [];

    for (let i = 0; i < asteroid_count; i++) {
        asteroids.push(spawn_asteroid(LVL_MAX - lvl))
    }

    return asteroids
}

export function spawn_on_colision(destroyed_asteroid, bullet, spawn_count = 2) {
    let new_asteroids = [];

    // instantiate new asteroids
    if (destroyed_asteroid.lvl != 0) {
        while (spawn_count) {
            // use teleport to replace new asteroid to good position
            let a = new Asteroid(destroyed_asteroid.Barycenter, bullet.get_dir(), 10, proportion_from_lvl(destroyed_asteroid.lvl - 1, MAX_SIZE, MIN_SIZE, 0), destroyed_asteroid.lvl - 1, CONCAVE);
            new_asteroids.push(a);
            spawn_count -= 1;
        }
    }

    console.log(new_asteroids);
    return new_asteroids;
}

function push_horizontaly(x, size) {
    x += (x > CENTER.x) ? WIDTH - x : -(x + size);
    return x;
}

function push_verticaly(y, size) {
    y += (y > CENTER.y) ? HEIGHT - y : -(y + size);
    return y;
}

// Can maybe be useful
// export function rand_direction(speed) {
//     let a = Math.floor(Rand_Between(0, 361)) * Math.PI / 180;
//     return new Point(speed * Math.sin(a), speed * Math.cos(a));
// }

export function better_direction(speed, from, to) {
    let a = get_angle(from, to);
    let d = rand_angle_from_dispersion((a - to_radian(DISPERSION / 2) % to_radian(360)), DISPERSION);
    return new Point(speed * Math.sin(d), speed * Math.cos(d));
}

function get_angle(A, O) {
    let angle = (to_radian(360) - Math.atan2(A.y - O.y, A.x - O.x)) % to_radian(360);
    return angle
}

function rand_angle_from_dispersion(min, dispersion) {
    let a = to_radian(Rand_Between(0, dispersion)) + to_radian(270);
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

function proportion_from_lvl(lvl, max, min, inverse) {
    let k = (max - min) / LVL_MAX;
    if (inverse) {
        return min + (k * (LVL_MAX - lvl));
    }
    return min + k * lvl;
}

function to_radian(angle) {
    return angle * Math.PI / 180
}

export function get_lvl_max() {
    return LVL_MAX;
}

export function set_lvl_max(v) {
    LVL_MAX = v;
}