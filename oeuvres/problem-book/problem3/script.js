register("Прикреплённая к курсору пластинка", async function(opt) {
    const p = new Problem();

    const barleyBreakPageInfo = ihnmGetPageById(await ihnmPagesInfo(), "17");

    p.dom.condition.innerHTML = `
    <p>Описать, как движется пластинка, прикреплённая верхней частью к курсору мыши на
    вращающееся соединение. Курсор свободно перемещается по плоскости.
    Такая задача возникла при создании страницы
    "<a href="${ihnmGetPageAbsolutePath(barleyBreakPageInfo)}">${barleyBreakPageInfo.name}</a>".</p>
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
        b: 0.18, h: 0.30, offset: 0.05,
    }

    geometry.offsetFromCenter = geometry.h / 2 - geometry.offset;
    
    physics = {
        mass: 1, gravity: 9.807, mu: .2, angle: 0, angularVelocity: 0,
    }

    physics.inertiaMoment =
        physics.mass * (geometry.b** 2 + geometry.h** 2) / 12
        + physics.mass * geometry.offsetFromCenter** 2;

    p.setSketchSVGInfo(new Map());
    p.setAdditionalSketchSVGInfo(`
        mass ${physics.mass}kg;
        friction coefficient ${physics.mu};
        gravitational acceleration ${physics.gravity}m/s2; 
        moment of inertia ${round(physics.inertiaMoment, 4)}kg*m2.
    `);

    rect.setAttributeNS(null, "width", geometry.b);
    rect.setAttributeNS(null, "height", geometry.h);

    p.addSVGSketchHoverListener((x, y, jump) => setSketchParameters(x - 0.5, y - 0.5, jump));
    p.addSVGSketchLeaveListener(() => setSketchParameters(0, 0, true), true);

    function setSketchParameters(x, y, jump) {
        rect.setAttributeNS(null, "x", x - geometry.b / 2);
        rect.setAttributeNS(null, "y", y - geometry.offset);

        cursor.newX = x;
        cursor.newY = y;

        if (jump) {
            cursor.x = x;
            cursor.y = y;
        }
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
        
        const massCenterX = cursor.x + geometry.offsetFromCenter * Math.cos(physics.angle);
        const massCenterY = cursor.y + geometry.offsetFromCenter * Math.sin(physics.angle);

        // calculating inertial force

        const FinX = -physics.mass * cursor.ax;
        const FinY = -physics.mass * cursor.ay;
        const Fin = Math.sqrt(FinX**2 + FinY**2);

        inertiaArrow.setAttributeNS(null, "x1", massCenterX);
        inertiaArrow.setAttributeNS(null, "y1", massCenterY);
        inertiaArrow.setAttributeNS(null, "x2", massCenterX + FinX * .01);
        inertiaArrow.setAttributeNS(null, "y2", massCenterY + FinY * .01);

        // calculating gravity force

        const FgravX = 0;
        const FgravY = physics.mass * physics.gravity;
        const Fgrav = Math.sqrt(FgravX**2 + FgravY**2);

        gravityArrow.setAttributeNS(null, "x1", massCenterX);
        gravityArrow.setAttributeNS(null, "y1", massCenterY);
        gravityArrow.setAttributeNS(null, "x2", massCenterX + FgravX * .02);
        gravityArrow.setAttributeNS(null, "y2", massCenterY + FgravY * .02);

        // combined force of inertia and gravity
        
        const R1X = FinX + FgravX;
        const R1Y = FinY + FgravY;
        const R1 = Math.sqrt(R1X**2 + R1Y**2);
        const R1A = Math.atan2(R1Y, R1X);

        // calculating friction force
        
        // calculating sliding and static friction forces
        const CentrifugalForce = physics.mass * physics.angularVelocity**2 * geometry.offsetFromCenter;
        const N = Math.abs(R1 * Math.cos(R1A - physics.angle)) + CentrifugalForce;
        const slidingFriction = physics.mu * N;
        const staticFriction = Math.abs(R1 * Math.sin(R1A - physics.angle));
        const frictionSign = Math.sign(physics.angularVelocity ? -physics.angularVelocity : physics.angle - R1A);
        // check if slidingFriction too strong
        const R1M = R1 * geometry.offsetFromCenter * Math.sin(R1A - physics.angle);
        const FrM = -slidingFriction * geometry.offsetFromCenter * frictionSign;
        const velocityChange = (FrM + R1M) / physics.inertiaMoment * dt;
        const noStrongMoments = Math.abs(FrM) > Math.abs(R1M);
        const noVelocity = Math.abs(physics.angularVelocity) <= Math.abs(velocityChange);
        const isStatic = noStrongMoments && noVelocity;
        // finishing friction force calculation
        const Ffr = Math.min(slidingFriction, staticFriction);
        const FfrA = physics.angle + frictionSign * Math.PI / 2;
        const FfrX = Ffr * Math.cos(FfrA);
        const FfrY = Ffr * Math.sin(FfrA);

        frictionArrow.setAttributeNS(null, "x1", massCenterX);
        frictionArrow.setAttributeNS(null, "y1", massCenterY);
        frictionArrow.setAttributeNS(null, "x2", massCenterX + FfrX * .05);
        frictionArrow.setAttributeNS(null, "y2", massCenterY + FfrY * .05);

        // combined force of inertia, gravity and friction
        
        const R2X = R1X + FfrX;
        const R2Y = R1Y + FfrY;
        const R2 = Math.sqrt(R2X**2 + R2Y**2);
        const R2A = Math.atan2(R2Y, R2X);

        // applying forces
        
        const M = R2 * geometry.offsetFromCenter * Math.sin(R2A - physics.angle);
        physics.angularVelocity += M / physics.inertiaMoment * dt;
        physics.angularVelocity *= !isStatic;
        physics.angle += physics.angularVelocity * dt;
        physics.angle = physics.angle % (2 * Math.PI);

        // updating sketch
        
        const transformRotate = 180 / Math.PI * (physics.angle - Math.PI / 2);
        rect.setAttribute("transform",  `rotate(${transformRotate} ${cursor.x} ${cursor.y})`);

        isNaN(transformRotate) && opt.error();
        
        p.setSketchSVGInfo(new Map([
            ["dt", round(dt * 1000, 5) + "ms"],
            ["inertia force", round(Fin, 1) + "N"],
            ["gravity force", round(Fgrav, 1) + "N"],
            ["friction force", round(Ffr, 1) + "N"],
            ["angular velocity", round(physics.angularVelocity, 2) + "rad/s"],
        ]));

        (Problem.currentProblem === p) && requestAnimationFrame(animateFrame);
    }

    previousTimestamp = performance.now();
    requestAnimationFrame(animateFrame);
});