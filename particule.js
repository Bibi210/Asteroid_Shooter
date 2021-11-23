import { better_direction, LVL_MAX } from "./asteroid.js";
import { Point, Rand_Between } from "./lib.js"

let MAX_LIFETIME = 150;
let MIN_LIFETIME = 100;

export let MAX_PARTICULES = 10;
export let MIN_PARTICULES = 5;


export class Particule extends Point {
    constructor(pos, dir, color, size) {
        super(pos.x, pos.y, size)
        this.lifetime = Math.floor(Rand_Between(MIN_LIFETIME, MAX_LIFETIME + 1))
        this.direction = better_direction(Math.random(), dir);
        this.color = color;
    }

    move_particule() {
        this.x += this.direction.x;
        this.y += this.direction.y;
    }
}

export function spawn_particules(particule_count, pos, dir, color, size) {
    let particules = [];
    for (let i = 0; i < particule_count; i++) {
        particules.push(new Particule(pos, dir, color, 1 / (LVL_MAX - size) * 2 + 2));
    }
    return particules;
}

export function draw_particules(particules, ctx) {
    let to_delete = []

    for (let i = 0; i < particules.length; i++) {
        particules[i].draw(ctx);
        particules[i].lifetime -= 1;
        if (particules[i].lifetime < 0)
            to_delete.push(i);
    }

    to_delete.forEach(idx => {
        particules.splice(idx, 1);
    });
}

export function move_particules(particules) {
    particules.forEach(particule => {
        particule.move_particule()
    });
}