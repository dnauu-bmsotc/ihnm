class Problem2 extends Problem {
    constructor() {
        super();
    }
    makeCondition(el) {
        el.innerHTML = `
            <p>Пятиугольный паркет — в геометрии: замощение, составленное из выпуклых
            пятиугольников. Предполагается, что существует всего 15 классов пятиугольников,
            бесконечные паркеты из которых могут замостить плоскость [www.wikipedia.org, 2023].
            Один из таких пятиугольных паркетов используется на странице "Калейдоскоп".</p>

            <img src="./problem2/tiling.png"></img>

            <p>Схема одного из классов изображена на рисунке. Для данных пятиугольников
            выполняются следующие равенства: a = b; d = e; A = 60 градусов; D = 120 градусов.
            Пусть даны все углы и площадь плитки. Необходимо найти скалярные размеры плитки.</p>
        `;
    };
    makeSketch(el) {
        const [infobox, infoboxHash] = this.createSketchSVGInfo([
            "E", "B", "C", "Area (init)", "Area (calc)", "c", "n", "m"
        ]);
        this.infoboxHash = infoboxHash;

        const svg = this.createSketchSVG(`
            <polygon class="p2-odz" style="${this.stdsRed}" points="-50,50 50,-50 50,50"/>
            <g class="p2-petal">
                <polygon class="p2-base" style="${this.stdsDark}"/>
                <polygon class="p2-120" style="${this.stdsLight}"/>
                <polygon class="p2-60" style="${this.stdsLight}"/>
            </g>
        `,
        (x, y) => this.setSketchParameters(x*Math.PI, y*Math.PI),
        _ => this.setSketchParameters(Math.PI/3, Math.PI/2));

        this.triangle_base = svg.querySelector(".p2-base");
        this.triangle_120 = svg.querySelector(".p2-120");
        this.triangle_60 = svg.querySelector(".p2-60");

        el.appendChild(svg);
        el.appendChild(infobox);
        this.setSketchParameters(Math.PI/3, Math.PI/2);
    };
    makeSolution(el) {
        el.innerHTML = `
            <p>Рассмотрим пятиугольник ABCDE. Треугольник ABE является правильным
            и его площадь может быть посчитана по стороне m. Треугольник CDE является
            равнобедренным с боковыми углами по 30 градусов и его площадь может быть
            посчитана по стороне n.</p>
            <img src="./problem2/tile.png" style="width:16em">
            <p>Треугольники ABE и CDE могут быть исключены из задачи без ограничения общности.
            Таким образом, задача сводится к решению треугольника BCE, в котором известны все углы,
            а площадь связана со сторонами треугольника уравнением S = k1 - k2*m**2 - k3*n**2,
            где k1 - площадь пятиугольника.</p>
            <img src="./problem2/proof.png">
        `;
    };
    setSketchParameters(B, C, S=500) {
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
        const n = m * Math.sin(B) / Math.sin(C);
        const c = m * Math.sin(E) / Math.sin(C);

        if (E > 0) {
            this.drawPetal(E, B, C, c, n, m);
        }
        else {
            this.drawNothing();
        }

        this.updateSketchSVGInfo(this.infoboxHash, {
            "E": this.degrees(E, 3), "B": this.degrees(B, 3), "C": this.degrees(C, 3),
            "Area (init)": S, "Area (calc)": 1/2*m*n*Math.sin(E) + k2*(n**2) + k3*(m**2),
            "c": this.round(c, 4), "n": this.round(n, 4), "m": this.round(m, 4)
        });
    }
    drawPetal(A, B, C, a, b, c) {
        const t60 = this.calcTriangle(0, 20, 2*Math.PI/3, c, -Math.PI/3, c);
        const tbase = this.calcTriangle(...t60[1], 0, c, B, a);
        const t120 = this.calcTriangle(...t60[1], A, b, Math.PI/6, b/2/Math.cos(Math.PI/6));

        this.triangle_base.setAttributeNS(null, "points", this.points2Path(tbase));
        this.triangle_120.setAttributeNS(null, "points", this.points2Path(t120));
        this.triangle_60.setAttributeNS(null, "points", this.points2Path(t60));
    }
    drawNothing() {
        this.triangle_base.setAttributeNS(null, "points", "0,0 0,0 0,0");
        this.triangle_120.setAttributeNS(null, "points", "0,0 0,0 0,0");
        this.triangle_60.setAttributeNS(null, "points", "0,0 0,0 0,0");
    }
}