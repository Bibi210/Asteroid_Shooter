import { Point, random_rgb, Object, Rectangle, to_radians } from "./Geometrics.js"
import { key_pressed, bullets } from "./main.js"

let BULLET_LIFETIME = 300;

let truster_points = [new Point(0, 0), new Point(1, 0), new Point(0.5, 1)];
let bullet_points = [new Rectangle(new Point(0, 0), 1, 1).Point_List];
let shield_points = [];
for (let index = 0; index < 359; index++) {
    let posX = 0 - (1 * Math.cos(to_radians(index)));
    let posY = 0 - (1 * Math.sin(to_radians(index)));
    shield_points.push(new Point(posX, posY));
}

export class Bullet extends Object {
    bullets_duration = BULLET_LIFETIME;
    constructor(type, speed, scale, player) {
        let shape = JSON.parse(JSON.stringify(bullet_points[type]));
        super(shape, scale);
        this.speed = JSON.parse(JSON.stringify(speed));
        this.owner = player;
        this.rot_speed = 1;
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

        this.accel = new Point(0, 0); // Acceleration to add to speed
        this.speed = new Point(0, 0); // Ship Velocity
        this.frottement_rate = 0.9988;
        this.accel_rate = 0.006;


        this.cooling = 100; // Interval between bullets
        this.bullets_size = 5; // Bullets_scaling

        this.shield = true; // shield_on_off
        this.shield_poly = new Object(shield_points, scale * 7, this.Color);

        this.truster_poly = new Object(truster_points, 10);
        this.truster_on = false;
    }
    //Turn left
    left() {
        this.rot_speed = 0.8;
    }
    //Turn right
    right() {
        this.rot_speed = -0.8;
    }
    break() {
        this.speed.x *= this.frottement_rate / 1.005;
        this.speed.y *= this.frottement_rate / 1.005;
    }
    // Accelerate
    forward() {
        if (Math.abs(this.speed.x) + Math.abs(this.speed.y) < 3) {
            this.speed = this.speed.add(this.forward_vector(this.accel_rate));
        }
        this.truster_on = true;
    }
    shoot() {
        let bullet_base_accel = this.forward_vector(2).add(this.speed);
        let new_bullet = new Bullet(0, bullet_base_accel, this.bullets_size, this);
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
            this.rot_speed = 0;

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
    //Ship Drawing Method
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
