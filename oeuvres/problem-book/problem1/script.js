register("Прямоугольник в секторе", _ => {
    const p = new Problem();

    p.dom.condition.innerHTML = `
    <p>При написании страницы "Колесо Фортуны" возникла задача вставки изображений
    в секторы колеса. Прямоугольное изображение вписывается в сектор так, что два
    угла изображения касаются двух радиусов сектора, а остальные два угла касаются
    дуги сектора.</p>
    <p>При известных центральном угле сектора и пропорции изображения, необходимо найти
    угол между биссектрисой сектора и линией, соединяющей центр круга с одной из точек
    соприкосновения прямоугольника изображения с частью окружности.</p>
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
        
        const width = 2 * r * Math.sin(beta);
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
