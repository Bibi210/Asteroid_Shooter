import { HEIGHT, WIDTH } from "./main.js";

let offset = 0.5;

export function main_menu(ctx) {
    ctx.font = '86px Courier New';
    ctx.fillStyle = 'rgb(255,45,45)';
    ctx.fillText('Trigo Pain', 0.10 * WIDTH, 0.20 * HEIGHT);
    ctx.font = '32px Courier New';
    ctx.fillText('1 - 1 Player vs Asteroids', 0.15 * WIDTH, 0.35 * HEIGHT);
    ctx.fillText('2 - 2 Players vs Asteroids', 0.15 * WIDTH, 0.50 * HEIGHT);
    ctx.fillText('3 - Player vs Player', 0.15 * WIDTH, 0.65 * HEIGHT);
    ctx.fillStyle = 'rgb(65,65,255)';
    ctx.fillText('E - Easy', 0.70 * WIDTH, 0.35 * HEIGHT);
    ctx.fillText('M - Medium', 0.70 * WIDTH, 0.50 * HEIGHT);
    ctx.fillText('H - Hard', 0.70 * WIDTH, 0.65 * HEIGHT);
}

export function arrow(ctx) {
    ctx.beginPath();
    ctx.moveTo(0.82 * WIDTH,                0.14 * HEIGHT + offset * HEIGHT);
    ctx.lineTo(0.82 * WIDTH + 0.02 * WIDTH, 0.14 * HEIGHT + 0.015 * HEIGHT + offset * HEIGHT);
    ctx.lineTo(0.82 * WIDTH + 0.02 * WIDTH, 0.14 * HEIGHT - 0.015 * HEIGHT + offset * HEIGHT);
    ctx.fillStyle = "rgb(45,200,45)"
    ctx.fill();
}

export function set_offset(k) {
    offset = k;
}