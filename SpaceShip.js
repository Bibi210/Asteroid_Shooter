import { Polygon, Point, random_rgb, to_radians } from "./lib.js"
import { CENTER, HEIGHT, key_pressed, WIDTH, bullet_points, bullets, buffs, shield_points, truster_points } from "./main.js"

let BULLET_LIFETIME = 300;
export class Object extends Polygon {
    current_direction = 0;
    rot_speed = 0;
    accel = new Point(0, 0);
    speed = new Point(0, 0);
    frottement_rate = 1;
    accel_rate = 0;
    constructor(Shape, scale, color) {
        super(JSON.parse(JSON.stringify(Shape)), color);
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
        let dx = WIDTH + this.Size * 2;
        let dy = HEIGHT + this.Size * 2;

        if (this.Barycenter.x < -this.Size)
            this.move(dx, 0);

        if (this.Barycenter.x > WIDTH + this.Size)
            this.move(-dx, 0);

        if (this.Barycenter.y < -this.Size)
            this.move(0, dy);

        if (this.Barycenter.y > HEIGHT + this.Size)
            this.move(0, -dy);
    }

    forward_vector(k) {
        let rad_current_angle = to_radians(this.current_direction);
        let accel_x = k * Math.cos(rad_current_angle);
        let accel_y = k * -Math.sin(rad_current_angle);
        return new Point(accel_x, accel_y);
    }
}

export class Bullet extends Object {
    bullets_duration = BULLET_LIFETIME;
    constructor(type, speed, scale, player) {
        let shape = JSON.parse(JSON.stringify(bullet_points[type]));
        super(shape, scale);
        this.speed = JSON.parse(JSON.stringify(speed));
        this.owner = player;
    }
    update() {
        this.bullets_duration--;
        this.updatePos();
    }
    get_dir() {
        return new Point(this.speed.x + this.Barycenter.x, this.speed.y + this.Barycenter.y);
    }
}



export class Ship extends Object {
    constructor(ship_points, scale, keys, color) {
        super(JSON.parse(JSON.stringify(ship_points)), scale, color);
        this.controls = keys;

        this.current_direction = 90;

        this.accel = new Point(0, 0);
        this.speed = new Point(0, 0);
        this.frottement_rate = 0.9988;
        this.accel_rate = 0.003 * 2;

        this.cooling = 50;
        this.bullets_size = 5;
        this.shield = true;
        this.shield_poly = new Object(shield_points, scale * 7, this.Color);

        this.truster_poly = new Object(truster_points, 10);

        this.truster_on = false;
    }
    left() {
        this.rot_speed = 0.8;
    }
    right() {
        this.rot_speed = -0.8;
    }
    no_spin() {
        this.rot_speed = 0;
    }
    break() {
        this.speed.x *= this.frottement_rate / 1.005;
        this.speed.y *= this.frottement_rate / 1.005;
    }
    forward() {
        if (Math.abs(this.speed.x) + Math.abs(this.speed.y) < 3) {
            this.speed = this.speed.add(this.forward_vector(this.accel_rate));
        }
        this.truster_on = true;
    }
    shoot() {
        let bullet_speed = this.forward_vector(2).add(this.speed);
        let new_bullet = new Bullet(0, bullet_speed, this.bullets_size, this);
        new_bullet.teleport(this.Start_Point.x, this.Start_Point.y);
        new_bullet.Color = this.Color;
        let index = bullets.length - 1;
        for (; index >= 0 && (bullets[index].Color != this.Color); index--) {
        }
        if (index == -1 || BULLET_LIFETIME - bullets[index].bullets_duration > this.cooling)
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
        this.shield_poly.teleport(this.Barycenter.x, this.Barycenter.y);

        let truster_pos = this.Barycenter.add(this.forward_vector(-4));
        this.truster_poly.teleport(truster_pos.x, truster_pos.y);
        this.truster_poly.rotate(this.rot_speed);

        this.input_manage();
        super.updatePos();
    }
    draw(ctx) {
        if (this.shield)
            this.shield_poly.draw(ctx);
        if (this.truster_on) {
            this.truster_poly.Color = random_rgb();
            this.truster_poly.draw(ctx);
            this.truster_on = false;
        }
        super.draw(ctx);
    }
    Collide(OtherPoly) {
        if (this.shield)
            return this.shield_poly.Collide(OtherPoly);
        else
            return super.Collide(OtherPoly);
    }
}
