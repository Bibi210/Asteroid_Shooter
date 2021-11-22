import { draw_asteroids, LVL_MAX, move_asteroids, spawn_asteroid, spawn_on_colision } from "./asteroid.js";
import { Point, Rand_Between } from "./lib.js";
import { draw_particules, MAX_PARTICULES, MIN_PARTICULES, move_particules, spawn_particules } from "./particule.js";

let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");

export let WIDTH = cnv.width;
export let HEIGHT = cnv.height;
export let CENTER = new Point(WIDTH / 2, HEIGHT / 2)

let ASTEROID_COUNT = 20;

let asteroids = [];
let particules = [];

function init() {
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        asteroids.push(spawn_asteroid(5))
    }
}

function draw_elements() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    draw_asteroids(asteroids, ctx);

    if (particules.length)
        draw_particules(particules, ctx)
}

function update_pos() {
    move_asteroids(asteroids);
    move_particules(particules);
}

function keydown_callback(event) {
    switch (event.key) {
        case ' ':
            // Simulate collision
            spawn_on_colision(asteroids, 2);
            let new_particules = spawn_particules(Math.floor(Rand_Between(MIN_PARTICULES, MAX_PARTICULES)), CENTER);
            particules = particules.concat(new_particules);
    }
}

function game() {
    update_pos();
    draw_elements();
}

init();
setInterval(game, 10);

addEventListener("keydown", keydown_callback)
