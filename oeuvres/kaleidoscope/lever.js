"use strict"

class SliderAnimation {
    constructor(onchange, acceleration, startPosition=0.5) {
        this.callback = onchange;
        this.position = startPosition;
        this.velocity = null;
        this.destination = null;
        this.setAcceleration(acceleration);
        this.setRandomDestination();
        this.frameRequestTime = performance.now();
        requestAnimationFrame(this.animate.bind(this));
        this.active = true;
    }
    setAcceleration(newVal) {
        this.acceleration = newVal**2 / 10**10;
        this.velocity = this.acceleration;
    }
    setRandomDestination() {
        const brakingDistance = (this.velocity ** 2) / (2 * this.acceleration);
        let lbound, rbound;
        if (this.velocity > 0) {
            rbound = this.position + brakingDistance;
            lbound = rbound / 2;
        }
        else {
            lbound = this.position - brakingDistance;
            rbound = 0.5 + lbound / 2;
        }
        this.destination = lbound + (rbound - lbound) * Math.random();
    }
    animate(time) {
        let dt = Math.min(time - this.frameRequestTime, 100);
        this.frameRequestTime = time;

        // When destination is reached a new one is choosed
        if ((this.velocity + this.acceleration * dt) * this.velocity <= 0) {
            this.setRandomDestination();
        }

        // On extreme points acceleration's sign changes
        if ((this.velocity > 0) && (this.destination < this.position)) {
            this.acceleration = Math.abs(this.acceleration) * -1;
        }
        if ((this.velocity < 0) && (this.position < this.destination)) {
            this.acceleration = Math.abs(this.acceleration) * +1;
        }

        this.velocity += this.acceleration * dt;
        this.position += this.velocity * dt;

        this.callback(this.position);
        if (this.active) {
            setTimeout(
                () => requestAnimationFrame(this.animate.bind(this)), 30
            );
        }
    }
    delete() {
        this.active = false;
    }
}

class Lever {
    constructor(container, patternId, ns, speed) {
        this.svg = document.createElementNS(ns, "svg");
        this.svg.classList.add("lever");
        container.appendChild(this.svg);

        this.bgImage = document.createElementNS(ns, "image");
        this.bgImage.classList.add("lever-bg");
        this.svg.appendChild(this.bgImage);

        this.pattern = document.createElementNS(ns, "pattern");
        this.pattern.setAttributeNS(null, "id", patternId);
        this.pattern.setAttributeNS(null, "viewbox", "0, 0, 100, 100");
        this.pattern.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
        this.svg.appendChild(this.pattern);

        this.patternImage = document.createElementNS(ns, "image");
        this.pattern.appendChild(this.patternImage);

        this.firefly = document.createElementNS(ns, "circle");
        this.firefly.setAttributeNS(null, "stroke", "black");
        this.firefly.setAttributeNS(null, "fill", "white");
        this.firefly.setAttributeNS(null, "r", "3");
        this.svg.appendChild(this.firefly);

        this.fireflyAreaScale = 100 * 3;
        this.xAnimation = new SliderAnimation(this.onFireflyXChange.bind(this), speed);
        this.yAnimation = new SliderAnimation(this.onFireflyYChange.bind(this), speed);

        this.setParameters(0, 0, 100, 100);
    }
    setImage(href) {
        this.bgImage.setAttributeNS(null, "href", href);
        this.patternImage.setAttributeNS(null, "href", href);
    }
    setParameters(x, y, width, height) {
        this.pattern.setAttributeNS(null, "x", x);
        this.pattern.setAttributeNS(null, "y", y);
        this.pattern.setAttributeNS(null, "width", width);
        this.pattern.setAttributeNS(null, "height", height);
    }
    setSpeed(value) {
        this.xAnimation.setAcceleration(value);
        this.yAnimation.setAcceleration(value);
    }
    onFireflyXChange(value) {
        const x = value * this.fireflyAreaScale % 100;
        this.pattern.setAttributeNS(null, "x", x);
        this.firefly.setAttributeNS(null, "cx", 100-x);
    }
    onFireflyYChange(value) {
        const y = value * this.fireflyAreaScale % 100;
        this.pattern.setAttributeNS(null, "y", y);
        this.firefly.setAttributeNS(null, "cy", 100-y);
    }
    delete() {
        this.xAnimation.delete();
        this.yAnimation.delete();
        this.svg.remove();
    }
}