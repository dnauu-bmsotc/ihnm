register("Прикреплённая к курсору пластинка", function(opt) {
    const p = new Problem();

    p.dom.condition.innerHTML = `
    <p>Описать, как движется пластинка, прикреплённая верхней частью к курсору мыши на
    вращающееся соединение. Курсор свободно перемещается по плоскости.
    Такая задача возникла при создании страницы "Пятнашки".</p>
    `;

    // 1x1 meters
    p.createSVGSketch(-.5, -.5, 1, 1).innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10"markerHeight="7" refX="0" refY="3.5" orient="auto" style=${p.stdsDark}>
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

    p.dom.solution.innerHTML = `
        <p>Рассмотрим неинерциальную систему отсчёта, связанную с положением курсора мыши.
        Тогда курсор рассматривается как неподвижная ось вращения. На пластинку (на центр
        масс) будут действовать следующие силы:</p>
        <ul>
            <li>Инерциальная сила, направленная противоположно ускорению курсора.
                Известно изменение координат курсора по времени, отсюда можно
                вычислить ускорение курсора и саму инерциальную силу.</li>
            <li>Сила тяжести.</li>
            <li>Сила трения в креплении, образующаяся при вращении пластинки.
                Силу трения будем рассматривать как силу трения скольжения,
                равную произведению коэффициента силы трения на силу реакции опоры.
                Сила реакции опоры равна сумме силы, образующейся в результате
                центробежного ускорения, и компоненты вектора совместного действия
                инерциальной силы и силы тяжести, которая (компонента) параллельна
                прямой, соединяющей курсор и центр масс.</li>
        </ul>
        <p>Результирующий вектор сил создаёт момент сил, который в совокупности
        с моментом инерции пластины (const) задаёт изменение угловой скорости за
        момент времени.</p>
        <img src="./problem3/solution.jpg"></img>
    `;

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
        mass: 1, gravity: 9.807, mu: .2, epsilon: 10**-3,
    }

    physics.inertiaMoment =
        physics.mass * (geometry.b ** 2 + geometry.h ** 2) / 12
        + physics.mass * geometry.offsetFromCenter ** 2 + 0.01;

    rect.setAttributeNS(null, "width", geometry.b);
    rect.setAttributeNS(null, "height", geometry.h);

    p.addSVGSketchHoverListener((x, y, jump) => setSketchParameters(x - 0.5, y - 0.5, jump));
    p.addSVGSketchLeaveListener(() => setSketchParametersOnJump(0, 0), true);

    function onJump(x, y) {
        cursor.x = x;
        cursor.y = y;
    }

    window.hololo = physics;

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
        const dt = (0.001 + timestamp - previousTimestamp) / 1000; // seconds
        previousTimestamp = timestamp;

        const dx = cursor.newX - cursor.x;
        const dy = cursor.newY - cursor.y;

        cursor.ax = (dx / dt - cursor.vx) / dt;
        cursor.ay = (dy / dt - cursor.vy) / dt;

        cursor.vx = dx / dt;
        cursor.vy = dy / dt;

        cursor.x = cursor.newX;
        cursor.y = cursor.newY;
        
        const massCenterX = cursor.x + geometry.offsetFromCenter * Math.cos(geometry.angle);
        const massCenterY = cursor.y + geometry.offsetFromCenter * Math.sin(geometry.angle);

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
        const slidingFriction = physics.mu * N;
        const staticFriction = Math.min(slidingFriction, Math.abs(R1 * Math.sin(R1A - geometry.angle)));
        const isStatic = animateFrame.isZeroVelocity && (slidingFriction > staticFriction);
        const Ffr = isStatic ? staticFriction : slidingFriction;
        const FfrA = geometry.angle - (animateFrame.isZeroVelocity ? R1A : Math.sign(geometry.angularVelocity) * Math.PI/2);
        const FfrX = Ffr * Math.cos(FfrA);
        const FfrY = Ffr * Math.sin(FfrA);

        frictionArrow.setAttributeNS(null, "x1", massCenterX);
        frictionArrow.setAttributeNS(null, "y1", massCenterY);
        frictionArrow.setAttributeNS(null, "x2", massCenterX + FfrX * .1);
        frictionArrow.setAttributeNS(null, "y2", massCenterY + FfrY * .1);

        const R2X = R1X + FfrX;
        const R2Y = R1Y + FfrY;
        const R2 = Math.sqrt(R2X**2 + R2Y**2);
        const R2A = Math.atan2(R2Y, R2X);

        const M = R2 * geometry.offsetFromCenter * Math.sin(R2A - geometry.angle);

        const dw = M / physics.inertiaMoment * dt;
        const da = geometry.angularVelocity * dt;
        
        const lessThanEpsilon = Math.abs(da) < physics.epsilon;
        const changedSign = (geometry.angularVelocity * (geometry.angularVelocity - dw) < 0);
        animateFrame.isZeroVelocity = lessThanEpsilon || changedSign;

        geometry.angularVelocity += dw;
        geometry.angularVelocity *= !isStatic;
        geometry.angle += da;
        geometry.angle = geometry.angle % (2 * Math.PI);

        const transformRotate = 180 / Math.PI * (geometry.angle - Math.PI / 2);
        rect.setAttribute("transform",  `rotate(${transformRotate} ${cursor.x} ${cursor.y})`);

        if (isNaN(transformRotate)) {
            opt.btn.click();
        }

        p.setSketchSVGInfo(new Map([
            ["dt", round(dt * 1000, 5) + " ms"],
            ["friction force", round(Ffr, 1) + " m/s2"],
            ["no velocity", animateFrame.isZeroVelocity],
        ]));

        (Problem.currentProblem === p) && requestAnimationFrame(animateFrame);
    }

    previousTimestamp = performance.now();

    requestAnimationFrame(animateFrame);
});