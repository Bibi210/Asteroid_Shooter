import { spawn_asteroid } from "./asteroid.js";

let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");

export let WIDTH = cnv.width
export let HEIGHT = cnv.height

let pc = spawn_asteroid(cnv.width/2, cnv.height/2);

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    update_pos();

    pc.poly.draw(ctx);
}

function update_pos() {
    pc.move_asteroid()
}

setInterval(draw, 10);