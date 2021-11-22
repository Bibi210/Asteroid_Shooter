import { rand_direction } from "./asteroid.js";
import { Point, Rand_Between } from "./lib.js"

let MAX_LIFETIME = 50;
let MIN_LIFETIME = 30;

export let MAX_PARTICULES = 10;
export let MIN_PARTICULES = 5;


export class Particule extends Point {
    constructor(pos) {
        super(pos.x, pos.y)
        this.lifetime = Math.floor(Rand_Between(MIN_LIFETIME, MAX_LIFETIME + 1))
        this.direction = rand_direction(Math.random() + 1);
    }

    move_particule() {
        this.x += this.direction.x;
        this.y += this.direction.y;
    }
}

export function spawn_particules(particule_count, pos) {
    let particules = []

    for (let i = 0; i < particule_count; i++) {
        particules.push(new Particule(pos))
    }

    return particules
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