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
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>
        <rect style="${p.stdsLight}"></rect>
        <line style="${p.stdsDark}" id="p3-gravity" marker-end="url(#arrowhead)"/>
        <line style="${p.stdsDark}" id="p3-inertia" marker-end="url(#arrowhead)"/>
        <line style="${p.stdsDark}" id="p3-friction" marker-end="url(#arrowhead)"/>
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
    
    physics = {
        mass: 0.2,
        gravity: 9.8,
        mu: 0.2,
    }

    physics.inertiaMoment =
        physics.mass * (geometry.b ** 2 + geometry.h ** 2) / 12
        + physics.mass * (geometry.h / 2 - geometry.offset) ** 2;

    rect.setAttributeNS(null, "width", geometry.b);
    rect.setAttributeNS(null, "height", geometry.h);

    p.addSVGSketchHoverListener((x, y) => setSketchParameters(x - 0.5, y - 0.5));
    p.addSVGSketchLeaveListener(() => setSketchParameters(0, 0));

    function setSketchParameters(x, y) {
        rect.setAttributeNS(null, "x", x - geometry.b / 2);
        rect.setAttributeNS(null, "y", y - geometry.offset);
        cursor.newX = x;
        cursor.newY = y;
    }

    function animateFrame(timestamp) {
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

        inertiaArrow.setAttributeNS(null, "x1", massCenterX);
        inertiaArrow.setAttributeNS(null, "y1", massCenterY);
        inertiaArrow.setAttributeNS(null, "x2", massCenterX + FinX * .01);
        inertiaArrow.setAttributeNS(null, "y2", massCenterY + FinY * .01);

        const FgravX = 0;
        const FgravY = physics.mass * physics.gravity;

        gravityArrow.setAttributeNS(null, "x1", massCenterX);
        gravityArrow.setAttributeNS(null, "y1", massCenterY);
        gravityArrow.setAttributeNS(null, "x2", massCenterX + FgravX * .1);
        gravityArrow.setAttributeNS(null, "y2", massCenterY + FgravY * .1);

        const R1X = FinX + FgravX;
        const R1Y = FinY + FgravY;
        const R1 = Math.sqrt(R1X ** 2 + R1Y ** 2);
        const R1A = Math.atan2(R1Y, R1X);

        const N = R1 * Math.cos(R1A - geometry.angle);
        const Ffr = physics.mu * Math.abs(N);
        const FfrA = geometry.angle + ((geometry.angularVelocity > 0) ? (-Math.PI/2) : (+Math.PI/2));
        const FfrX = Ffr * Math.cos(FfrA);
        const FfrY = Ffr * Math.sin(FfrA);

        frictionArrow.setAttributeNS(null, "x1", massCenterX);
        frictionArrow.setAttributeNS(null, "y1", massCenterY);
        frictionArrow.setAttributeNS(null, "x2", massCenterX + FfrX * .2);
        frictionArrow.setAttributeNS(null, "y2", massCenterY + FfrY * .2);

        const R2X = R1X + FfrX;
        const R2Y = R1Y + FfrY;
        const R2 = Math.sqrt(R2X ** 2 + R2Y ** 2);
        const R2A = Math.atan2(R2Y, R2X);

        const M = R2 * centerOffset * Math.sin(R2A - geometry.angle);

        geometry.angularVelocity += M / physics.inertiaMoment * dt;
        geometry.angle += geometry.angularVelocity * dt;

        rect.setAttribute("transform", `
            rotate(${180 / Math.PI * (geometry.angle - Math.PI / 2)}
            ${cursor.x} ${cursor.y})
        `);

        p.setSketchSVGInfo(new Map([
            ["dt", round(dt, 5)],
            ["angle", degrees(geometry.angle, 2)],
            // ["cursor velocity x", round(cursor.vx, 3)],
            // ["cursor velocity y", round(cursor.vy, 3)],
            ["angular velocity", round(geometry.angularVelocity, 2)],
            // ["moment", moment],
            // ["FinX", FinX],
            // ["FinY", FinY],
        ]));

        (Problem.currentProblem === p) && requestAnimationFrame(animateFrame);
    }

    active = true;
    previousTimestamp = performance.now();


    requestAnimationFrame(animateFrame);
});