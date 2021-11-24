import { Polygon, Point, random_rgb, to_radians } from "./lib.js"
import { CENTER, HEIGHT, key_pressed, WIDTH, bullet_points, bullets, buffs, shield_points } from "./main.js"

let BULLET_LIFETIME = 300;
let Gatling = 0;
let Big_Bullet = 1;
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
    bullets_duration = BULLET_LIFETIME;
    constructor(type, speed, scale, player) {
        let shape = JSON.parse(JSON.stringify(bullet_points[type]));
        super(shape, scale);
        this.speed = JSON.parse(JSON.stringify(speed));
        this.id = player
    }
    update() {
        this.bullets_duration--;
        this.updatePos();
    }
}



export class Buff {
    buff_duration = 0;
    constructor(type, player) {
        this.type = type;
        this.owner = player;
        this.apply_buff(this.owner);
    }
    apply_buff() {
        switch (this.type) {
            case Gatling:
                this.buff_duration = 3000;
                this.owner.cooling = 15;
                break;
            case Big_Bullet:
                this.buff_duration = 3000;
                this.owner.bullets_size = 20;
            default:
                break;
        }
    }
    remove_buff() {
        switch (this.type) {
            case Gatling:
                this.owner.cooling = 50;
                break;
            case Big_Bullet:
                this.owner.bullets_size = 5;
                break
            default:
                break;
        }
    }
    update_buff() {
        this.buff_duration--;
        if (this.buff_duration <= 0)
            this.remove_buff();
    }
}



export class Ship extends Object {
    constructor(ship_points, scale, keys, color) {
        super(JSON.parse(JSON.stringify(ship_points)), scale, color);
        this.controls = keys;


        this.accel = new Point(0, 0);
        this.speed = new Point(0, 0);
        this.frottement_rate = 0.9988;
        this.accel_rate = 0.003 * 2;

        this.cooling = 50;
        this.bullets_size = 5;
        this.shield = true;
        this.shield_poly = new Object(shield_points, scale * 5, "rgb(0,255,0)");
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
    shoot(player) {
        let rad_current_angle = to_radians(+90 + this.current_direction);
        let accel_x = 2 * Math.cos(rad_current_angle);
        let accel_y = 2 * -Math.sin(rad_current_angle);
        let new_bullet = new Bullet(0, new Point(accel_x + this.speed.x, accel_y + this.speed.y), this.bullets_size, player);
        new_bullet.move(this.Start_Point.x, this.Start_Point.y);
        new_bullet.Color = this.Color;

        let index = bullets.length - 1;
        for (; index >= 0 && (bullets[index].Color != this.Color); index--) {
        }
        if (index == -1 || BULLET_LIFETIME - bullets[index].bullets_duration > this.cooling)
            bullets.push(new_bullet);
    }
    input_manage(player) {
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
            this.shoot(player);
        if (key_pressed.some(i => i == 'x')) {
            let buff = new Buff(Big_Bullet, this);
            buffs.push(buff);
        }
    }
    update_ship(player) {
        if (this.shield) {
            this.shield_poly.teleport(this.Barycenter.x, this.Barycenter.y);
        }
        this.input_manage(player);
        super.updatePos();
    }
    draw(ctx) {
        if (this.shield)
            this.shield_poly.draw(ctx);
        super.draw(ctx);
    }
    Collide(OtherPoly) {
        if (this.shield)
            return this.shield_poly.Collide(OtherPoly);
        return super.Collide(OtherPoly);
    }
}
