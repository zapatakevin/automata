class SelfConnection {

    constructor(id, cost, parent) {
        this.id = id;
        this.cost = cost;
        this.parent = parent;
        this.angle = atan2(height * 0.5 - parent.y, parent.x - width * 0.5);
        this.offset = 40;

        this.diameter = 45;
        this.radius = this.diameter * 0.5;
        this.textPosOffset = 75;

        this.updateAnglePossitions();
    }

    show() {
        switch (this.type) {
            case 'explored': fill(0,128,0); break;
            case 'frontier': fill(192,96,0); break;
            default: fill(255); break;
        }

        stroke(0);
        strokeWeight(1);
        noFill();
        circle(this.x, this.y, this.diameter);

        noStroke();
        fill(0);
        text(this.cost, this.textX , this.textY);

        push();
        translate(this.x, this.y);
        rotate(-this.angle + PI);
        triangle(5, -17, 9, -25, 15, -17);
        pop();
    }

    updateAnglePossitions() {
        const pCos = cos(this.angle);
        const pSin = -sin(this.angle);
        this.x = pCos * this.offset + this.parent.x;
        this.y = pSin * this.offset + this.parent.y;
        this.textX = pCos * this.textPosOffset + this.parent.x;
        this.textY = pSin * this.textPosOffset + this.parent.y;
    }

    updateRotation(x, y) {
        if (dist(x, y, this.x, this.y) < this.radius && (!grabbingNode || grabbingNode == this.id )) {
            grabbingNode = this.id;
            this.angle = atan2(this.parent.y - y, x - this.parent.x);
            this.updateAnglePossitions();
            return;
        }
    }

    updatePossition() {
        if (grabbingNode == this.parent.id) {
            this.updateAnglePossitions();
        }
    }

}