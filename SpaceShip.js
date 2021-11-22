let cnv = document.getElementById("Canvas");
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;
let ctx = cnv.getContext("2d");
console.log("Window\n", "width =", cnv.width, "height =", cnv.height);
let fps = 300;

import { Polygon, Point, random_rgb, to_radians, Rectangle } from "./lib.js"

class Object extends Polygon {
    current_direction = 0;
    rot_speed = 0;
    accel = new Point(0, 0);
    speed = new Point(0, 0);
    frottement_rate = 1;
    accel_rate = 0;
    constructor(Point_List, scale) {
        super(Point_List);
        this.scale(scale);
    }
    updatePos() {
        this.current_direction = (this.current_direction + this.rot_speed) % 360;
        this.rotate(this.rot_speed);

        if (this.speed.x)
            this.speed.x *= this.frottement_rate;
        if (this.speed.y)
            this.speed.y *= this.frottement_rate;
        this.move(this.speed.x, this.speed.y);

        if (this.Barycenter.x > cnv.width)
            this.move(-cnv.width, 0);
        if (this.Barycenter.x < 0)
            this.move(cnv.width, 0);

        if (this.Barycenter.y > cnv.height)
            this.move(0, -cnv.height);
        if (this.Barycenter.y < 0)
            this.move(0, cnv.height);
    }
}

class Bullet extends Object {
    bullets_duration = 300;
    constructor(type, speed, scale) {
        let shape = JSON.parse(JSON.stringify(bullet_points[type]));
        super(shape, scale);
        this.speed = JSON.parse(JSON.stringify(speed));
    }
    update() {
        this.bullets_duration--;
        this.updatePos();
    }
}


class Ship extends Object {
    constructor(ship_points, scale, keys) {
        super(JSON.parse(JSON.stringify(ship_points)), scale);
        this.accel = new Point(0, 0);
        this.speed = new Point(0, 0);
        this.frottement_rate = 0.9988;
        this.accel_rate = 0.002;
        this.controls = keys;
    }
    left() {
        this.rot_speed = 0.5;
    }
    right() {
        this.rot_speed = -0.5;
    }
    no_spin() {
        this.rot_speed = 0;
    }
    break() {
        this.speed.x *= this.frottement_rate / 1.005;
        this.speed.y *= this.frottement_rate / 1.005;
    }
    forward() {
        let rad_current_angle = to_radians(+90 + this.current_direction);
        let accel_x = this.accel_rate * Math.cos(rad_current_angle);
        let accel_y = this.accel_rate * -Math.sin(rad_current_angle);
        if (Math.abs(this.speed.x) + Math.abs(this.speed.y) < 3)
            this.speed = this.speed.add(new Point(accel_x, accel_y));

    }
    shoot() {
        let rad_current_angle = to_radians(+90 + this.current_direction);
        let accel_x = 1 * Math.cos(rad_current_angle);
        let accel_y = 1 * -Math.sin(rad_current_angle);
        let new_bullet = new Bullet(0, new Point(accel_x + this.speed.x, accel_y + this.speed.y), 5);
        new_bullet.move(this.Start_Point.x, this.Start_Point.y);
        new_bullet.Color = random_rgb();
        if (bullets.length && bullets[bullets.length - 1].bullets_duration < 250)
            bullets.push(new_bullet);

        if (!bullets.length)
            bullets.push(new_bullet);
    }
    input_manage() {
        let go_left = key_pressed.some(i => i == this.controls[1]);
        let go_right = key_pressed.some(i => i == this.controls[3]);
        if (go_left && go_right || (!go_left && !go_right))
            this.no_spin();
        else {
            if (go_left)
                this.left();
            if (go_right)
                this.right();
        }
        if (key_pressed.some(i => i == this.controls[0]))
            this.forward();
        if (key_pressed.some(i => i == this.controls[2]))
            this.break();
        if (key_pressed.some(i => i == this.controls[4]))
            this.shoot();
    }
    update_ship() {
        this.input_manage();
        super.updatePos();
    }
}

function keydown_callback(event) {
    if (!key_pressed.some(i => i == event.key))
        key_pressed.push(event.key);
}
function keyup_callback(event) {
    key_pressed = key_pressed.filter(i => i != event.key);
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    bullets.forEach(element => element.draw(ctx));
    ships.forEach(element => element.draw(ctx));
}

function update() {
    draw();
    ships.forEach(element => element.update_ship());
    for (let index = 0; index < bullets.length; index++) {
        bullets[index].update();
        if (!bullets[index].bullets_duration)
            bullets.splice(index, 1);
    }
    console.log(key_pressed);
}

let ship_points = [new Point(0, 0), new Point(-3, 5), new Point(0, 3), new Point(3, 5)];
let bullet_points = [new Rectangle(new Point(0, 0), 1, 1).Point_List];

let ship_A_keys = ['z', 'q', 's', 'd', ' '];
let ship_B_keys = ['o', 'k', 'l', 'm', 'Enter'];


let key_pressed = [];
let bullets = [];
let ships = [];

let ship_A = new Ship(ship_points, 5, ship_A_keys);
ship_A.move(cnv.width / 2, cnv.height / 2);
ship_A.Color = random_rgb();
ships.push(ship_A);

let ship_B = new Ship(ship_points, 5, ship_B_keys);
ship_B.move(cnv.width / 2, cnv.height / 2);
ship_B.Color = random_rgb();
ships.push(ship_B);

//TODO Add Ownership to bullets

addEventListener("keypress", keydown_callback);
addEventListener("keyup", keyup_callback);
setInterval(update, 1000 / fps);


