import { draw_asteroids, LVL_MAX, move_asteroids, spawn_asteroid, spawn_on_colision } from "./asteroid.js";
import { Point, Rectangle, random_rgb } from "./lib.js";
import { draw_particules, move_particules, spawn_particules } from "./particule.js";
import { Player } from "./player.js";
import { Ship } from "./SpaceShip.js"

let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");

let FPS = 300;

export let WIDTH = cnv.width;
export let HEIGHT = cnv.height;
export let CENTER = new Point(WIDTH / 2, HEIGHT / 2);

let highscore;

let ASTEROID_COUNT = 5;

let asteroids = [];
let particules = [];
let ship_points = [new Point(0, 0), new Point(-3, 5), new Point(0, 3), new Point(3, 5)];
export let bullet_points = [new Rectangle(new Point(0, 0), 1, 1).Point_List];

let ship_A_keys = ['z', 'q', 's', 'd', ' '];
let ship_B_keys = ['o', 'k', 'l', 'm', 'Enter'];


export let key_pressed = [];
export let bullets = [];
let players = []

let playerA = new Player(ship_points, 5, ship_A_keys, 3, 1, random_rgb());
let playerB = new Player(ship_points, 5, ship_B_keys, 3, 2, random_rgb());
// let ship_A = new Ship(ship_points, 5, ship_A_keys);
// let ship_B = new Ship(ship_points, 5, ship_B_keys);


function init() {
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        asteroids.push(spawn_asteroid(LVL_MAX - 1))
    }

    players.push(playerA);
    players.push(playerB);
    // ship_A.move(cnv.width / 2, cnv.height / 2);
    // ship_A.Color = random_rgb();
    // ships.push(ship_A);

    // ship_B.move(cnv.width / 2, cnv.height / 2);
    // ship_B.Color = random_rgb();
    // ships.push(ship_B);
}

console.log(players);


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
    players.forEach(element => element.draw(ctx));

    if (particules.length)
        draw_particules(particules, ctx);

    let init = 24;
    let offset = 65;
    players.forEach(player => {
        player.draw_score(init, offset, ctx)
        init += init + offset
    });
}

function update_pos() {
    move_asteroids(asteroids);
    move_particules(particules);
    players.forEach(element => element.update_player());
    for (let index = 0; index < bullets.length; index++) {
        bullets[index].update();
        if (!bullets[index].bullets_duration)
            bullets.splice(index, 1);
    }
}

function process_collisions() {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < asteroids.length; j++) {
            let asteroid = asteroids[j];
            let bullet = bullets[i];
            if (bullets[i].Collide(asteroid)) {
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                particules = particules.concat(spawn_particules(25, asteroid.Barycenter, bullet.Barycenter, asteroid.Color, asteroid.lvl));
                asteroids = asteroids.concat(spawn_on_colision(asteroid, bullet));
                players.forEach(player => {
                    console.log(bullet.id)
                    if (player.id == bullet.id)
                        player.score += 100 * (LVL_MAX - asteroid.lvl);
                });
                return
            }
        }
    }
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

