import { GIVEN, RANDO, spawn_asteroid, spawn_on_colision } from "./asteroid.js";
import { Point, Rand_Between } from "./lib.js";

let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");

export let WIDTH = cnv.width;
export let HEIGHT = cnv.height;
export let CENTER = new Point(WIDTH / 2, HEIGHT / 2)

let asteroids = [];

function init() {
    for (let i = 0; i < 1; i++) {
        asteroids.push(spawn_asteroid(RANDO, 4))
    }
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    update_pos();

    asteroids.forEach(asteroid => {
        asteroid.poly.draw(ctx);
    });
}

function update_pos() {
    asteroids.forEach(asteroid => {
        asteroid.move_asteroid();
    });
}

function keydown_callback(event) {
    switch (event.key) {
        case ' ':
            // Simulate collision
            spawn_on_colision(asteroids, 2);
            console.log(asteroids.length);
    }
}

init();
setInterval(draw, 10);

addEventListener("keydown", keydown_callback)
