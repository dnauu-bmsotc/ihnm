class Problem1 extends Problem {
    makeCondition(el) {
        el.innerHTML = `
            <p>При написании страницы "Колесо Фортуны" возникла задача вставки изображений
            в секторы колеса. Прямоугольное изображение вписывается в сектор так, что два
            соседних угла изображения касаются двух прямых сектора, а остальные два угла касаются
            дуги сектора. Получившаяся фигура имеет биссектрису сектора как ось симметрии.</p>
            <p>При известных центральном угле сектора и пропорции изображения, необходимо найти
            угол между биссектрисой сектора и линией, соединяющей центр круга с одной из точек
            соприкосновения прямоугольника изображения с частью окружности.</p>
        `;
    }
    makeSketch(el) {
        const [infobox, infoboxHash] = this.createSketchSVGInfo([
            "angle (deg)", "ratio (h/w)", "beta (deg)"
        ]);
        this.infoboxHash = infoboxHash;

        const svg = this.createSketchSVG(`
            <path style="${this.stdsLight}"/>
            <rect style="${this.stdsDark}"></rect>
        `,
        (x, y) => this.setSketchParameters(x*2*Math.PI, 1/(1-y)-1),
        _ => this.setSketchParameters(Math.PI/3, 0.8));
        
        this.sector = svg.querySelector("path");
        this.rect = svg.querySelector("rect");
        
        el.appendChild(svg);
        el.appendChild(infobox);
        this.setSketchParameters(Math.PI/3, 0.8);
    }
    makeSolution(el) {
        const img = document.createElement("img");
        img.src = "./problem1/proof.jpg";
        el.appendChild(img);
    }
    setSketchParameters(angle, ratio, r=40) {
        this.calculateSector(angle, r);
        this.calculateRect(angle, ratio, r);
    }
    calculateSector(angle, r) {
        this.sector.setAttributeNS(null, "d", `
            M ${r} ${0}
            A ${r} ${r} ${0} ${Number(angle > Math.PI)} ${0} ${r*Math.cos(angle)} ${-r*Math.sin(angle)}
            L ${0} ${0}
            Z
        `);
    }
    calculateRect(angle, ratio, r) {
        const tg1 = ratio / 2;
        const tg2 = Math.tan(Math.min(angle, Math.PI) / 2);
        const beta = Math.atan((tg1 * tg2) / (tg1 + tg2));
        
        const width = 2 * r * Math.sin(beta);
        const height = width / ratio;

        this.rect.setAttributeNS(null, "width", width);
        this.rect.setAttributeNS(null, "height", height);
        this.rect.setAttribute("transform", `
            translate(${r * Math.cos(beta + angle/2)} ${-r * Math.sin(beta + angle/2)})
            rotate(${(-angle + Math.PI) / 2 * 180 / Math.PI})
        `);

        this.updateSketchSVGInfo(this.infoboxHash, {
            "angle (deg)": this.degrees(angle, 4),
            "ratio (h/w)": this.round(ratio, 4),
            "beta (deg)": this.degrees(beta, 4),
        });
    }
}