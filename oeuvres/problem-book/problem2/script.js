class Problem2 extends Problem {
    constructor() {
        super();
    }
    makeCondition(el) {
        el.innerHTML = `
            <p>В треугольнике обозначены углы A, B и C. Стороны, лежащие напротив этих углов,
            обозначены соответственно a, b, c. Известны угол B и прилежащая к нему сторона c.
            Также известно, что площадь треугольника связана со стороной b уравнением S=k1-k2*b^2.
            k1 и k2 известны, но не S или b. Необходимо решить данный треугольник.</p>
        `;
    };
    makeSketch(el) {
        const [infobox, infoboxHash] = this.createSketchSVGInfo([
            "A", "B", "C", "a", "b", "c", "S (set)", "S (calc)", "mu/lambda",
        ]);
        this.infoboxHash = infoboxHash;

        const svg = this.createSketchSVG(`
            <polygon style="fill:lime;stroke:purple;stroke-width:1" />
            <polygon style="fill:none;stroke:purple;stroke-width:1" />
            <polygon style="fill:none;stroke:purple;stroke-width:1" />
        `,
        (x, y) => this.setSketchParameters(x*Math.PI, y*50),
        ______ => this.setSketchParameters(Math.PI/3, 10));

        const polygons = svg.querySelectorAll("polygon");
        this.triangle_base = polygons[0];
        this.triangle_120 = polygons[1];
        this.triangle_60 = polygons[2];

        el.appendChild(svg);
        el.appendChild(infobox);
        this.setSketchParameters(Math.PI/3, 10);
    };
    makeSolution(el) {
        const img = document.createElement("img");
        img.src = "./problem2/proof.png";
        el.appendChild(img);
    };
    setSketchParameters(B, a, S=50) {
        const k1 = S;
        const k2 = Math.sqrt(3) / 12;

        const alpha = a**2*(Math.sin(B)**2);
        const beta = a**2*Math.sin(B)*Math.cos(B) - 2*k1;
        const gamma = 2*k2*(a**2)*(Math.sin(B)**2);

        const xi = alpha/2;
        const eta = -beta/2;
        const mu = -gamma - beta/2;

        const lambda = Math.sqrt(xi**2 + eta**2);

        const A = (Math.asin(mu/lambda) - Math.acos(xi/lambda))/2;
        const C = Math.PI - A - B;
        const b = a*Math.sin(B)/Math.sin(A);
        const c = a*Math.sin(C)/Math.sin(A);

        const points_base = [];
        points_base.push([0, 0]); // A
        points_base.push([ // B
            points_base[0][0] + c,
            points_base[0][1]
        ]);
        points_base.push([ // C
            points_base[0][0] + b*Math.cos(A),
            points_base[0][1] - b*Math.sin(A)
        ]);
        this.triangle_base.setAttributeNS(null, "points", points_base.map(p => p.join(",")).join(" "));

        const points_120 = [];
        points_120.push(points_base[0]);
        points_120.push([
            points_120[points_120.length-1][0] + b/2/Math.cos(Math.PI/6)*Math.cos(A+Math.PI/6),
            points_120[points_120.length-1][1] - b/2/Math.cos(Math.PI/6)*Math.sin(A+Math.PI/6)
        ]);
        points_120.push(points_base[2]);
        this.triangle_120.setAttributeNS(null, "points", points_120.map(p => p.join(",")).join(" "));

        this.updateSketchSVGInfo(this.infoboxHash, {
            "A": this.round(A, 4), "B": this.round(B, 4), "C": this.round(C, 4),
            "a": this.round(a, 4), "b": this.round(b, 4), "c": this.round(c, 4),
            "S (set)": S, "S (calc)": 1/2*a*b*Math.sin(C) + k2*(b**2),
            "mu/lambda": this.round(mu/lambda, 5),
        });
    }
    
    // setSketchParameters(B, a, S=5) {
    //     const k1 = S;
    //     const k2 = - Math.sqrt(3) / 12;

    //     const alpha = 2*k1 / (a*Math.sin(B)) - a*Math.cos(B);
    //     const beta = -a*Math.sin(B);
    //     const gamma = -2*k2;
    //     const lambda = Math.sqrt(alpha**2 + beta**2);

    //     const A = Math.asin(gamma/lambda) - Math.acos(alpha/lambda);
    //     const C = Math.PI - A - B;
    //     const b = a*Math.sin(B)/Math.sin(A);
    //     const c = b*Math.cos(A) + a*Math.cos(B);

    //     const points = [];
    //     points.push([
    //         0,
    //         0
    //     ]);
    //     points.push([
    //         points[points.length-1][0] + b,
    //         points[points.length-1][1]
    //     ]);
    //     points.push([
    //         points[points.length-1][0] + a*Math.cos(C),
    //         points[points.length-1][1] - a*Math.sin(C)
    //     ]);

    //     console.log(S, k1 + k2*b**2, 1/2*a*b*Math.sin(C));
    //     // console.log(Math.round(a), Math.round(b), Math.round(c));
    //     // console.log(A, B, C);

    //     // this.triangle.setAttributeNS(null, "points", points.map(p => p.join(",")).join(" "));
    // }
}