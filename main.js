import { draw_asteroids, LVL_MAX, move_asteroids, spawn_asteroid } from "./asteroid.js";
import { Point, Rectangle, random_rgb } from "./lib.js";
import { draw_particules, move_particules } from "./particule.js";
import { Ship } from "./SpaceShip.js"

let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");

let FPS = 300;

export let WIDTH = cnv.width;
export let HEIGHT = cnv.height;
export let CENTER = new Point(WIDTH / 2, HEIGHT / 2)

let ASTEROID_COUNT = 10;

let asteroids = [];
let particules = [];
let ship_points = [new Point(0, 0), new Point(-3, 5), new Point(0, 3), new Point(3, 5)];
export let bullet_points = [new Rectangle(new Point(0, 0), 1, 1).Point_List];

let ship_A_keys = ['z', 'q', 's', 'd', ' '];
let ship_B_keys = ['o', 'k', 'l', 'm', 'Enter'];


export let key_pressed = [];
export let bullets = [];
let ships = [];

let ship_A = new Ship(ship_points, 5, ship_A_keys);
let ship_B = new Ship(ship_points, 5, ship_B_keys);


function init() {
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        asteroids.push(spawn_asteroid(LVL_MAX - 1))
    }

    ship_A.move(cnv.width / 2, cnv.height / 2);
    ship_A.Color = random_rgb();
    ships.push(ship_A);

    ship_B.move(cnv.width / 2, cnv.height / 2);
    ship_B.Color = random_rgb();
    ships.push(ship_B);
}


function keydown_callback(event) {
    if (!key_pressed.some(i => i == event.key))
        key_pressed.push(event.key);
}
function keyup_callback(event) {
    key_pressed = key_pressed.filter(i => i != event.key);
}

function draw_elements() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    draw_asteroids(asteroids, ctx);
    bullets.forEach(element => element.draw(ctx));
    ships.forEach(element => element.draw(ctx));

    if (particules.length)
        draw_particules(particules, ctx)
}

function update_pos() {
    move_asteroids(asteroids);
    move_particules(particules);
    ships.forEach(element => element.update_ship());
    for (let index = 0; index < bullets.length; index++) {
        bullets[index].update();
        if (!bullets[index].bullets_duration)
            bullets.splice(index, 1);
    }
}

function process_collisions() {
    bullets.forEach(bullet => {
        for (let index = 0; index < asteroids.length; index++) {
            const rock = asteroids[index];
            if (bullet.Collide(rock)) {
                bullets.splice(bullets.indexOf(bullet), 1);
                asteroids.splice(index, 1);
                // Particules
            }
        }
    });
}

function game() {
    update_pos();
    process_collisions();
    draw_elements();
}

addEventListener("keypress", keydown_callback);
addEventListener("keyup", keyup_callback);

init();
setInterval(game, 1000 / FPS);

