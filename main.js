import { Buff, draw_asteroids, fill_asteroids, get_lvl_max, move_asteroids, set_lvl_max, spawn_asteroid, spawn_on_colision, compute_asteroid_tot } from "./asteroid.js";
import { arrow, main_menu, set_offset } from "./menu_interface.js";
import { Point, probability, Rectangle } from "./Geometrics.js";
import { draw_particules, move_particules, spawn_particules } from "./particule.js";
import { Player } from "./player.js";

const cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
const ctx = cnv.getContext("2d");

const FPS = 300;
let Mode = 0;
const DIFFICULTY_RATIO = 5000;

export let WIDTH = cnv.width;
export let HEIGHT = cnv.height;
export let CENTER = new Point(WIDTH / 2, HEIGHT / 2);

const STAR_COUNT = 200;
const STAR_COLOR = "rgba(255, 214, 10, 0.5)"
const STAR_COLOR_SHINNING = "rgba(255, 214, 10, 1)"
let ASTEROID_COUNT = 0;
let LVL = 0;

let frame = 0;
let demo = false;

const background_bounds = new Rectangle(new Point(0, 0), WIDTH, HEIGHT);
let background = [];
for (let i = 0; i < STAR_COUNT; i++) {
    let star = background_bounds.gen_point();
    star.color = STAR_COLOR;
    star.size = 2;
    background.push(star);
}

const ship_shape = [new Point(0, 0), new Point(-3, 5), new Point(0, 3), new Point(3, 5)];


const ship_A_keys = ['z', 'q', 's', 'd', ' ']; // Player_A commands
const ship_B_keys = ['o', 'k', 'l', 'm', 'Enter']; // Player_B commands


export let key_pressed = []; // Real Time Inputs 
export let bullets = []; // All bullets in game
export let buffs = []; // All buff in game
export let asteroids = []; // All asteroids in game
let particules = []; // All particules in game
let players = [];
let fragments = [];

//* Game_Mode Choice /
function Game_Mode(key) {
    if (key == '0' && STATE != 0)
        Mode = 0;

    if (!Mode) {
        players = [];
        particules = [];
        fragments = [];
        bullets = [];
        LVL = 1;
        if (key == '1') {
            Mode = 1;

            ASTEROID_COUNT = 3;

            let playerA = new Player(ship_shape, 5, ship_A_keys, 3, 1, 'rgb(45,255,45)');
            players.push(playerA);
            asteroids = fill_asteroids(ASTEROID_COUNT, LVL);
        }
        else if (key == '2') {
            Mode = 2;

            ASTEROID_COUNT = 5;

            let playerA = new Player(ship_shape, 5, ship_A_keys, 3, 1, 'rgb(45,255,45)');
            let playerB = new Player(ship_shape, 5, ship_B_keys, 3, 2, 'rgb(255,45,45)');
            playerA.move(-WIDTH / 4, 0);
            playerB.move(WIDTH / 4, 0);
            players.push(playerA);
            players.push(playerB);
            asteroids = fill_asteroids(ASTEROID_COUNT, LVL)
        }
        else if (key == '3') {
            Mode = 3;

            ASTEROID_COUNT = 5;

            let playerA = new Player(ship_shape, 5, ship_A_keys, 3, 1, 'rgb(45,255,45)');
            let playerB = new Player(ship_shape, 5, ship_B_keys, 3, 2, 'rgb(255,45,45)');
            playerA.move(-WIDTH / 4, 0);
            playerB.move(WIDTH / 4, 0);
            players.push(playerA);
            players.push(playerB);
            asteroids = fill_asteroids(ASTEROID_COUNT, LVL);
        }
        else if (key == 'e') {
            set_lvl_max(2);
            set_offset(0.2);
        }
        else if (key == 'm') {
            set_lvl_max(3);
            set_offset(0.35);
        }
        else if (key == 'h') {
            set_lvl_max(4);
            set_offset(0.5);
        }
        else if (key == 'd')
            demo = !demo;

    }
}
//* Game_Mode Choice /


function draw_elements() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 3;
    let init_pos = 24;
    let offset = 120;

    for (let i = 0; i < background.length; i++) {
        let is_shinning = probability(50);
        if (is_shinning) {
            background[i].color = STAR_COLOR_SHINNING;
        } else {
            background[i].color = STAR_COLOR;
        }
        background[i].draw(ctx);
    }
    if (!Mode) {
        main_menu(ctx, demo);
        arrow(ctx);
    }
    else {
        draw_asteroids(asteroids, ctx);
        bullets.forEach(element => element.draw(ctx));
        players.forEach(element => element.draw(ctx));
        fragments.forEach(element => element[0].draw(ctx));

        if (particules.length)
            draw_particules(particules, ctx);

        players.forEach(player => {
            player.draw_buff(buffs, init_pos, offset, ctx)
            player.draw_score(init_pos, offset, ctx)
            init_pos += init_pos + offset
        });
    }
}

//Back Ground Movements
function move_background() {
    background.forEach(s => {
        s.x -= players[0].speed.x * 2;
        s.y -= players[0].speed.y * 2;

        if (s.x > WIDTH + s.size)
            s.x = -s.size;
        if (s.x < -s.size)
            s.x = WIDTH + s.size;
        if (s.y > HEIGHT + s.size)
            s.y = -s.size;
        if (s.y < -s.size)
            s.y = HEIGHT + s.size;
    });
}

