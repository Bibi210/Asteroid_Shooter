import { closest_asteroid, Buff, draw_asteroids, fill_asteroids, get_lvl_max, move_asteroids, set_lvl_max, spawn_asteroid, spawn_on_colision, get_angle } from "./asteroid.js";
import { arrow, main_menu, set_offset } from "./game.js";
import { Point, probability, Rectangle, to_radians } from "./lib.js";
import { draw_particules, move_particules, spawn_particules } from "./particule.js";
import { Player } from "./player.js";

let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");

let FPS = 300;
let STATE = 0;
let DIFFICULTY_RATIO = 5000;

export let WIDTH = cnv.width;
export let HEIGHT = cnv.height;
export let CENTER = new Point(WIDTH / 2, HEIGHT / 2);

let STAR_COUNT = 200;
let STAR_COLOR = "rgba(255, 214, 10, 0.5)"
let STAR_COLOR_SHINNING = "rgba(255, 214, 10, 1)"
let ASTEROID_COUNT = 0;
let LVL = 0;

let frame = 0;
let demo = true;

let background_bounds = new Rectangle(new Point(0, 0), WIDTH, HEIGHT);
let background = [];
for (let i = 0; i < STAR_COUNT; i++) {
    let star = background_bounds.gen_point();
    star.color = STAR_COLOR;
    star.size = 2;
    background.push(star);
}

export let asteroids = [];
let particules = [];
let ship_points = [new Point(0, 0), new Point(-3, 5), new Point(0, 3), new Point(3, 5)];
export let bullet_points = [new Rectangle(new Point(0, 0), 1, 1).Point_List];
export let shield_points = [];
for (let index = 0; index < 359; index++) {
    let posX = 0 - (1 * Math.cos(to_radians(index)));
    let posY = 0 - (1 * Math.sin(to_radians(index)));
    shield_points.push(new Point(posX, posY));
}
export let truster_points = [new Point(0, 0), new Point(1, 0), new Point(0.5, 1)];

let ship_A_keys = ['z', 'q', 's', 'd', ' '];
let ship_B_keys = ['o', 'k', 'l', 'm', 'Enter'];

let game_sound;
if (probability(50))
    game_sound = new Audio('./Audio/In_Game/shreksophone.mp3');
else
    game_sound = new Audio('./Audio/In_Game/Darude.mp3');

let sound_on = false;

export let key_pressed = [];
export let bullets = [];
export let buffs = [];
let players = [];
let fragments = [];

function init() {
    ASTEROID_COUNT = 10;
    LVL = 1;

    asteroids = fill_asteroids(ASTEROID_COUNT, LVL);
}

function keydown_callback(event) {
    let key = event.key;
    if (key == 'p')
        if (!sound_on)
            music_go();
        else
            music_pause();
    handle_state(key);
    if (!key_pressed.some(i => i == key))
        key_pressed.push(key);
}
function keyup_callback(event) {
    let key = event.key
    key_pressed = key_pressed.filter(i => i != key);
}

function move_background() {
    background.forEach(s => {
        s.x -= players[0].speed.x * 2
        s.y -= players[0].speed.y * 2

        if (s.x > WIDTH + s.size)
            s.x = -s.size
        if (s.x < -s.size)
            s.x = WIDTH + s.size
        if (s.y > HEIGHT + s.size)
            s.y = -s.size
        if (s.y < -s.size)
            s.y = HEIGHT + s.size
    });
}

