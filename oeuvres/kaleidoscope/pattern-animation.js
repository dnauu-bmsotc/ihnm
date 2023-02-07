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
        this.acceleration = (2000 / (100 - newVal) - 20) / 10**8;
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

class PatternAnimation {
    constructor(svgpattern, speed, callback, ns) {
        this.svgpattern = svgpattern;
        this.callback = callback;
        this.ns = ns || "http://www.w3.org/2000/svg";
        this.initSVGPattern();
        this.speed = speed;
        this.sliderX = new SliderAnimation(() => {}, this.speed);
        this.sliderY = new SliderAnimation(() => {}, this.speed);
        this.sliderS = new SliderAnimation(this.onSizeChange.bind(this), this.speed);
    }
    initSVGPattern() {
        this.svgpattern.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
        this.image = document.createElementNS(this.ns, "image");
        this.svgpattern.appendChild(this.image)
        this.patternSize = 8;
    }
    get patternSize() {
        return this._patternSize;
    }
    set patternSize(value) {
        this._patternSize = value;
        this.svgpattern.setAttributeNS(null, "width", value);
        this.svgpattern.setAttributeNS(null, "height", value);
        this.image.setAttributeNS(null, "width", value);
        this.image.setAttributeNS(null, "height", value);
    }
    onSizeChange(percentage) {
        this.patternSize = 12 + 8 * percentage;
    }
    setImage(href) {
        this.image.setAttributeNS(null, "href", href);
    }
    setAcceleration(newValue) {
        this.speed = newValue;
        this.sliderX.setAcceleration(newValue);
        this.sliderY.setAcceleration(newValue);
        this.sliderS.setAcceleration(newValue);
    }
    delete() {
        this.sliderX.delete();
        this.sliderY.delete();
        this.sliderS.delete();
    }
    setTypeChaos() {
        this.sliderX.callback = function() {
            const x = this.sliderX.position;
            const y = this.sliderY.position;
            const s = this.sliderS.position;
            this.svgpattern.setAttributeNS(null, "x", (0.5-x) * this.patternSize);
            this.svgpattern.setAttributeNS(null, "y", (0.5-y) * this.patternSize);
            this.callback(x, y, s);
        }.bind(this);
    }
    setTypeSpiral() {
        this.sliderX.callback = function() {
            const period = 10**7 / this.speed**2;
            const angle = (performance.now() % period) / period * 2*Math.PI;
            const r = 0.2 + 0.2*this.sliderX.position;
            const x = 0.5 + r*Math.cos(angle);
            const y = 0.5 + r*Math.sin(angle);
            const s = this.sliderS.position;
            this.svgpattern.setAttributeNS(null, "x", (0.5-x) * this.patternSize);
            this.svgpattern.setAttributeNS(null, "y", (0.5-y) * this.patternSize);
            this.callback(x, y, s);
        }.bind(this);
    }
}