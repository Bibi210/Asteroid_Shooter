import { draw_asteroids, fill_asteroids, get_lvl_max, move_asteroids, set_lvl_max, spawn_asteroid, spawn_on_colision } from "./asteroid.js";
import { arrow, main_menu, set_offset } from "./game.js";
import { Point, Rectangle, random_rgb, to_radians } from "./lib.js";
import { draw_particules, move_particules, spawn_particules } from "./particule.js";
import { Player } from "./player.js";

let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");

let FPS = 300;
let STATE = 0;
let DIFFICULTY_RATIO = 2000;

export let WIDTH = cnv.width;
export let HEIGHT = cnv.height;
export let CENTER = new Point(WIDTH / 2, HEIGHT / 2);

let ASTEROID_COUNT = 0;
let LVL = 0;

let asteroids = [];
let particules = [];
let ship_points = [new Point(0, 0), new Point(-3, 5), new Point(0, 3), new Point(3, 5)];
export let bullet_points = [new Rectangle(new Point(0, 0), 1, 1).Point_List];
export let shield_points = [];
for (let index = 0; index < 359; index++) {
    let posX = 0 - (1 * Math.cos(to_radians(index)));
    let posY = 0 - (1 * Math.sin(to_radians(index)));
    shield_points.push(new Point(posX, posY));
}

let ship_A_keys = ['z', 'q', 's', 'd', ' '];
let ship_B_keys = ['o', 'k', 'l', 'm', 'Enter'];

export let key_pressed = [];
export let bullets = [];
export let buffs = [];
let players = [];
let fragments = [];

function init() {
    ASTEROID_COUNT = 10;
    LVL = 2;

    asteroids = fill_asteroids(ASTEROID_COUNT, LVL);
}

function play_menu() {
    STATE = 0;
    ASTEROID_COUNT = 10;
    LVL = 2;

    asteroids = fill_asteroids(ASTEROID_COUNT, LVL);
}

function keydown_callback(event) {
    handle_state(event.key);
    if (!key_pressed.some(i => i == event.key))
        key_pressed.push(event.key);
}
function keyup_callback(event) {
    key_pressed = key_pressed.filter(i => i != event.key);
}

function handle_state(key) {
    if (key == '0' && STATE != 0) {
        play_menu();
    }
    if (!STATE) {
        players = [];
        particules = [];
        fragments = [];
        LVL = 1;
        if (key == '1') {
            STATE = 1;

            ASTEROID_COUNT = 3;

            let playerA = new Player(ship_points, 5, ship_A_keys, 3, 1, random_rgb());
            players.push(playerA);
            asteroids = fill_asteroids(ASTEROID_COUNT, LVL);
        }
        else if (key == '2') {
            STATE = 2;

            ASTEROID_COUNT = 10;

            let playerA = new Player(ship_points, 5, ship_A_keys, 3, 1, 'rgb(45,255,45)');
            let playerB = new Player(ship_points, 5, ship_B_keys, 3, 2, 'rgb(255,45,45)');
            players.push(playerA);
            players.push(playerB);
            asteroids = fill_asteroids(ASTEROID_COUNT, LVL)
        }
        else if (key == '3') {
            STATE = 3;

            ASTEROID_COUNT = 5;

            let playerA = new Player(ship_points, 5, ship_A_keys, 3, 1, 'rgb(45,255,45)');
            playerA.teleport(0.95 * WIDTH, 0.10 * HEIGHT);
            let playerB = new Player(ship_points, 5, ship_B_keys, 3, 2, 'rgb(255,45,45)');
            playerB.teleport(0.05 * WIDTH, 0.90 * HEIGHT);
            players.push(playerA);
            players.push(playerB);
            asteroids = fill_asteroids(ASTEROID_COUNT, LVL);
        }
        else if (key == 'e') {
            set_lvl_max(2);
            set_offset(0.2);
        }
        else if (key == 'm') {
            set_lvl_max(4);
            set_offset(0.35);
        }
        else if (key == 'h') {
            set_lvl_max(6);
            set_offset(0.5);
        }
    }
}

function draw_elements() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 3;

    let init_pos = 24;
    let offset = 65;

    draw_asteroids(asteroids, ctx);
    if (!STATE) {
        main_menu(ctx);
        arrow(ctx);
    }
    else {
        bullets.forEach(element => element.draw(ctx));
        players.forEach(element => element.draw(ctx));
        fragments.forEach(element => element[0].draw(ctx));

        if (particules.length)
            draw_particules(particules, ctx);

        players.forEach(player => {
            player.draw_score(init_pos, offset, ctx)
            init_pos += init_pos + offset
        });
    }
}

function update_pos() {
    move_asteroids(asteroids);
    move_particules(particules);
    players.forEach(element => element.update_player());
    fragments.forEach(element => element[0].updatePos());
}

function process_collisions() {
    for (let j = 0; j < asteroids.length; j++) {
        let asteroid = asteroids[j];
        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i];
            if (bullets[i].Collide(asteroid)) {
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                particules = particules.concat(spawn_particules(25, bullet.Barycenter, bullet.Barycenter, bullet.get_dir(), asteroid.Color, asteroid.lvl));
                asteroids = asteroids.concat(spawn_on_colision(asteroid, bullet));
                players.forEach(player => {
                    if (player.id == bullet.id && STATE != 3)
                        player.score += 100 * (get_lvl_max() - asteroid.lvl);
                });
                i--;
                j--;
                break;
            }
        }
        players.forEach(player => {
            if (player.Collide(asteroid)) {
                asteroids.splice(j, 1);
                let new_dir = new Point(player.speed.x + player.Barycenter.x, player.speed.y + player.Barycenter.y);
                particules = particules.concat(spawn_particules(25, asteroid.Barycenter, new_dir, player.Barycenter, asteroid.Color, asteroid.lvl));
                j--;
                if (player.shield) {
                    player.shield = false;
                }
                else {
                    player.life--;
                    fragments = fragments.concat(player.get_fragments(asteroid));
                    player.speed = new Point(0, 0);
                    player.shield = true;
                    player.teleport(CENTER.x, CENTER.y);
                }
            }
        });
    }
}

function update() {
    let tot_score = 0;
    players.forEach(player => {
        tot_score += player.score;
    });
    let difficulty = Math.floor(tot_score / DIFFICULTY_RATIO)
    if (asteroids.length < ASTEROID_COUNT + difficulty) {
        asteroids.push(spawn_asteroid(get_lvl_max() - LVL))
    }
    for (let index = 0; index < bullets.length; index++) {
        bullets[index].update();
        if (!bullets[index].bullets_duration)
            bullets.splice(index, 1);
    }

    for (let index = 0; index < buffs.length; index++) {
        buffs[index].update_buff();
        // console.log(buffs[index].buff_duration);
        if (!buffs[index].buff_duration)
            buffs.splice(index, 1);
    }
    for (let index = 0; index < players.length; index++) {
        if (!players[index].life) {
            players.splice(index, 1);
        }
    }
    if (!players.length && STATE != 0) {
        play_menu();
    }

    for (let i = 0; i < fragments.length; i++) {
        if (!fragments[i][1]) {
            fragments.splice(i, 1);
        }
        else {
            fragments[i][1] -= 1;
        }
    }
}

function game() {
    update_pos();
    process_collisions();
    draw_elements();
    update();
}

addEventListener("keypress", keydown_callback);
addEventListener("keyup", keyup_callback);

init();
setInterval(game, 1000 / FPS);

//TODO Thruster
//TODO clean code
//TODO Music