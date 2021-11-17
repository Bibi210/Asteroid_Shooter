export function Rand_Between(min, max) {
    return Math.random() * (max - min) + min;
}
export function random_rgb() {
    return "rgb(" + (Math.random() * 255) + "," + (Math.random() * 255) + "," + (Math.random() * 255) + ")";
}
export class Point {
    constructor(x, y, color = "rgb(0,0,0)") {
        this.x = x;
        this.y = y;
        this.color = color;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, true);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    angle(Other = new Point(0, 0)) {
        return Math.atan2(this.x - Other.x, this.y - Other.y) * 180 / Math.PI;
    }
    distance(other) {
        return Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2));
    }
}

export class Segment {
    constructor(Point_A, Point_B) {
        this.A = Point_A;
        this.B = Point_B;
    }
    cw(c) {
        return (this.B.x - this.A.x) * (c.y - this.A.y) - (this.B.y - this.A.y) * (c.x - this.A.x);
    }
    cross(other_seg) {
        if (this.cw(other_seg.A) == 0 &&
            this.cw(other_seg.B) == 0 &&
            other_seg.cw(this.A) == 0 &&
            other_seg.cw(this.B) == 0)
            return false; //Cas Seg Identiques

        let this_side_A = this.cw(other_seg.A) < 0 ? -1 : 1;
        let this_side_B = this.cw(other_seg.B) < 0 ? -1 : 1;
        let other_side_A = other_seg.cw(this.A) < 0 ? -1 : 1;
        let other_side_B = other_seg.cw(this.B) < 0 ? -1 : 1;

        if (other_side_A != other_side_B && this_side_A != this_side_B)
            return true;

        return false;
    }
    Rey_Cross_Seg(Point) { //Utile pour le point in Polygon
        return ((this.A.y > Point.y) != (this.B.y > Point.y))
            && (Point.x < (this.B.x - this.A.x) * (Point.y - this.A.y) / (this.B.y - this.A.y) + this.A.x);
    }
}

export class Polygon {
    constructor(Point_List, Size = 0, Vx = 0, Vy = 0, color = "rgb(0,0,0)") {
        this.Point_List = Point_List;
        this.Start_Point = Point_List[0];
        this.Vx = Vx;
        this.Vy = Vy;
        this.Size = Size;
        this.Barycenter = new Point(0, 0);

        let nb = 0;
        this.Point_List.forEach(element => {
            this.Barycenter.x += element.x
            this.Barycenter.y += element.y
            nb++;
        });

        this.Barycenter.x /= nb;
        this.Barycenter.y /= nb;
        this.Color = color;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.Start_Point.x, this.Start_Point.y);
        for (let index = 1; index < this.Point_List.length; index++)
            ctx.lineTo(this.Point_List[index].x, this.Point_List[index].y);

        ctx.lineTo(this.Start_Point.x, this.Start_Point.y);
        ctx.strokeStyle = this.Color;
        ctx.stroke();
        ctx.closePath();
        this.updatePos();
    }
    Point_inside(A) {
        let inside = false;
        for (let i = 0, j = this.Point_List.length - 1; i < this.Point_List.length; j = i++) {
            let current_seg = new Segment(this.Point_List[i], this.Point_List[j]);
            let intersect = current_seg.Rey_Cross_Seg(A);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    Collide(OtherPoly) {
        if (this.Size && OtherPoly.Size)
            if (this.Barycenter.distance(OtherPoly.Barycenter) > this.Size + OtherPoly.Size)
                return false;

        //! Case Poly Totally Inside the other
        for (let index = 0; index < this.Point_List.length; index++) {
            const elem = this.Point_List[index];
            if (OtherPoly.Point_inside(elem))
                return true;
        }

        for (let index = 0; index < OtherPoly.Point_List.length; index++) {
            const element = OtherPoly.Point_List[index];
            if (this.Point_inside(element))
                return true;
        }

        for (let i = 0, j = this.Point_List.length - 1; i < this.Point_List.length; j = i++) {
            let tmp_seg_A = new Segment(this.Point_List[i], this.Point_List[j]);
            for (let a = 0, b = OtherPoly.Point_List.length - 1; a < OtherPoly.Point_List.length; b = a++) {
                let tmp_seg_B = new Segment(OtherPoly.Point_List[a], OtherPoly.Point_List[b]);
                if (tmp_seg_A.cross(tmp_seg_B))
                    return true;
            }
        }
        return false;
    }

    isPoly_Colliding(others_ls) {
        return others_ls.some(i => i.Collide(this));
    }

    move(x, y) {
        this.Point_List.forEach(elem => {
            elem.x += x;
            elem.y += y
        });
        this.Barycenter.x += x
        this.Barycenter.y += y
    }
    updatePos() {
        this.move(this.Vx, this.Vy);
    }
}

export class Rectangle extends Polygon {
    constructor(X, w, h) {
        super([X, new Point(X.x + w, X.y), new Point(X.x + w, X.y + h), new Point(X.x, X.y + h)]);
        this.w = w;
        this.h = h;
    }
    gen_point() {
        let x = Rand_Between(this.Start_Point.x, this.Start_Point.x + this.w);
        let y = Rand_Between(this.Start_Point.y, this.Start_Point.y + this.h);
        return new Point(x, y);
    }
}

export function gen_poly_concave(x, y, nb_side, size_max) {
    let Rect = new Rectangle(new Point(x, y), size_max, size_max);
    let points = [];
    for (const _ of Array.from({ length: nb_side }))
        points.push(Rect.gen_point());

    let center = new Polygon(points).Barycenter;
    points.sort((A, B) => center.angle(A) - center.angle(B));

  /*   for (let i = 0, j = this.Point_List.length - 1; i < this.Point_List.length; j = i++) {
        const Point_A = this.Point_List[j];
        const Point_B = this.Point_List[i];
        let angle_between_pt = Point_B.angle(Point_A);
    } */


    let output_poly = new Polygon(points, size_max);
    return output_poly;
}

export function gen_poly(nb, size_max, SideMax) {
    let x, y, side, tmp_poly;
    let output = [];
    for (let nb_test = 0; (output.length < nb) && (nb_test < 150); nb_test++) {
        x = Rand_Between(0, cnv.width - size_max);
        y = Rand_Between(0, cnv.height - size_max);
        side = Rand_Between(5, SideMax);
        tmp_poly = gen_poly_concave(x, y, side, size_max);
        if (!isPoly_Colliding(tmp_poly, output)) {
            output.push(tmp_poly);
            nb_test = 0;
        }
    }
    return output;
}