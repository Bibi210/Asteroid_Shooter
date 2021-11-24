import { gen_poly_concave, Point, Rand_Between } from "./lib.js";
import { CENTER, HEIGHT, WIDTH } from "./main.js";
import { Object } from "./SpaceShip.js"

// let CONVEXE = 0;
let CONCAVE = 1;

let LVL_MAX = 6;
let MAX_SPEED = 0.5;
let MIN_SPEED = 0.1;
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
        this.speed = better_direction(speed_from_lvl(lvl), dir);
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
    let size = 1 / (LVL_MAX - lvl) * 200

    if (!pos)
        pos = rand_position_on_side(size);
    if (!dir)
        dir = pos;

    // instantiate an asteroid
    let a = new Asteroid(pos, dir, 10, size, lvl, CONCAVE);

    // return the asteroid
    return a;
}

export function fill_asteroids(asteroid_count, lvl) {
    console.log(LVL_MAX);
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
            new_asteroids.push(spawn_asteroid(destroyed_asteroid.lvl - 1, bullet.Barycenter, destroyed_asteroid.Barycenter));
            spawn_count -= 1;
        }
    }

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

export function better_direction(speed, pos) {
    let a = get_angle(CENTER, pos);
    let d = rand_angle_from_dispersion(a - to_radian(DISPERSION / 2), DISPERSION);
    return new Point(speed * Math.sin(d), speed * Math.cos(d));
}

function get_angle(A, O) {
    return (to_radian(360) - Math.atan2(A.y - O.y, A.x - O.x)) % to_radian(360);
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

function speed_from_lvl(lvl) {
    let k = (MAX_SPEED - MIN_SPEED) / LVL_MAX;
    return MIN_SPEED + (k * (LVL_MAX - lvl));
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