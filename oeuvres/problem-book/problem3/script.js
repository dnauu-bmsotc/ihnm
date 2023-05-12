class Problem3 extends Problem {
    makeCondition(el) {
        el.innerHTML = `
            <p>Описать, как движется пластинка, прикреплённая верхней частью к курсору мыши на
            вращающееся соединение. Курсор свободно перемещает крепление по плоскости.
            Пластинка имеет массу, на неё дейсвтует гравитация и трение.
            Центр масс находится в центре пластины, трением покоя пренебречь.</p>
        `;
    }
    makeSketch(el) {
        const [infobox, infoboxHash] = this.createSketchSVGInfo([
            "dt", "angle", "cursor x", "cursor y",
            "cursor velocity x", "cursor velocity y", 
            "angular velocity",
        ]);
        this.infoboxHash = infoboxHash;

        const svg = this.createSketchSVG(`
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" />
                </marker>
            </defs>
            <rect style="${this.stdsLight(0.01)}"></rect>
            <line style="${this.stdsDark(0.01)}" id="gravity" marker-end="url(#arrowhead)"/>
            <line style="${this.stdsDark(0.01)}" id="inertia" marker-end="url(#arrowhead)"/>
            <line style="${this.stdsDark(0.01)}" id="friction" marker-end="url(#arrowhead)"/>
            `,
            (x, y) => this.setSketchParameters(x - 0.5, y - 0.5),
            _ => this.setSketchParameters(0, 0)
        );

        svg.setAttributeNS(null, "viewBox", "-0.5 -0.5 1 1"); // 1x1 meters

        this.gravityArrow = svg.querySelector("#gravity");
        this.inertiaArrow = svg.querySelector("#inertia");
        this.frictionArrow = svg.querySelector("#friction");
        
        this.rect = svg.querySelector("rect");
        this.active = true;
        this.previousTimestamp = performance.now();
        this.cursor = {
            x: 0, y: 0, vx: 0, vy: 0, ax: 0, vy: 0, newX: 0, newY: 0,
        }
        this.geometry = {
            b: 0.18, h: 0.30, offset: 0.05, angle: 0, angularVelocity: 0,
        }
        this.physics = {
            mass: 0.2,
            gravity: 9.8,
            mu: 0.2,
        }
        this.physics.inertiaMoment =
            this.physics.mass * (this.geometry.b ** 2 + this.geometry.h ** 2) / 12
            + this.physics.mass * (this.geometry.h / 2 - this.geometry.offset) ** 2;

        el.appendChild(svg);
        el.appendChild(infobox);
        this.rect.setAttributeNS(null, "width", this.geometry.b);
        this.rect.setAttributeNS(null, "height", this.geometry.h);
        this.setSketchParameters(0, 0);

        requestAnimationFrame(this.animationFrame.bind(this));
    }
    makeSolution(el) {
        el.innerHTML = `<img></img>`;
    }
    setSketchParameters(x, y) {
        this.rect.setAttributeNS(null, "x", x - this.geometry.b / 2);
        this.rect.setAttributeNS(null, "y", y - this.geometry.offset);
        this.cursor.newX = x;
        this.cursor.newY = y;
    }
    animationFrame(timestamp) {
        const dt = (1 + timestamp - this.previousTimestamp) / 1000; // seconds
        this.previousTimestamp = timestamp;

        const dx = this.cursor.newX - this.cursor.x;
        const dy = this.cursor.newY - this.cursor.y;

        this.cursor.ax = (dx / dt - this.cursor.vx) / dt;
        this.cursor.ay = (dy / dt - this.cursor.vy) / dt;

        this.cursor.vx = dx / dt;
        this.cursor.vy = dy / dt;

        this.cursor.x = this.cursor.newX;
        this.cursor.y = this.cursor.newY;
        
        const FinX = -this.physics.mass * this.cursor.ax;
        const FinY = -this.physics.mass * this.cursor.ay;

        const centerOffset = this.geometry.h / 2 - this.geometry.offset;
        const massCenterX = this.cursor.x + centerOffset * Math.cos(this.geometry.angle);
        const massCenterY = this.cursor.y + centerOffset * Math.sin(this.geometry.angle);

        const k = 1 / 10;
        this.inertiaArrow.setAttributeNS(null, "x1", massCenterX);
        this.inertiaArrow.setAttributeNS(null, "y1", massCenterY);
        this.inertiaArrow.setAttributeNS(null, "x2", massCenterX + FinX * k);
        this.inertiaArrow.setAttributeNS(null, "y2", massCenterY + FinY * k);

        const FgravX = 0;
        const FgravY = this.physics.mass * this.physics.gravity;

        this.gravityArrow.setAttributeNS(null, "x1", massCenterX);
        this.gravityArrow.setAttributeNS(null, "y1", massCenterY);
        this.gravityArrow.setAttributeNS(null, "x2", massCenterX + FgravX * k);
        this.gravityArrow.setAttributeNS(null, "y2", massCenterY + FgravY * k);

        const R1X = FinX + FgravX;
        const R1Y = FinY + FgravY;
        const R1 = Math.sqrt(R1X ** 2 + R1Y ** 2);
        const R1A = Math.atan2(R1Y, R1X);

        const N = R1 * Math.cos(R1A - this.geometry.angle);
        const Ffr = this.physics.mu * Math.abs(N);
        const FfrA = this.geometry.angle + ((this.geometry.angularVelocity > 0) ? (-Math.PI/2) : (+Math.PI/2));
        const FfrX = Ffr * Math.cos(FfrA);
        const FfrY = Ffr * Math.sin(FfrA);

        this.frictionArrow.setAttributeNS(null, "x1", massCenterX);
        this.frictionArrow.setAttributeNS(null, "y1", massCenterY);
        this.frictionArrow.setAttributeNS(null, "x2", massCenterX + FfrX * k);
        this.frictionArrow.setAttributeNS(null, "y2", massCenterY + FfrY * k);

        const R2X = R1X + FfrX;
        const R2Y = R1Y + FfrY;
        const R2 = Math.sqrt(R2X ** 2 + R2Y ** 2);
        const R2A = Math.atan2(R2Y, R2X);

        const M = R2 * centerOffset * Math.sin(R2A - this.geometry.angle);

        this.geometry.angularVelocity += M / this.physics.inertiaMoment * dt;
        this.geometry.angle += this.geometry.angularVelocity * dt;

        this.rect.setAttribute("transform", `
            rotate(${180 / Math.PI * (this.geometry.angle - Math.PI / 2)}
            ${this.cursor.x} ${this.cursor.y})
        `);

        this.updateSketchSVGInfo(this.infoboxHash, {
            "dt": this.round(dt, 4), "angle": this.degrees(this.geometry.angle, 3),
            "cursor x": this.round(this.cursor.x, 3),
            "cursor y": this.round(this.cursor.y, 3),
            "cursor velocity x": this.round(this.cursor.vx, 3),
            "cursor velocity y": this.round(this.cursor.vy, 3),
            "angular velocity": this.round(this.geometry.angularVelocity, 3),
        });

        this.active && requestAnimationFrame(this.animationFrame.bind(this));
    }
    delte() {
        this.active = false;
    }
}