class Problem3 extends Problem {
    makeCondition(el) {
        el.innerHTML = `
            <p>Пятиугольный паркет — в геометрии: замощение, составленное из выпуклых
            пятиугольников. Предполагается, что существует всего 15 классов пятиугольников,
            бесконечные паркеты из которых могут замостить плоскость. [www.wikipedia.org, 2023]</p>

            <img src="./problem3/tiling.png"></img>

            <p>Схема одного из классов изображена на рисунке. Для данных пятиугольников
            выполняются следующие равенства: a = b; d = e; A = 60 градусов; D = 120 градусов.
            Пусть даны b, B и площадь плитки. Необходимо найти c и C. Также нужно определить,
            какие возможны значения b и B.</p>
        `;
    };
    makeSketch(el) {
        const svg = this.createSketchSVG(`
            <polygon></polygon>
        `,
        (x, y) => this.setSketchParameters(x*10, Math.PI/2 + y*Math.PI),
        ______ => this.setSketchParameters(10, Math.PI/6));

        this.polygon = svg.querySelector('polygon');
        
        el.appendChild(svg);
    };
    makeSolution(el) {
        const img = document.createElement("img");
        img.src = "./problem3/proof.png";
        el.appendChild(img);
    };
    setSketchParameters(x, angle) {
        const points = [{x: 0, y: 0}];

        pushPoint = (dx, dy) => {
            points.push({
                x: points[points.length-1].x + dx,
                y: points[points.length-1].y + dy,
            });
        }

        const n = x;

        const s2 = Math.sqrt(3) / 4 * b**2;
        const s1 = Math.sqrt(3) / 12 * n**2;

        pushPoint()

        this.polygon.setAttributeNS(null, "points", "0,0 10,10 -20,10")
    }
}