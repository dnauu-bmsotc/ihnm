class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class MaterialDot {
    constructor(x, y, mass, imaginary=false) {
        this.position = new Point(x, y);
        this.velocity = new Point(0, 0);
        this.forces = new Point(0, 0);

        this.element = document.createElementNS(display.ns, "circle");
        this.element.setAttributeNS(null, "fill", "white");
        this.element.setAttributeNS(null, "cx", this.position.x);
        this.element.setAttributeNS(null, "cy", this.position.y);
        this.element.setAttributeNS(null, "stroke-width", "0");

        this.mass = mass;

        if (!imaginary) {
            document.getElementById("dots").appendChild(this.element);
        }
    }
    get mass() {
        return this._mass;
    }
    set mass(value) {
        this._mass = value;
        this.element.setAttributeNS(null, "r", 0.2 + Math.sqrt(this.mass / display.maxMass) / 3);
        this.element.setAttributeNS(null, "opacity", (display.maxMass/3 + this.mass) / (display.maxMass/3 + display.maxMass));
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
    minMass: 1,
    maxMass: 500,
    options: {},
    lastResetFunction: null,
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

function randomMaterialDot() {
    const maxRadius = 10 + 10 * Math.pow(display.options.numberOfPoints, 1/4);
    const radius = randomFloat(0, maxRadius);
    const angle = randomFloat(0, 2 * Math.PI);

    const dot = new MaterialDot(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        display.minMass + Math.pow(Math.random(), 8) * (display.maxMass - display.minMass),
    );

    display.options.velocityCallback(
        dot, { angle: angle, radius: radius }
    );

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

    display.options.calculationCallback();

    for (let dot of display.dots) {
        dot.velocity.x += dot.forces.x / dot.mass * dt;
        dot.velocity.y += dot.forces.y / dot.mass * dt;

        dot.position.x += dot.velocity.x * dt;
        dot.position.y += dot.velocity.y * dt;

        dot.element.setAttributeNS(null, "cx", dot.position.x);
        dot.element.setAttributeNS(null, "cy", dot.position.y);

        display.options.colorCallback(dot);
        display.options.borderCallback(dot);
    }

    if (display.active) {
        requestAnimationFrame(animateFrame);
    }
}

function setVelocityCallback(name) {
    switch (name) {
        case "funnel":
            const baseAngle = Math.sign(randomFloat(-1, +1)) * Math.PI / 2 + Math.PI / 4 * randomFloat(-1, +1);
            display.options.velocityCallback = function(dot, polar) {
                const additionalAngle = Math.PI * randomFloat(-1/10, +1/10);
                const velocityAngle = polar.angle + baseAngle + additionalAngle;
                const velocity = randomFloat(0.005, +0.02) / Math.pow(dot.mass, 1/6) / (0.5 + (polar.radius / 50)**2/2);
                dot.velocity.x = velocity * Math.cos(velocityAngle);
                dot.velocity.y = velocity * Math.sin(velocityAngle);
            };
            break;
        
        case "noise":
            display.options.velocityCallback = function(dot) {
                dot.velocity.x = randomFloat(-0.012, +0.012);
                dot.velocity.y = randomFloat(-0.012, +0.012);
            }
            break;

        default:
            display.options.velocityCallback = () => {};
            break;
    }
}

function setBorderCallback(name) {
    switch (name) {
        case "bounce":
            display.options.borderCallback = dot => {
                if (dot.position.x < display.rect.left) {
                    dot.velocity.x = Math.abs(dot.velocity.x);
                }
                else if (dot.position.x > display.rect.left + display.rect.right) {
                    dot.velocity.x = -Math.abs(dot.velocity.x);
                }
                else if (dot.position.y < display.rect.top) {
                    dot.velocity.y = Math.abs(dot.velocity.y);
                }
                else if (dot.position.y > display.rect.top + display.rect.bottom) {
                    dot.velocity.y = -Math.abs(dot.velocity.y);
                }
            };
            break;

        case "wall":
            display.options.borderCallback = dot => {
                if (dot.position.x < display.rect.left) {
                    dot.position.x = display.rect.left;
                    dot.velocity.x = 0;
                }
                else if (dot.position.x > display.rect.left + display.rect.right) {
                    dot.position.x = display.rect.left + display.rect.right;
                    dot.velocity.x = 0;
                }
                else if (dot.position.y < display.rect.top) {
                    dot.position.y = display.rect.top;
                    dot.velocity.y = 0;
                }
                else if (dot.position.y > display.rect.top + display.rect.bottom) {
                    dot.position.y = display.rect.top + display.rect.bottom;
                    dot.velocity.y = 0;
                }
            }
            break;
        
        default:
            display.options.borderCallback = () => {};
            break;
    }
}

function setColorCallback(name) {
    switch (name) {
        case "wheel":
            display.options.colorCallback = dot => {
                const velocityAngle = Math.atan2(dot.velocity.y, dot.velocity.x) * 180 / Math.PI;
                dot.element.setAttributeNS(null, "fill", hslToHex(velocityAngle, 100, 50));
            };
            break;
        
        default:
            display.options.colorCallback = () => {};
            break;
    }
}

function setCalculationCallback(name) {
    switch (name) {
        case "massive":
            display.options.calculationCallback = function() {
                for (let i = 0; i < display.dots.length; i++) {
                    if (display.dots[i].mass > (display.minMass + display.maxMass) / 2) {
                        for (let j = i + 1; j < display.dots.length; j++) {
                            lawOfGravity(display.dots[i], display.dots[j]);
                            display.options.collisionCallback(display.dots[i], display.dots[j]);
                        }
                    }
                }
            }
            break;

        case "staticmassive":
            display.options.calculationCallback = function() {
                for (let i = 0; i < display.dots.length; i++) {
                    for (let j = i + 1; j < display.dots.length; j++) {
                        lawOfGravity(display.dots[i], display.dots[j]);
                        display.options.collisionCallback(display.dots[i], display.dots[j]);
                    }
                }
                for (let dot of display.dots) {
                    if (dot.mass > (display.minMass + display.maxMass) * 7 / 10) {
                        dot.forces.x = dot.forces.y = 0;
                        dot.velocity.x = dot.velocity.y = 0;
                    }
                }
            }
            break;
    
        default:
            display.options.calculationCallback = function() {
                for (let i = 0; i < display.dots.length; i++) {
                    for (let j = i + 1; j < display.dots.length; j++) {
                        lawOfGravity(display.dots[i], display.dots[j]);
                        display.options.collisionCallback(display.dots[i], display.dots[j]);
                    }
                }
            };
            break;
    }
}

function setCollisionCallback(name) {
    switch (name) {
        case "stick":
            display.options.collisionCallback = function(d1, d2) {
                const dx = d2.position.x - d1.position.x;
                const dy = d2.position.y - d1.position.y;
                if (dx**2 + dy**2 < 0.2) {
                    d1.velocity.x = (d1.mass * d1.velocity.x + d2.mass * d2.velocity.x) / (d1.mass + d2.mass);
                    d1.velocity.y = (d1.mass * d1.velocity.y + d2.mass * d2.velocity.y) / (d1.mass + d2.mass);

                    d1.position.x = (d2.position.x + d1.position.x) / 2;
                    d1.position.y = (d2.position.y + d1.position.y) / 2;
                    d1.mass += d2.mass;

                    d2.element.remove();
                    display.dots.splice(display.dots.indexOf(d2), 1);
                }
            }
            break;

        default:
            display.options.collisionCallback = () => {};
            break;
    }
}

function restartToUserOptions() {
    clear();

    display.options.numberOfPoints = +document.getElementById("number-select").value;

    setVelocityCallback(document.getElementById("velocity-select").value);
    setBorderCallback(document.getElementById("border-select").value);
    setColorCallback(document.getElementById("color-select").value);
    setCalculationCallback(document.getElementById("calculation-select").value);
    setCollisionCallback(document.getElementById("collision-select").value);

    for (let i = 0; i < display.options.numberOfPoints; i++) {
        display.dots.push(randomMaterialDot());
    }

    display.lastResetFunction = restartToUserOptions;
    startAnimation();
}

function clear() {
    document.getElementById("dots").innerHTML = "";
    display.dots = [];
}

function startAnimation() {
    if (!display.active) {
        requestAnimationFrame(animateFrame);
    }

    display.active = true;
    display.previousTimestamp = performance.now();
}

function reset() {
    document.getElementById("border-select").value = "wall";
    document.getElementById("color-select").value = "white";
    document.getElementById("number-select").value = "100";
    document.getElementById("velocity-select").value = "static";
    document.getElementById("calculation-select").value = "all";
    document.getElementById("collision-select").value = "skip";

    restartToUserOptions();
}

function preset1() {
    clear();

    setBorderCallback("bounce");
    setColorCallback("wheel");
    setCalculationCallback("all");
    setCollisionCallback("stick");
    
    const n = 16;
    const r = 20;
    const v = 0.01;
    for (let i = 0; i < n; i++) {
        const polarAngle = i * (360 / n) * Math.PI / 180;
        const polarRadius = r;

        const dot = new MaterialDot(
            polarRadius * Math.cos(polarAngle),
            polarRadius * Math.sin(polarAngle),
            display.maxMass,
        );

        dot.velocity.x = v * Math.cos(polarAngle + Math.PI * 3 / 4);
        dot.velocity.y = v * Math.sin(polarAngle + Math.PI * 3 / 4);

        display.dots.push(dot);        
    }

    display.lastResetFunction = preset1;
    startAnimation();
}

function preset2() {
    clear();

    setBorderCallback("none");
    setColorCallback("white");
    setCalculationCallback("all");
    setCollisionCallback("skip");

    const sun = new MaterialDot(0, 0, display.maxMass * 100);
    sun.velocity.y = +0.003;
    display.dots.push(sun);

    const earth = new MaterialDot(40, 0, display.maxMass * 8.1);
    earth.velocity.y = -0.03;
    display.dots.push(earth);

    const moon = new MaterialDot(45, 0, display.maxMass / 2);
    moon.velocity.y = -0.05;
    display.dots.push(moon);

    display.lastResetFunction = preset2;
    startAnimation();
}

window.addEventListener("load", (event) => {
    reset();
});
