let graph;
let grabbingNode = null;

function setup() {
    const canvas = createCanvas(...getCanvasSize());
    canvas.parent('p5canvas');
    translate(width * 0.5, height * 0.5);
    graph = new Graph([
        // new Node({id: 'A', connections: [{id: 'B', cost: 0}, {id: 'C', cost: 1}], start: true}),
        // new Node({id: 'B', connections: [{id: 'A', cost: 0}, {id: 'C', cost: 1}]}),
        // new Node({id: 'C', connections: [{id: 'A', cost: 0}, {id: 'C', cost: 1}], accept: true}),
        // new Node({id: 'D', connections: [{id: 'A', cost: 0}, {id: 'B', cost: 1}]}),
    ]);
    textAlign(CENTER, CENTER);
    // graph = new Graph([
    //     new Node({id: 'A', connections: [{id: 'B', cost: 0}]}),
    //     new Node({id: 'B', connections: []}),
    // ]);
}

function draw() {
    background(255);

    if (graph) {
        if (mouseIsPressed) { graph.updatePossitions(mouseX, mouseY); }
        else { grabbingNode = null; }
        graph.show();
    }
}

function windowResized() {
    resizeCanvas(...getCanvasSize());
}

function getCanvasSize() {
    const w = windowWidth * 0.5;
    const h = windowHeight - 60;
    return [w, h];
}
