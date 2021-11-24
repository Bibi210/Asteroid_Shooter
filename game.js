import { CENTER } from "./main.js";

let offset = 260;

export function main_menu(ctx) {
    ctx.font = '86px Courier New';
    ctx.fillStyle = 'rgb(255,45,45)';
    ctx.fillText('Trigo Pain', CENTER.x - (64 * 12), CENTER.y - (64 * 4));
    ctx.font = '32px Courier New';
    ctx.fillText('1 - 1 Player vs Asteroids', CENTER.x - (64 * 10), CENTER.y - (64 * 2));
    ctx.fillText('2 - 2 Players vs Asteroids', CENTER.x - (64 * 10), CENTER.y);
    ctx.fillText('3 - Player vs Player', CENTER.x - (64 * 10), CENTER.y + (64 * 2));
    ctx.fillStyle = 'rgb(65,65,255)';
    ctx.fillText('E - Easy', CENTER.x + (64 * 4), CENTER.y - (64 * 2));
    ctx.fillText('M - Medium', CENTER.x + (64 * 4), CENTER.y);
    ctx.fillText('H - Hard', CENTER.x + (64 * 4), CENTER.y + (64 * 2));
}

export function arrow(ctx) {
    ctx.beginPath();
    ctx.moveTo(CENTER.x + (64 * 8), CENTER.y - (16 * 8.7) + offset);
    ctx.lineTo(CENTER.x + (64 * 8) + 40, CENTER.y - (16 * 8.7) - 15 + offset);
    ctx.lineTo(CENTER.x + (64 * 8) + 40, CENTER.y - (16 * 8.7) + 15 + offset);
    ctx.fillStyle = "rgb(45,200,45)"
    ctx.fill();
}

export function set_offset(v) {
    offset = v;
}