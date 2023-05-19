register("Пластинка, прикреплённая к курсору", function() {
    const p = new Problem();

    p.dom.condition.innerHTML = `
    <p>Описать, как движется пластинка, прикреплённая верхней частью к курсору мыши на
    вращающееся соединение. Курсор свободно перемещает крепление по плоскости.
    Пластинка имеет массу, на неё дейсвтует гравитация и трение.
    Центр масс находится в центре пластины, трением покоя пренебречь.</p>
    `;

    // 1x1 meters
    p.createSVGSketch(-.5, -.5, 1, 1).innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" style=${p.stdsDark}>
                <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
            <marker id="arrowheadRed" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" fill="red">
                <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>
        <rect style="${p.stdsLight}"></rect>
        <line style="${p.stdsDark}" id="p3-gravity" marker-end="url(#arrowhead)"/>
        <line style="${p.stdsDark}" id="p3-friction" marker-end="url(#arrowhead)"/>
        <line style="${p.stdsRed}" id="p3-inertia" marker-end="url(#arrowheadRed)"/>
    `;

    p.dom.solution.innerHTML = `<img></img>`;

    gravityArrow = p.dom.sketchSVG.querySelector("#p3-gravity");
    inertiaArrow = p.dom.sketchSVG.querySelector("#p3-inertia");
    frictionArrow = p.dom.sketchSVG.querySelector("#p3-friction");
    rect = p.dom.sketchSVG.querySelector("rect");

    cursor = {
        x: 0, y: 0, vx: 0, vy: 0, ax: 0, vy: 0, newX: 0, newY: 0,
    }

    geometry = {
        b: 0.18, h: 0.30, offset: 0.05, angle: 0, angularVelocity: 0,
    }

    geometry.offsetFromCenter = geometry.h / 2 - geometry.offset;
    
    physics = {
        mass: 1, gravity: 9.807, mu: .1, epsilon: 0.01,
        staticFrictionK: 1.0, additionalFriction: 0,
    }

    physics.inertiaMoment =
        physics.mass * (geometry.b ** 2 + geometry.h ** 2) / 12
        + physics.mass * geometry.offsetFromCenter ** 2 + 0.01;

    rect.setAttributeNS(null, "width", geometry.b);
    rect.setAttributeNS(null, "height", geometry.h);

    p.addSVGSketchHoverListener((x, y, jump) => setSketchParameters(x - 0.5, y - 0.5, jump));
    p.addSVGSketchLeaveListener(() => setSketchParametersOnJump(0, 0), true);

    p.dom.sketchSVG.addEventListener("click", _ => {
        geometry.angularVelocity = 0;
    });

    function onJump(x, y) {
        cursor.x = x;
        cursor.y = y;
    }

    function setSketchParameters(x, y, jump) {
        rect.setAttributeNS(null, "x", x - geometry.b / 2);
        rect.setAttributeNS(null, "y", y - geometry.offset);
        cursor.newX = x;
        cursor.newY = y;
        jump && onJump(x, y);
    }

    function setSketchParametersOnJump(x, y) {
        setSketchParameters(x, y);
        onJump(x, y);
    }

    function animateFrame(timestamp) {
        animateFrame.performance = performance.now();

        const dt = (0.01 + timestamp - previousTimestamp) / 1000; // seconds
        previousTimestamp = timestamp;

        const dx = cursor.newX - cursor.x;
        const dy = cursor.newY - cursor.y;

        cursor.ax = (dx / dt - cursor.vx) / dt;
        cursor.ay = (dy / dt - cursor.vy) / dt;

        cursor.vx = dx / dt;
        cursor.vy = dy / dt;

        cursor.x = cursor.newX;
        cursor.y = cursor.newY;
        
        const centerOffset = geometry.h / 2 - geometry.offset;
        const massCenterX = cursor.x + centerOffset * Math.cos(geometry.angle);
        const massCenterY = cursor.y + centerOffset * Math.sin(geometry.angle);

        const FinX = -physics.mass * cursor.ax;
        const FinY = -physics.mass * cursor.ay;
        const Fin = Math.sqrt(FinX**2 + FinY**2);

        inertiaArrow.setAttributeNS(null, "x1", massCenterX);
        inertiaArrow.setAttributeNS(null, "y1", massCenterY);
        inertiaArrow.setAttributeNS(null, "x2", massCenterX + FinX * .01);
        inertiaArrow.setAttributeNS(null, "y2", massCenterY + FinY * .01);

        const FgravX = 0;
        const FgravY = physics.mass * physics.gravity;
        const Fgrav = Math.sqrt(FgravX**2 + FgravY**2);

        gravityArrow.setAttributeNS(null, "x1", massCenterX);
        gravityArrow.setAttributeNS(null, "y1", massCenterY);
        gravityArrow.setAttributeNS(null, "x2", massCenterX + FgravX * .01);
        gravityArrow.setAttributeNS(null, "y2", massCenterY + FgravY * .01);

        const R1X = FinX + FgravX;
        const R1Y = FinY + FgravY;
        const R1 = Math.sqrt(R1X ** 2 + R1Y ** 2);
        const R1A = Math.atan2(R1Y, R1X);

        const CentrifugalForce = physics.mass * geometry.angularVelocity**2 * geometry.offsetFromCenter;
        const N = Math.abs(R1 * Math.cos(R1A - geometry.angle)) + CentrifugalForce;
        const slidingFriction = physics.mu * N + physics.additionalFriction;
        const staticFriction = R1 * Math.sin(R1A - geometry.angle);
        const noVelocity = Math.abs(geometry.angularVelocity) < physics.epsilon;
        const noStrongForces = slidingFriction > Math.abs(staticFriction) * physics.staticFrictionK;
        const static = noVelocity && noStrongForces;
        const Ffr = static ? staticFriction : slidingFriction;
        const FfrA = geometry.angle - (static ? R1A : Math.sign(geometry.angularVelocity) * Math.PI/2);
        const FfrX = Ffr * Math.cos(FfrA);
        const FfrY = Ffr * Math.sin(FfrA);

        frictionArrow.setAttributeNS(null, "x1", massCenterX);
        frictionArrow.setAttributeNS(null, "y1", massCenterY);
        frictionArrow.setAttributeNS(null, "x2", massCenterX + FfrX * .1);
        frictionArrow.setAttributeNS(null, "y2", massCenterY + FfrY * .1);

        const R2X = R1X + FfrX;
        const R2Y = R1Y + FfrY;
        const R2 = Math.sqrt(R2X ** 2 + R2Y ** 2);
        const R2A = Math.atan2(R2Y, R2X);

        const M = R2 * centerOffset * Math.sin(R2A - geometry.angle);

        geometry.angularVelocity += M / physics.inertiaMoment * dt;
        geometry.angularVelocity *= !static;
        geometry.angle += geometry.angularVelocity * dt;
        geometry.angle = geometry.angle % (2 * Math.PI);

        rect.setAttribute("transform", `
            rotate(${180 / Math.PI * (geometry.angle - Math.PI / 2)} ${cursor.x} ${cursor.y})
        `);

        p.setSketchSVGInfo(new Map([
            ["dt", round(dt * 1000, 5) + " ms"],
            ["frame calculation time", round(performance.now() - animateFrame.performance, 3) + " ms"],
            ["gravity force", round(Fgrav, 1) + " m/s2"],
            ["friction force", round(Ffr, 1) + " m/s2"],
            ["inertial force", round(Fin, 1) + " m/s2"],
            ["static", static],
            ["slidingFriction", slidingFriction],
            ["staticFriction", staticFriction],
        ]));

        (Problem.currentProblem === p) && requestAnimationFrame(animateFrame);
    }

    active = true;
    previousTimestamp = performance.now();

    requestAnimationFrame(animateFrame);
});