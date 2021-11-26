import { better_direction, closest_asteroid, get_angle } from "./asteroid.js";
import { Point, to_degrees,probability } from "./lib.js";
import { CENTER } from "./main.js";
import { Ship, Object } from "./SpaceShip.js"

export class Player extends Ship {
    constructor(ship_points, scale, keys, life_count, id, color = 'rgb(255,255,255)') {
        super(ship_points, scale, keys, color)
        this.move(CENTER.x, CENTER.y);
        this.life = life_count;
        this.score = 0;
        this.id = id;
    }

    update_player() {
        this.update_ship();
    }

    life_lost() {
        if (this.shield)
            return this.shield = false;
        else
            return this.life--;
    }

    draw_score(init, offset, ctx) {
        ctx.font = '24px Courier New';
        ctx.fillStyle = this.Color;
        ctx.fillText('P' + this.id.toString() + ' score: ' + this.score.toString(), 2, init);

        let x_init = 6
        let x_offset = 30
        for (let i = 0; i < this.life; i++) {
            ctx.fillText('❤️', x_init, init + offset / 2);
            x_init += x_offset;
        }
    }

    get_fragments() {
        let fragments = []

        for (let i = 0, j = this.Point_List.length - 1; i < this.Point_List.length; j = i++) {
            let f = new Object([this.Point_List[i], this.Point_List[j]], 0.1, this.Color);
            let dir = new Point(this.speed.x + this.Barycenter.x, this.speed.y + this.Barycenter.y);
            f.speed = better_direction(0.5, this.Barycenter, dir);
            fragments.push([f, 200]);
        }

        return fragments
    }

    bot() {
        let close_asteroid = closest_asteroid(this.Start_Point);
        /*            let segm = new Segment(close_asteroid.Barycenter, this.Start_Point);
                   segm.Color = random_rgb();
                   segm.draw(ctx); */

        let angle_with_asteroid = to_degrees(get_angle(close_asteroid.Barycenter, this.Start_Point));
        let delta = Math.abs(this.current_direction - angle_with_asteroid) % 360;

        if (delta <= 2 && delta >= -2) {
            this.shoot();
            if (probability(30)) {
                this.forward();
            }
        }
        else {
            if (delta >= 181) {
                this.rotate(-0.8);
                this.current_direction -= 0.8;
            }
            if (delta <= 181 && delta >= 179) {
                if (probability(30)) {
                    this.forward();
                }
            }
            else if (delta <= 179) {
                this.rotate(0.8);
                this.current_direction += 0.8;
            }
        }
    }
}