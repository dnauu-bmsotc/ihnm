register("Прямоугольник в секторе", async _ => {
    const p = new Problem();

    const wheelOfFortunePageInfo = ihnmGetPageById(await ihnmPagesInfo(), "10");

    p.dom.condition.innerHTML = `
    <p>При написании страницы
    "<a href="${ihnmGetPageAbsolutePath(wheelOfFortunePageInfo)}">${wheelOfFortunePageInfo.name}</a>"
    возникла задача вставки изображений в секторы колеса.
    Прямоугольное изображение симметрично вписывается в сектор так, чтобы его верхнаяя сторона касалась дуги окружности.</p>
    <p>При известных центральном угле сектора и пропорции сторон изображения
    необходимо найти такой центральный угол, который опирается на точки соприкосновения прямоугольника и дуги.</p>
    `;

    p.createSVGSketch().innerHTML = `
        <path style="${p.stdsLight}"/>
        <rect style="${p.stdsDark}"></rect>
    `;

    p.dom.solution.innerHTML = `
        <img src="./problem1/proof.jpg"></img>
    `;

    const sector = p.dom.sketchSVG.querySelector("path");
    const rect = p.dom.sketchSVG.querySelector("rect");

    p.addSVGSketchHoverListener((x, y) => setSketchParameters(x * 2*Math.PI, 1/(1-y) - 1));
    p.addSVGSketchLeaveListener(() => setSketchParameters(Math.PI/3, 0.8), true);

    function setSketchParameters(angle, ratio, r=40) {
        sector.setAttributeNS(null, "d", p.createSectorPath(0, angle, r));
        calculateRect(angle, ratio, r);
    }

    function calculateRect(angle, ratio, r) {
        const tg1 = ratio / 2;
        const tg2 = Math.tan(Math.min(angle, Math.PI) / 2);
        const beta = Math.atan((tg1 * tg2) / (tg1 + tg2));
        
        const width = Math.max(0, 2 * r * Math.sin(beta));
        const height = width / ratio;

        rect.setAttributeNS(null, "width", width);
        rect.setAttributeNS(null, "height", height);
        rect.setAttribute("transform", `
            translate(${r * Math.cos(beta + angle/2)} ${-r * Math.sin(beta + angle/2)})
            rotate(${(-angle + Math.PI) / 2 * 180 / Math.PI})
        `);

        p.setSketchSVGInfo(new Map([
            ["angle (deg)", degrees(angle, 4)],
            ["ratio (h/w)", round(ratio, 4)],
            ["beta (deg)", degrees(beta, 4)],
        ]));
    }
});
