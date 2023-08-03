register("Пятиугольный паркет", _ => {
    const p = new Problem();

    p.dom.condition.innerHTML = `
    <p>Пятиугольный паркет — в геометрии: замощение, составленное из выпуклых
    пятиугольников. Предполагается, что существует всего 15 классов пятиугольников,
    бесконечные паркеты из которых могут замостить плоскость [www.wikipedia.org, 2023].
    Один из таких пятиугольных паркетов используется на странице "Калейдоскоп".</p>

    <img src="./problem2/tiling.png"></img>

    <p>Схема одного из классов изображена на рисунке. Для данных пятиугольников
    выполняются следующие равенства: a = b; d = e; A = 60 градусов; D = 120 градусов.
    Пусть даны все углы и площадь плитки. Необходимо найти скалярные размеры плитки.</p>
    `;

    p.createSVGSketch().innerHTML = `
        <polygon class="p2-odz" style="${p.stdsRed}" points="-50,50 50,-50 50,50"/>
        <g class="p2-petal">
            <polygon class="p2-base" style="${p.stdsDark}"/>
            <polygon class="p2-120" style="${p.stdsLight}"/>
            <polygon class="p2-60" style="${p.stdsLight}"/>
        </g>
    `;

    p.dom.solution.innerHTML = `
    <p>Рассмотрим пятиугольник ABCDE. Треугольник ABE является правильным
    и его площадь может быть посчитана по стороне m. Треугольник CDE является
    равнобедренным с боковыми углами по 30 градусов и его площадь может быть
    посчитана по стороне n.</p>
    <img src="./problem2/tile.png">
    <p>Треугольники ABE и CDE могут быть исключены из задачи без ограничения общности.
    Таким образом, задача сводится к решению треугольника BCE, в котором известны все углы,
    а площадь связана со сторонами треугольника уравнением S = k1 - k2*m**2 - k3*n**2,
    где k1 - площадь пятиугольника.</p>
    <img src="./problem2/proof.png">
    `;

    const triangle_base = p.dom.sketchSVG.querySelector(".p2-base");
    const triangle_120 = p.dom.sketchSVG.querySelector(".p2-120");
    const triangle_60 = p.dom.sketchSVG.querySelector(".p2-60");

    p.addSVGSketchHoverListener((x, y) => setSketchParameters(x*Math.PI, y*Math.PI));
    p.addSVGSketchLeaveListener(() => setSketchParameters(Math.PI/3, Math.PI/2), true);

    function setSketchParameters(B, C, S=500) {
        const k1 = S;
        const k2 = Math.sqrt(3) / 12;
        const k3 = Math.sqrt(3) / 4;
        const E = Math.PI - B - C;

        const sE = Math.sin(E);
        const cE = Math.cos(E);
        const sB = Math.sin(B);
        const cB = Math.cos(B);
        const sC = Math.sin(C);
        const cC = Math.cos(C);
        const lambda = 2*k2*(sB**2)/(sC**2) + 2*k3 + sE*cE + (sE**2)/sC*cC;

        const m = Math.sqrt(2*k1 / lambda);
        const n = m * sB / sC;
        const c = m * sE / sC;

        if (E > 0) {
            drawPetal(E, B, C, c, n, m);
        }
        else {
            drawNothing();
        }

        p.setSketchSVGInfo(new Map([
            ["E", this.degrees(E, 3)],
            ["B", this.degrees(B, 3)],
            ["C", this.degrees(C, 3)],
            ["Area (init)", S],
            ["Area (calc)", 1/2*m*n*sE + k2*(n**2) + k3*(m**2)],
            ["c", this.round(c, 4)],
            ["n", this.round(n, 4)],
            ["m", this.round(m, 4)]
        ]));
    }

    function drawPetal(A, B, C, a, b, c) {
        const t60 = p.createTrianglePoints(0, 20, 2*Math.PI/3, c, -Math.PI/3, c);
        const tbase = p.createTrianglePoints(...t60[1], 0, c, B, a);
        const t120 = p.createTrianglePoints(...t60[1], A, b, Math.PI/6, b/2/Math.cos(Math.PI/6));

        triangle_base.setAttributeNS(null, "points", tbase.map(p => p.join(",")).join(" "));
        triangle_120.setAttributeNS(null, "points", t120.map(p => p.join(",")).join(" "));
        triangle_60.setAttributeNS(null, "points", t60.map(p => p.join(",")).join(" "));
    }

    function drawNothing() {
        triangle_base.setAttributeNS(null, "points", "0,0 0,0 0,0");
        triangle_120.setAttributeNS(null, "points", "0,0 0,0 0,0");
        triangle_60.setAttributeNS(null, "points", "0,0 0,0 0,0");
    }
});