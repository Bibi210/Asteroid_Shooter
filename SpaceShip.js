let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");
console.log("Window\n", "width =", cnv.width, "height =", cnv.height);
let fps = 300;

import { Polygon, Point, random_rgb, to_radians } from "./lib.js"

class Ship {
    poly;
    current_direction = 0;
    rot_speed = 0;
    accel = new Point(0, 0);
    speed = new Point(0, 0);
    frottement_rate = 0.997;
    accel_rate = 0.0085;

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
    forward() {
        let rad_current_angle = to_radians(+90 + this.current_direction);
        let accel_x = this.accel_rate * Math.cos(rad_current_angle);
        let accel_y = this.accel_rate * -Math.sin(rad_current_angle);
        let new_speed = this.speed.add(new Point(accel_x, accel_y));
        this.speed = new_speed;
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
            this.forward();
        }

    }
    updatePos(dt) {
        this.input_manage();
        var rot = this.rot_speed * dt;
        this.current_direction = (this.current_direction + rot) % 360;
        this.poly.rotate(rot);

        if (this.speed.x) {
            this.speed.x *= this.frottement_rate;
        }
        if (this.speed.y) {
            this.speed.y *= this.frottement_rate;
        }

        this.move(this.speed.x, this.speed.y);

        console.log(this.speed);

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

let ship = new Ship(new Polygon([new Point(0, 0), new Point(-3, 5), new Point(0, 3), new Point(3, 5)]), 3);
ship.teleport(cnv.width / 2, cnv.height / 2);
ship.poly.Color = random_rgb();

let key_pressed = [];

function keydown_callback(event) {
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


