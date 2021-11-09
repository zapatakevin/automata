class Node {

    constructor({id, connections, accept = false, start = false}) {
        this.id = id;
        this.connections = connections;
        this.accept = accept;
        this.start = start;
        this.selfConnections = [];

        this.diameter = 60;
        this.radius = this.diameter * 0.5;
    }

    addSelfConnection(cost) {
        this.selfConnections.push(new SelfConnection('S' + this.id + this.selfConnections.length, cost, this));
    }

    show() {
        for (const selfCon of this.selfConnections) {
            selfCon.show();
        }
        fill(255);

        stroke(0);
        strokeWeight(1);
        circle(this.x, this.y, this.diameter);

        if (this.accept) {
            circle(this.x, this.y, this.diameter - 8);
        }
        if (this.start) {
            fill(0);
            triangle(this.x - this.radius - 25, this.y - 15, this.x - this.radius - 25, this.y + 15, this.x - this.radius, this.y);
        }

        noStroke();
        fill(0);
        text(this.id, this.x, this.y);
    }

    updatePossition(x, y) {
        if (dist(x, y, this.x, this.y) < this.radius && (!grabbingNode || grabbingNode == this.id )) {
            grabbingNode = this.id;
            this.x = x; this.y = y;
            for (const selfCon of this.selfConnections) {
                selfCon.updatePossition();
            }
            return;
        }
        for (const selfCon of this.selfConnections) {
            selfCon.updateRotation(x, y);
        }
    }

}