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
        requestAnimationFrame(this.animate.bind(this));
    }
}