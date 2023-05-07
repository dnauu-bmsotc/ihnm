class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class MaterialDot {
    constructor(x, y, mass, element) {
        this.position = new Point(x, y);
        this.velocity = new Point(0, 0);
        this.forces = new Point(0, 0);
        this.mass = mass;
        this.element = element;
    }
}

const display = {
    rect: {
        left: -50,
        top: -50,
        right: 100,
        bottom: 100,
    },
    dots: [],
    active: false,
    ns: "http://www.w3.org/2000/svg",
    gravity: 2 * 10 ** (-6),
}

function randomInt(min, max) {
    return min + Math.trunc((max - min) * Math.random());
}

function randomFloat(min, max) {
    return min + (max - min) * Math.random();
}

function randomMaterialDot(maxradius) {
    const element = document.createElementNS(display.ns, "circle");

    const radius = randomFloat(0, maxradius);
    const angle = randomFloat(0, 2 * Math.PI);

    const minMass = 1;
    const maxMass = 100;

    const dot = new MaterialDot(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        minMass + Math.pow(Math.random(), 8) * (maxMass - minMass),
        element,
    );

    dot.velocity.x = randomFloat(-0.002, +0.002);
    dot.velocity.y = randomFloat(-0.002, +0.002);

    element.setAttributeNS(null, "fill", "white");
    element.setAttributeNS(null, "cx", dot.position.x);
    element.setAttributeNS(null, "cy", dot.position.y);
    element.setAttributeNS(null, "r", 0.1 + Math.sqrt(dot.mass / maxMass) / 2);
    element.setAttributeNS(null, "opacity", (maxMass/2 + dot.mass) / (maxMass/2 + maxMass));
    element.setAttributeNS(null, "stroke-width", "0");
    document.getElementById("dots").appendChild(element);

    return dot;
}

function lawOfGravity(d1, d2) {
    const xDistance = d2.position.x - d1.position.x;
    const yDistance = d2.position.y - d1.position.y;

    const distance = 1 + Math.sqrt(xDistance ** 2 + yDistance ** 2);
    const angle = Math.atan2(yDistance, xDistance);
    const force = display.gravity * d1.mass * d2.mass / (distance ** 2);

    d1.forces.x += force * Math.cos(angle);
    d1.forces.y += force * Math.sin(angle);

    d2.forces.x += force * Math.cos(angle + Math.PI);
    d2.forces.y += force * Math.sin(angle + Math.PI);
}

function animateFrame() {
    const timestamp = performance.now();
    const dt = timestamp - display.previousTimestamp;
    display.previousTimestamp = timestamp;

    for (let dot of display.dots) {
        dot.forces.x = 0;
        dot.forces.y = 0;
    }

    for (let dot1 of display.dots) {
        for (let dot2 of display.dots) {
            if (dot1 !== dot2) {
                lawOfGravity(dot1, dot2);
            }
        }
    }

    for (let dot of display.dots) {
        dot.velocity.x += dot.forces.x / dot.mass * dt;
        dot.velocity.y += dot.forces.y / dot.mass * dt;

        dot.position.x += dot.velocity.x * dt;
        dot.position.y += dot.velocity.y * dt;

        dot.element.setAttributeNS(null, "cx", dot.position.x);
        dot.element.setAttributeNS(null, "cy", dot.position.y);
    }

    if (display.active) {
        requestAnimationFrame(animateFrame);
    }
}

function restart(n, radius) {
    document.getElementById("dots").innerHTML = "";
    display.dots = [];

    for (let i = 0; i < n; i++) {
        display.dots.push(randomMaterialDot(radius));
    }

    if (!display.active) {
        requestAnimationFrame(animateFrame);
    }

    display.active = true;
    display.previousTimestamp = performance.now();
}

window.addEventListener("load", (event) => {
    restart(20, 30);
});