function handle_state(key) {
    if (key == '0' && STATE != 0) {
        STATE = 0;
    }
    if (!STATE) {
        players = [];
        particules = [];
        fragments = [];
        bullets = [];
        LVL = 1;
        if (key == '1') {
            STATE = 1;

            ASTEROID_COUNT = 3;

            let playerA = new Player(ship_points, 5, ship_A_keys, 3, 1, 'rgb(45,255,45)');
            players.push(playerA);
            asteroids = fill_asteroids(ASTEROID_COUNT, LVL);
        }
        else if (key == '2') {
            STATE = 2;

            ASTEROID_COUNT = 5;

            let playerA = new Player(ship_points, 5, ship_A_keys, 3, 1, 'rgb(45,255,45)');
            let playerB = new Player(ship_points, 5, ship_B_keys, 3, 2, 'rgb(255,45,45)');
            playerA.move(WIDTH / 4, 0);
            playerB.move(-WIDTH / 4, 0);
            players.push(playerA);
            players.push(playerB);
            asteroids = fill_asteroids(ASTEROID_COUNT, LVL)
        }
        else if (key == '3') {
            STATE = 3;

            ASTEROID_COUNT = 5;

            let playerA = new Player(ship_points, 5, ship_A_keys, 3, 1, 'rgb(45,255,45)');
            let playerB = new Player(ship_points, 5, ship_B_keys, 3, 2, 'rgb(255,45,45)');
            playerA.move(WIDTH / 4, 0);
            playerB.move(-WIDTH / 4, 0);
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
    }
}

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
    if (!STATE) {
        main_menu(ctx);
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

function update_pos() {
    if (STATE)
        move_background();
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
            if (bullet.Collide(asteroid)) {
                particules = particules.concat(spawn_particules(25, bullet.Barycenter, bullet.Barycenter, bullet.get_dir(), asteroid.Color, asteroid.lvl));
                asteroids = asteroids.concat(spawn_on_colision(asteroid, bullet));
                players.forEach(player => {
                    if (player == bullet.owner && STATE != 3) {
                        player.score += 100 * (get_lvl_max() - asteroid.lvl);
                        new Buff(asteroid.buff, player).add_buff();
                    }
                });
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
            }
        }
        players.forEach(player => {
            if (player.Collide(asteroid)) {
                asteroids.splice(j, 1);
                j--;
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
    if (STATE == 3)
        players.forEach(player => {
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

function update() {
    let tot_score = 0;
    players.forEach(player => {
        tot_score += player.score;
    });
    let difficulty = Math.floor(tot_score / DIFFICULTY_RATIO)
    if (compute_asteroid_tot() < ASTEROID_COUNT + difficulty) {
        asteroids.push(spawn_asteroid(get_lvl_max() - LVL))
    }
    for (let index = 0; index < bullets.length; index++) {
        bullets[index].update();
        if (bullets[index].bullets_duration <= 0)
            bullets.splice(index, 1);
    }

    for (let index = 0; index < buffs.length; index++) {
        buffs[index].update_buff();
        if (buffs[index].buff_duration <= 0)
            buffs.splice(index, 1);
    }

    for (let index = 0; index < players.length; index++) {
        if (players[index].life <= 0) {
            players.splice(index, 1);
        }
    }
    if ((!players.length && STATE != 0) || (STATE == 3 && players.length == 1)) {
        STATE = 0;
    }

    for (let i = 0; i < fragments.length; i++) {
        if (!fragments[i][1]) {
            fragments.splice(i, 1);
        }
        else {
            fragments[i][1] -= 1;
        }
    }
    if (demo)
        players.forEach(player => player.bot());

}

function compute_asteroid_tot() {
    let tot = 0
    asteroids.forEach(asteroid => {
        tot += asteroid.lvl;
    });
    return tot;
}

function game() {
    frame++;
    update_pos();
    if (frame % 4 == 0)
        process_collisions();

    draw_elements();
    update();

}

function music_go() {
    game_sound.loop;
    game_sound.play();
    sound_on = true;
}

function music_pause() {
    game_sound.pause();
    sound_on = false
}

addEventListener("keypress", keydown_callback);
addEventListener("keyup", keyup_callback);
addEventListener("mouseout", music_pause);
game_sound.addEventListener('ended', () => {
    game_sound.currentTime = 0;
    game_sound.pause();
    game_sound.play();
});



init();
setInterval(game, 1000 / FPS);

//TODO clean code
//TODO Music