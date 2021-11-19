let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");
console.log("Window\n", "width =", cnv.width, "height =", cnv.height);
let fps = 300;

import { Polygon, Point, random_rgb, to_radians } from "./lib.js"

class Ship {
    poly;
    angle = 0;
    current_direction = 0;
    rot_speed = 0;
    accel = 0;
    constructor(poly, scale) {
        this.poly = poly;
        poly.scale(scale);
        poly.rotate(-90);
    }
    left() {
        this.rot_speed = 300;
    }
    right() {
        this.rot_speed = -300;
    }
    no_spin() {
        this.rot_speed = 0;
    }
    accerate() {
        if (this.accel < 300 && this.accel >= 0) {
            if (this.accel == 0) {
                this.accel = 10;
            }
            this.accel *= 4;
        }

    }
    decelerate() {
        if (this.accel > 15)
            this.accel -= 3;
    }
    break() {
        if (this.accel > 0)
            this.accel -= 10;
        if (this.accel < 0)
            this.accel = 0;

    }
    input_manage() {
        let go_left = key_pressed.some(i => i == 'q');
        let go_right = key_pressed.some(i => i == 'd');


        if (go_left && go_right || (!go_left && !go_right)) {
            this.no_spin();
        }
        else {
            if (go_left)
                this.left();
            if (go_right)
                this.right();
        }

        if (key_pressed.some(i => i == 'z')) {
            this.accerate();
        }
        else
            this.decelerate();
        if (key_pressed.some(i => i == 's')) {
            this.break();
        }

    }
    updatePos(dt) {
        this.input_manage();
        var rot = this.rot_speed * dt;
        this.current_direction = (this.current_direction + rot) % 360;
        let O = this.poly.Barycenter;
        let new_p = new Point(O.x + (this.accel * dt), O.y + (this.accel * dt));
        new_p.rotate_point(O, -90 + this.current_direction);
        this.teleport(new_p.x, new_p.y);
        this.poly.rotate(rot - 90);
    }
    teleport(x, y) {
        this.poly.teleport(x, y);
    }
    move(x, y) {
        this.poly.move(x, y);
    }
    draw(ctx) {
        this.poly.draw(ctx);
    }
}

let ship = new Ship(new Polygon([new Point(0, 0), new Point(-3, 5), new Point(0, 3), new Point(3, 5)]), 10);
ship.teleport(cnv.width / 2, cnv.height / 2);
ship.poly.Color = random_rgb();

let key_pressed = [];

function keydown_callback(event) {
    console.log(event.key);
    // if (!key_pressed.some(i=>event.key == i)) {
    key_pressed.push(event.key);
    // }
}
function keyup_callback(event) {
    for (let index = key_pressed.indexOf(event.key); index != -1; index = key_pressed.indexOf(event.key)) {
        key_pressed.splice(index, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ship.draw(ctx);
}

function update() {
    draw();
    ship.updatePos(1 / fps);
    console.log(key_pressed);
}

addEventListener("keypress", keydown_callback);
addEventListener("keyup", keyup_callback);
setInterval(update, 1000 / fps);


