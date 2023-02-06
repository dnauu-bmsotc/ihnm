"use strict"

function newRandomDestination(position, velocity, acceleration) {
    let lbound, rbound, brakingDistance = (velocity ** 2) / (2 * acceleration);
    if (velocity > 0) {
        rbound = position + brakingDistance;
        lbound = rbound / 2;
    }
    else {
        lbound = position - brakingDistance;
        rbound = 0.5 + lbound / 2;
    }
    return lbound + (rbound - lbound) * Math.random();
}

function createSliderAnimation(onchange, speed) {
    return function animateSlider(startPosition = 0.5) {
        let s = animateSlider;

        s.acceleration = null;
        s.velocity = 0;
        s.position = startPosition;
        s.onchange = onchange;

        (s.setSpeed = function (speed) {
            s.acceleration = speed**3 / 10**11;
            s.velocity = s.acceleration;
        })(speed);

        let timestamp = performance.now();
        let destination = s.position;

        requestAnimationFrame(function animate(time) {
            let dt = Math.min(time - timestamp, 100);
            timestamp = time;

            // When destination is reached a new one is choosed
            if ((s.velocity + s.acceleration * dt) * s.velocity <= 0) {
                destination = newRandomDestination(s.position, s.velocity, s.acceleration);
            }

            // On extreme points acceleration's sign changes
            if ((s.velocity > 0) && (destination < s.position)) {
                s.acceleration = Math.abs(s.acceleration) * -1;
            }
            if ((s.velocity < 0) && (s.position < destination)) {
                s.acceleration = Math.abs(s.acceleration) * +1;
            }

            s.velocity += s.acceleration * dt;
            s.position += s.velocity * dt;
            s.onchange(s.position);

            requestAnimationFrame(animate);
        });
    }
}