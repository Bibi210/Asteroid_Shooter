import { probability, gen_poly_concave, Point, Rand_Between, random_rgb } from "./lib.js";
import { CENTER, HEIGHT, WIDTH, buffs } from "./main.js";
import { Object } from "./SpaceShip.js"

// let CONVEXE = 0;
let CONCAVE = 1;

let LVL_MAX = 6;
let MAX_SPEED = 0.5;
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
    buff = -1;
    constructor(pos, dir, side_count, max_size, lvl, mode) {
        let poly = gen_poly_concave(pos.x, pos.y, side_count, max_size);
        if (mode == CONCAVE)
            super(poly.Point_List, 0)
        this.Size = poly.Size;
        this.Color = COLOR[lvl];
        this.speed = better_direction(proportion_from_lvl(lvl, MAX_SPEED, MIN_SPEED, 1), dir, pos);
        this.lvl = lvl
        if (probability(10))
            this.buff = Math.floor(Rand_Between(0, 4));
    }
    move_asteroid() {
        // Move asteroid
        this.updatePos();
    }
    draw(ctx) {
        if (this.buff != -1)
            this.Color = random_rgb();
        super.draw(ctx);
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
            let a = new Asteroid(destroyed_asteroid.Barycenter, bullet.get_dir(), 10, proportion_from_lvl(destroyed_asteroid.lvl - 1, MAX_SIZE, MIN_SIZE, 0), destroyed_asteroid.lvl - 1, CONCAVE);
            a.teleport(destroyed_asteroid.Barycenter.x, destroyed_asteroid.Barycenter.y);
            new_asteroids.push(a);
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

export function better_direction(speed, from, to) {
    let a = get_angle(from, to);
    let d = rand_angle_from_dispersion((a - to_radian(DISPERSION / 2) % to_radian(360)), DISPERSION);
    let p = new Point(speed * Math.sin(d), speed * Math.cos(d));
    return p;
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

const buff_type = {
    Gatling: 0,
    Big_Bullet: 1,
    Shield: 2,
}

export class Buff {
    buff_duration = 0;
    constructor(type, player) {
        this.type = type;
        this.owner = player;
        this.apply_buff(this.owner);
    }
    apply_buff() {
        switch (this.type) {
            case buff_type.Gatling:
                this.buff_duration = 600;
                this.owner.cooling = 15;
                break;
            case buff_type.Big_Bullet:
                this.buff_duration = 3000;
                this.owner.bullets_size = 20;
                break;
            case buff_type.Shield:
                if (!this.owner.shield)
                    this.owner.shield = true;
                else {
                    this.type = Math.ceil(Rand_Between(0, 3));
                    this.add_buff();
                }
                break;
            default:
                break;
        }
    }
    remove_buff() {
        switch (this.type) {
            case buff_type.Gatling:
                this.owner.cooling = 50;
                break;
            case buff_type.Big_Bullet:
                this.owner.bullets_size = 5;
                break
            default:
                break;
        }
    }
    update_buff() {
        this.buff_duration--;
        if (this.buff_duration <= 0)
            this.remove_buff();
    }
    equal(other) {
        if (other.type == this.type && other.owner == this.owner)
            return true;
        return false;
    }
    add_buff() {
        let copy = false
        buffs.forEach(i => {
            if (this.equal(i)) {
                if (i.buff_duration < 6000)
                    i.buff_duration += this.buff_duration;
                copy = true;
            }
        })
        if (!copy)
            buffs.push(this);
    }
}