// All Pve Collisions Handling + Concequences
function pve_collisions() {

    // Asteroids
    for (let j = 0; j < asteroids.length; j++) {
        let asteroid = asteroids[j];

        // Asteroid X Bullet
        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i];
            if (bullet.Collide(asteroid)) {
                particules = particules.concat(spawn_particules(25, bullet.Barycenter, bullet.Barycenter, bullet.get_dir(), asteroid.Color, asteroid.lvl));
                asteroids = asteroids.concat(spawn_on_colision(asteroid, bullet));
                players.forEach(player => {
                    if (player == bullet.owner && Mode != 3) {
                        player.score += 100 * (get_lvl_max() - asteroid.lvl);
                        new Buff(asteroid.buff, player).add_buff();
                    }
                });
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
            }
        }
        // Asteroid X Player
        players.forEach(player => {
            if (player.Collide(asteroid)) {
                asteroids.splice(j, 1);
                let new_dir = new Point(player.speed.x + player.Barycenter.x, player.speed.y + player.Barycenter.y);
                particules = particules.concat(spawn_particules(25, asteroid.Barycenter, new_dir, player.Barycenter, asteroid.Color, asteroid.lvl));
                if (player.life_lost()) {
                    fragments = fragments.concat(player.get_fragments());
                    player.speed = new Point(0, 0);
                    player.teleport(CENTER.x, CENTER.y);
                }
                new Buff(asteroid.buff, player).add_buff();
            }
        });
    }
}


// All Pvp Collisions Handling + Concequences
function pvp_collisions() {
    if (Mode == 3)
        // Player 
        players.forEach(player => {
            // Player X Enemy_Bullet
            for (let index = 0; index < bullets.length; index++) {
                let bullet = bullets[index];
                if (player.Collide(bullet) && player != bullet.owner) {
                    particules = particules.concat(spawn_particules(25, bullet.Barycenter, bullet.Barycenter, bullet.get_dir(), player.Color, player.Size));
                    bullets.splice(index, 1);
                    if (player.life_lost()) {
                        fragments = fragments.concat(player.get_fragments());
                        player.speed = new Point(0, 0);
                        player.teleport(CENTER.x, CENTER.y);
                        players.forEach(player => {
                            if (player == bullet.owner) {
                                player.score += 1000;
                            }
                        });
                    }
                }
            }
            // Player X Other_Player
            players.forEach(other => {
                if (other != player) {
                    if (player.Collide(other)) {
                        let new_dir = new Point(player.speed.x + player.Barycenter.x, player.speed.y + player.Barycenter.y);
                        particules = particules.concat(spawn_particules(25, other.Barycenter, new_dir, player.Barycenter, player.Color, player.Size));
                        if (player.life_lost()) {
                            fragments = fragments.concat(player.get_fragments());
                            player.speed = new Point(0, 0);
                            player.teleport(CENTER.x, CENTER.y);
                            player.score += 1000;
                        }
                    }
                }
            });
        })
}


function update_elements() {
    if (Mode)
        move_background();
    move_asteroids(asteroids);
    move_particules(particules);
    players.forEach(element => element.update_player());
    fragments.forEach(element => element[0].updatePos());
}

//* All Gameplay related calculations *//
function game_logic() {
    let total_score = 0;
    players.forEach(player => {
        total_score += player.score;
    });
    let difficulty = Math.floor(total_score / DIFFICULTY_RATIO)
    if (compute_asteroid_tot() < ASTEROID_COUNT + difficulty)
        asteroids.push(spawn_asteroid(get_lvl_max() - LVL))

    //* Object with lifetime_Gestion *//

    // Bullets Remove
    for (let index = 0; index < bullets.length; index++) {
        bullets[index].update();
        if (bullets[index].bullets_duration <= 0)
            bullets.splice(index, 1);
    }

    // Buff Remove
    for (let index = 0; index < buffs.length; index++) {
        buffs[index].update_buff();
        if (buffs[index].buff_duration <= 0)
            buffs.splice(index, 1);
    }

    // Player Remove
    for (let index = 0; index < players.length; index++)
        if (players[index].life <= 0)
            players.splice(index, 1);

    // Player Death Anim Remove
    for (let i = 0; i < fragments.length; i++) {
        if (!fragments[i][1])
            fragments.splice(i, 1);
        else
            fragments[i][1] -= 1;
    }
    //* Object with lifetime_Gestion *//

    //Game Reset
    if ((!players.length && Mode != 0) || (Mode == 3 && players.length == 1))
        Mode = 0;

    //Bot Mode
    if (demo)
        players.forEach(player => player.bot());

}
//* All Gameplay related calculations *//


/* Key Handling */
function keydown_callback(event) {
    let key = event.key;
    if (key == 'p')
        if (!sound_on)
            music_go();
        else
            music_pause();
    Game_Mode(key);
    if (!key_pressed.some(i => i == key))
        key_pressed.push(key);
}

function keyup_callback(event) {
    let key = event.key
    key_pressed = key_pressed.filter(i => i != key);
}
addEventListener("keypress", keydown_callback);
addEventListener("keyup", keyup_callback);
/* Key Handling */


/* Music Related */
let game_sound;
let sound_on = false;
if (probability(50))
    game_sound = new Audio('./Audio/Title_Song/shreksophone.mp3');
else
    game_sound = new Audio('./Audio/Title_Song/Darude.mp3');
function music_go() {
    game_sound.loop;
    game_sound.play();
    sound_on = true;
}

function music_pause() {
    game_sound.pause();
    sound_on = false
}
game_sound.addEventListener('ended', () => {
    game_sound.currentTime = 0;
    game_sound.pause();
    game_sound.play();
});
addEventListener("mouseout", music_pause);
/* Music Related */


function mainloop() {
    frame++;
    update_elements();
    if (frame % 4 == 0) {
        pve_collisions();
        pvp_collisions();
    }
    draw_elements();
    game_logic();

}
setInterval(mainloop, 1000 / FPS);