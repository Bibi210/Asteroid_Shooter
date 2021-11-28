import { probability, gen_poly_concave, Point, Rand_Between, random_rgb, Object, to_radians } from "./Geometrics.js";
import { asteroids, CENTER, HEIGHT, WIDTH, buffs } from "./main.js";

const CONCAVE = 1;

let LVL_MAX = 4;
const MAX_SPEED = 0.5;
const MIN_SPEED = 0.1;

const MAX_SIZE = 300;
const MIN_SIZE = 80;

const DISPERSION = 160;

const COLOR = [
    "rgb(255,255,255)",
    "#f48c06",
    "#dc2f02",
    "#9d0208",
];

export class Asteroid extends Object {
    buff = -1;
    constructor(pos, dir, side_count, max_size, lvl, mode) {
        let poly = gen_poly_concave(pos.x, pos.y, side_count, max_size);
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

export function better_direction(speed, from, to) {
    let a = get_angle(from, to);
    let d = rand_angle_from_dispersion((a - to_radians(DISPERSION / 2) % to_radians(360)), DISPERSION);
    let p = new Point(speed * Math.sin(d), speed * Math.cos(d));
    return p;
}

export function get_angle(A, O) {
    let angle = (to_radians(360) - Math.atan2(A.y - O.y, A.x - O.x)) % to_radians(360);
    return angle
}

function rand_angle_from_dispersion(min, dispersion) {
    let a = to_radians(Rand_Between(0, dispersion)) + to_radians(270);
    return (min + a);
}

export function compute_asteroid_tot() {
    let tot = 0
    asteroids.forEach(asteroid => {
        tot += asteroid.lvl;
    });
    return tot;
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

export function get_lvl_max() {
    return LVL_MAX;
}

export function set_lvl_max(v) {
    LVL_MAX = v;
}
export function closest_asteroid(point) {
    let closest_distance = asteroids[0].Barycenter.distance(point);
    let rock = undefined;
    asteroids.forEach(element => {
        if (element.Point_List.some(pt =>
            pt.x <= WIDTH && pt.x >= 0 && pt.y <= HEIGHT && pt.y >= 0
        )) {
            let elm_distance = element.Barycenter.distance(point);
            if (elm_distance <= closest_distance) {
                closest_distance = elm_distance;
                rock = element;
            }
        }
    });
    return rock;
}




export const buff_type = {
    Gatling: 0,
    Big_Bullet: 1,
    Shield: 2,
    Bonus_life: 3,
}
export class Buff {
    buff_duration = 0;
    constructor(type, player) {
        this.type = type;
        this.owner = player;
        this.apply_buff(this.owner);
    }
    apply_buff() {
        // Buff Effects
        switch (this.type) {
            case buff_type.Gatling:
                this.buff_duration = 1200;
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
            case buff_type.Bonus_life:
                if (this.owner.life < 7)
                    this.owner.life++;
                break;
            default:
                break;
        }
    }
    remove_buff() {
        //Delete Buff Effects
        switch (this.type) {
            case buff_type.Gatling:
                this.owner.cooling = 100;
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
        // Add Buff to Game
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