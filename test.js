import { spawn_asteroid } from "./asteroid.js";

let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;

export let WIDTH = cnv.width
export let HEIGHT = cnv.height
let ctx = cnv.getContext("2d");

let pc = spawn_asteroid(cnv.width, cnv.height);

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    update_pos();

    pc.poly.draw(ctx);
}

function update_pos() {
    pc.move_asteroid()
}

setInterval(draw, 10);