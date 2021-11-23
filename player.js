import { CENTER } from "./main.js";
import { Ship } from "./SpaceShip.js"

export class Player extends Ship {
    constructor(ship_points, scale, keys, life_count, id, color = 'rgb(255,255,255)') {
        super(ship_points, scale, keys, color)
        this.move(CENTER.x, CENTER.y);
        this.life = life_count;
        this.score = 0;
        this.id = id;
    }

    update_player() {
        this.update_ship(this.id)
    }

    draw_score(init, offset, ctx) {
        ctx.font = '24px Courier New';
        ctx.fillStyle = 'rgb(255,255,255)';
        // need to modify input text based on score
        ctx.fillText('P' + this.id.toString() + ' score: ' + this.score.toString(), 2, init);

        let x_init = 6
        let x_offset = 30
        // need offset and count
        for (let i = 0; i < this.life; i++) {
            ctx.fillText('❤️', x_init, init + offset/2);
            x_init += x_offset;
        }
    }
}