import { better_direction, buff_type } from "./asteroid.js";
import { Point } from "./lib.js";
import { CENTER, HEIGHT, WIDTH } from "./main.js";
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
            ctx.fillText('❤️', x_init, init + offset/ 3);
            x_init += x_offset;
        }
    }

    draw_buff(buffs, init, offset, ctx) {
        ctx.font = '24px Courier New';
        ctx.fillStyle = this.Color;
        buffs.forEach(buff => {
            if (buff.owner == this) {
                if (buff.type == buff_type.Gatling) {
                    ctx.fillText('Gatling: ' + (buff.buff_duration / 10).toString(), 0.20 * WIDTH, init + (0.04 * HEIGHT));
                }

                if (buff.type == buff_type.Big_Bullet) {
                    ctx.fillText('Big bullet: true', 0.20 * WIDTH, init + (0.08 * HEIGHT));
                }
            }
        });
        if (this.shield) {
            ctx.fillText('Shield: true', 0.20 * WIDTH, init);
        }
        else {
            ctx.fillText('Shield: false', 0.20 * WIDTH, init);
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
}