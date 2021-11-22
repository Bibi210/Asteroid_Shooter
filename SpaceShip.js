import { Polygon, Point, random_rgb, to_radians } from "./lib.js"
import { HEIGHT, key_pressed, WIDTH, bullet_points, bullets } from "./main.js"

export class Object extends Polygon {
    current_direction = 0;
    rot_speed = 0;
    accel = new Point(0, 0);
    speed = new Point(0, 0);
    frottement_rate = 1;
    accel_rate = 0;
    constructor(Shape, scale) {
        super(Shape);
        this.scale(scale);
    }

    updatePos() {
        this.current_direction = (this.current_direction + this.rot_speed) % 360;
        this.rotate(this.rot_speed)
        if (this.speed.x)
            this.speed.x *= this.frottement_rate;
        if (this.speed.y)
            this.speed.y *= this.frottement_rate;
        this.move(this.speed.x, this.speed.y);

        this.wrap_object();
    }

    wrap_object() {
        let dx = WIDTH + this.Size;
        let dy = HEIGHT + this.Size;

        if (this.Barycenter.x < -this.Size / 2)
            this.move(dx, 0);

        if (this.Barycenter.x > WIDTH + this.Size / 2)
            this.move(-dx, 0);

        if (this.Barycenter.y < -this.Size / 2)
            this.move(0, dy);

        if (this.Barycenter.y > HEIGHT + this.Size / 2)
            this.move(0, -dy);
    }
}

export class Bullet extends Object {
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


export class Ship extends Object {
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
        new_bullet.Color = this.Color;

        let index = bullets.length - 1;
        for (; index >= 0 && (bullets[index].Color != this.Color); index--) {
        }
        if (index == -1 || bullets[index].bullets_duration < 250)
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
