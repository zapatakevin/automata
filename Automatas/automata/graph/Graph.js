class Graph {

    constructor(nodes) {
        this.nodes = nodes;
        this.connections = [];
        this.angle = TWO_PI / this.nodes.length;
        this.radius = width * 0.5 - 100;

        for (let i = 0; i < this.nodes.length; i++) {
            let x = (this.radius * sin(i * -this.angle - HALF_PI)) + width * 0.5;
            let y = (this.radius * cos(i * -this.angle - HALF_PI)) + height * 0.5;
            this.nodes[i].x = x;
            this.nodes[i].y = y;

            for (let connection of this.nodes[i].connections) {
                let a = this.nodes[i].id;
                let b = connection.id;
                let found = this.connections.find(conn => ((conn.a == a.id && conn.b == b.id) || (conn.a == b.id && conn.b == a.id)));
                if (!found) {
                    this.connections.push({
                        a: {id: a},  b: {id: b},
                        cost: connection.cost
                    });
                    if (a === b) {
                        this.nodes[i].addSelfConnection(connection.cost);
                    }
                }
            }

        }

        for (let connection of this.connections) {
            let na = this.nodes.find(n => n.id == connection.a.id);
            let nb = this.nodes.find(n => n.id == connection.b.id);
            connection.a.x = na.x;
            connection.a.y = na.y;
            connection.b.x = nb.x;
            connection.b.y = nb.y;
        }
    }

    show() {
        for (let connection of this.connections) {
            let a = this.nodes.find(n => n.id == connection.a.id);
            let b = this.nodes.find(n => n.id == connection.b.id);

            if (a.id !== b.id) {
                stroke(0);
                strokeWeight(1);
                line(a.x, a.y, b.x, b.y);

                push();
                let angle = atan2(a.y - b.y, a.x - b.x);
                translate(b.x, b.y);
                rotate(angle - HALF_PI);
                triangle(-4, a.radius + 8, 4, a.radius + 8, 0, a.radius);
                pop();

                let mX = (a.x + b.x) * 0.5;
                let mY = (a.y + b.y) * 0.5;

                let tX =  -cos(HALF_PI - angle) * 15;
                let tY =  sin(HALF_PI - angle) * 15;

                strokeWeight(0);
                fill(0);
                text(connection.cost,  mX + tX, mY + tY);
            }
        }

        for (let node of this.nodes) { node.show(); }
    }

    updatePossitions(x, y) {
        for (let node of this.nodes) { node.updatePossition(x, y); }
    }

}
