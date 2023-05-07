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
    gravity: 10 ** (-6),
}

function randomInt(min, max) {
    return min + Math.trunc((max - min) * Math.random());
}

function randomFloat(min, max) {
    return min + (max - min) * Math.random();
}

// https://stackoverflow.com/questions/36721830
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function randomMaterialDot(maxradius, initialVelocity) {
    const element = document.createElementNS(display.ns, "circle");

    const radius = randomFloat(0, maxradius);
    const angle = randomFloat(0, 2 * Math.PI);

    const minMass = 1;
    const maxMass = 500;

    const dot = new MaterialDot(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        minMass + Math.pow(Math.random(), 8) * (maxMass - minMass),
        element,
    );

    switch (initialVelocity) {
        case "noise":
            dot.velocity.x = randomFloat(-0.012, +0.012);
            dot.velocity.y = randomFloat(-0.012, +0.012);
            break;

        case "funnel":
            const additionalAngle = Math.PI / 4 * randomFloat(-1, +1);
            const velocityAngle = angle + display.funnelBaseAngle + additionalAngle;
            const velocity = randomFloat(0, +0.03);
            dot.velocity.x = velocity * Math.cos(velocityAngle);
            dot.velocity.y = velocity * Math.sin(velocityAngle);
            break;
    
        default:
            break;
    }

    element.setAttributeNS(null, "fill", "white");
    element.setAttributeNS(null, "cx", dot.position.x);
    element.setAttributeNS(null, "cy", dot.position.y);
    element.setAttributeNS(null, "r", 0.2 + Math.sqrt(dot.mass / maxMass) / 3);
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

        display.colorFunction(dot);
        display.borderFunction(dot);
    }

    if (display.active) {
        requestAnimationFrame(animateFrame);
    }
}

function restart() {
    document.getElementById("dots").innerHTML = "";
    display.dots = [];

    const initialVelocity = document.getElementById("velocity-select").value;
    if (initialVelocity === "funnel") {
        display.funnelBaseAngle = Math.sign(randomFloat(-1, +1)) * Math.PI / 2
            + Math.PI / 4 * randomFloat(-1, +1);
    }

    const n = document.getElementById("number-select").value;
    const radius = 10 + 10 * Math.pow(n, 1/4);

    switch (document.getElementById("border-select").value) {
        case "bounce":
            display.borderFunction = dot => {
                if (dot.position.x < display.rect.left) dot.velocity.x *= -1;
                if (dot.position.x > display.rect.left + display.rect.right) dot.velocity.x *= -1;
                if (dot.position.y < display.rect.top) dot.velocity.y *= -1;
                if (dot.position.y > display.rect.top + display.rect.bottom) dot.velocity.y *= -1;
            };
            break;
        
        default:
            display.borderFunction = () => {};
            break;
    }

    switch (document.getElementById("color-select").value) {
        case "wheel":
            display.colorFunction = dot => {
                const velocityAngle = Math.atan2(dot.velocity.y, dot.velocity.x) * 180 / Math.PI;
                dot.element.setAttributeNS(null, "fill", hslToHex(velocityAngle, 100, 50));
            };
            break;
        
        default:
            display.colorFunction = () => {};
            break;
    }

    for (let i = 0; i < n; i++) {
        display.dots.push(randomMaterialDot(radius, initialVelocity));
    }

    if (!display.active) {
        requestAnimationFrame(animateFrame);
    }

    display.active = true;
    display.previousTimestamp = performance.now();
}

window.addEventListener("load", (event) => {
    restart();
});