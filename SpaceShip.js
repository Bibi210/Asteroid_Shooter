let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");

import { gen_poly_concave, Polygon } from "./lib.js"

let pc = gen_poly_concave(cnv.width / 2, cnv.height / 2, 10, 300);

let i = 1;
function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    pc.rotate(1);
    pc.scale(-0.01);
    pc.draw(ctx);
}

function update() {
    draw();
}

setInterval(update, 10);


