class Problem1 extends Problem {
    makeCondition() {
        this.conditionContainer.innerHTML = `
            <p>При написании страницы "Колесо Фортуны" возникла задача вставки изображений
            в секторы колеса. Прямоугольное изображение вписывается в сектор так, что два
            соседних угла изображения касаются двух прямых сектора, а остальные два угла касаются
            дуги сектора. Получившаяся фигура имеет биссектрису сектора как ось симметрии.</p>
            <p>При известных центральном угле сектора и пропорции изображения, необходимо найти
            угол между биссектрисой сектора и линией, соединяющей центр круга с одной из точек
            соприкосновения прямоугольника изображения с частью окружности.</p>
        `;
    }
    makeSketch() {
        this.sketchContainer.innerHTML = `
            <svg width="100%" height="100%" viewBox="-50 -50 100 100">
                <path fill="lightGray" stroke="black" stroke-width="0.3"/>
                <rect fill="gray" stroke="black" stroke-width="0.3"></rect>
            </svg>
        `;
        this.svg = this.sketchContainer.querySelector("svg");
        this.sector = this.sketchContainer.querySelector("path");
        this.rect = this.sketchContainer.querySelector("rect");

        this.svg.addEventListener("mousemove", e => {
            const brect = this.svg.getBoundingClientRect();
            const angle = (e.clientX - brect.left) / (brect.right - brect.left) * 2 * Math.PI;
            const ratio = 1 / (1 - (e.clientY - brect.top) / (brect.bottom - brect.top)) - 1;
            this.setSketchParameters(angle, ratio);
        });
        this.svg.addEventListener("mouseleave", _ => {
            this.setSketchParameters(Math.PI/3, 0.8);
        });

        this.setSketchParameters(Math.PI/3, 0.8);
    }
    makeSolution() {
        const img = document.createElement("img");
        img.src = "./problem1/proof.jpg";
        this.solutionContainer.appendChild(img);
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
        const tg1 = ratio;
        const tg2 = Math.tan(Math.min(angle, Math.PI) / 2);
        const beta = Math.atan((tg1 * tg2) / (tg1 + tg2));
        
        const width = 2 * r * Math.sin(beta);
        const height = width / ratio / 2;

        this.rect.setAttributeNS(null, "width", width);
        this.rect.setAttributeNS(null, "height", height);
        this.rect.setAttribute("transform", `
            translate(${r * Math.cos(beta + angle/2)} ${-r * Math.sin(beta + angle/2)})
            rotate(${(-angle + Math.PI) / 2 * 180 / Math.PI})
        `);
    }
}