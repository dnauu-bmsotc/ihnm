"use strict"

class PentagonalTilingType5 {
    constructor({size1, size2, angle, nLayers, ns}) {
        this.parameters = {
            s1: size1,
            s2: size2,
            a: angle,
            n: nLayers
        };
        this.initCells();
        this.calculateTiling();
    }
    initCells() {
        const n = 1 + 6 * this.parameters.n / 2 * (this.parameters.n - 1);
        this.cells = Array.from(
            {length: n}, _ => Array.from(
                {length: 6}, _ => Array.from(
                    {length: 5}, _ => ({x: 0, y: 0})
                )
            )
        );
    }
    cos(degrees) {
        return Math.cos(degrees / 180 * Math.PI);
    }
    sin(degrees) {
        return Math.sin(degrees / 180 * Math.PI);
    }
    asin(sin) {
        return Math.asin(sin) / Math.PI * 180;
    }
    calculateNextPoint(arr, ind, distance, angle) {
        arr[ind].x = arr[ind - 1].x + distance * this.cos(angle);
        arr[ind].y = arr[ind - 1].y + distance * this.sin(angle);
    }
    calculateSingleTile(tile) {
        const p = this.parameters;
        const v = Math.sqrt(p.s1**2 + p.s2**2 - 2*p.s1*p.s2*this.cos(p.a-60));
        const u = this.asin(p.s1 / v * this.sin(p.a-60)) + 30;
        tile[0].x = tile[0].y = 0;
        this.calculateNextPoint(tile, 1, p.s1, 0);
        this.calculateNextPoint(tile, 2, p.s2, p.a - 180);
        this.calculateNextPoint(tile, 3, v / Math.sqrt(3), p.a + u);
        this.calculateNextPoint(tile, 4, v / Math.sqrt(3), p.a + u - 60);
    }
    calculatePrimitiveCell(cell, x, y) {
        cell.x = x;
        cell.y = y;
        const p = this.parameters;
        const v = Math.sqrt(p.s1**2 + (p.s2/2)**2 - 2*p.s1*(p.s2/2)*this.cos(p.a));
        // r - rotation needed to combine two tiles
        const r = this.asin(p.s2*this.sin(p.a) / (2*v));
        for (let i = 0; i < 6; i++) {
            this.calculateSingleTile(cell[i]);
            cell[i].transform = {
                rotate: i*60 + r
            };
        }
    }
    calculateTiling() {
        const p = this.parameters;
        const sq3 = Math.sqrt(3);
        // s - square of a single tile
        const s = 2*sq3*p.s1**2 + 3*p.s1*p.s2*this.sin(p.a-60) - sq3*p.s1*p.s2*this.cos(p.a-60) + sq3*p.s2**2/2;
        // step - distance between centers of regular hexagons with squares of s
        const step = Math.pow(108, 1/4)/3*Math.sqrt(s);
        this.calculatePrimitiveCell(this.cells[0], 0, 0);
        let counter = 1;
        for (let layer = 1; layer < p.n; layer++) {
            for (let angle = 0; angle < 360; angle += 60) {
                for (let i = 0; i < layer; i++) {
                    this.calculatePrimitiveCell(
                        this.cells[counter++],
                        layer*step*this.cos(angle) + i*step*this.cos(angle + 120),
                        layer*step*this.sin(angle) + i*step*this.sin(angle + 120)
                    );
                }
            }
        }
    }
    setCellTranslation(cell, tox, toy, duration) {
        cell.animateTransform.setAttribute("from", cell.animateTransform.getAttribute("to"));
        cell.animateTransform.setAttribute("to", `${tox} ${toy}`);
        cell.animateTransform.setAttribute("dur", duration);
    }
    setTilePoints(tile, duration) {
        tile.animate.setAttribute("from", tile.animate.getAttribute("to"));
        tile.animate.setAttribute("to", tile.map(p => `${p.x},${p.y}`).join(" "));
        tile.animate.setAttribute("dur", duration);
        tile.animateTransform.setAttribute("from", tile.animateTransform.getAttribute("to"));
        tile.animateTransform.setAttribute("to", tile.transform.rotate);
        tile.animateTransform.setAttribute("dur", duration);
    }
    createAnimate(attribute) {
        const animate = document.createElementNS(this.ns, "animate");
        animate.setAttribute("attributeName", attribute);
        animate.setAttribute("fill", "freeze");
        return animate;
    }
    createAnimateTransform(attribute) {
        const animate = document.createElementNS(this.ns, "animateTransform");
        animate.setAttribute("attributeName", "transform");
        animate.setAttribute("attributeType", "XML");
        animate.setAttribute("type", attribute);
        animate.setAttribute("fill", "freeze");
        return animate;
    }
    deployAtSVG(svgcanvas, x, y, tileStyle, ns) {
        this.ns = ns || "http://www.w3.org/2000/svg";
        this.canvas = svgcanvas;
        this.cells.x = x;
        this.cells.y = y;
        for (let cell of this.cells) {
            cell.el = document.createElementNS(this.ns, "g");
            for (let tile of cell) {
                tile.el = document.createElementNS(this.ns, "polygon");
                for (let point of tile) {
                    const p = svgcanvas.createSVGPoint();
                    p.x = point.x;
                    p.y = point.y;
                    tile.el.points.appendItem(p);
                    for (let k in tileStyle) {
                        tile.el.style[k]=tileStyle[k];
                    }
                }
                tile.animate = this.createAnimate("points");
                tile.animateTransform = this.createAnimateTransform("rotate");
                this.setTilePoints(tile, "0.1s");
                tile.el.appendChild(tile.animate);
                tile.el.appendChild(tile.animateTransform);
                cell.el.appendChild(tile.el);
            }
            cell.animateTransform = this.createAnimateTransform("translate");
            this.setCellTranslation(cell, x + cell.x, y + cell.y, "0.1s");
            cell.el.appendChild(cell.animateTransform);
            svgcanvas.appendChild(cell.el);
        }
        this.animate(4, 5, 150, "1s");
        this.loopID = setInterval(() => this.animateRandom({t: 4+1*Math.random()+"s"}), 6000);
    }
    animate(size1, size2, angle, dur, callback) {
        this.endAnimations();
        this.parameters.s1 = size1;
        this.parameters.s2 = size2;
        this.parameters.a = angle;
        this.calculateTiling();
        for (let cell of this.cells) {
            this.setCellTranslation(cell, this.cells.x + cell.x, this.cells.y + cell.y, dur);
            for (let tile of cell) {
                this.setTilePoints(tile, dur);
            }
        }
        this.beginAnimations();
    }
    beginAnimations() {
        const animationElements = this.canvas.querySelectorAll("animate, animateTransform");
        animationElements.forEach(a => a.beginElement());
    }
    endAnimations() {
        const animationElements = this.canvas.querySelectorAll("animate, animateTransform");
        animationElements.forEach(a => a.endElement());
    }
    randomParameter(min, max) {
        return min + Math.random() * (max-min);
    }
    animateRandom({s1, s2, a, t}) {
        this.animate(
            s1 || this.randomParameter(4.5, 5.5),
            s2 || this.randomParameter(3, 6),
            a || this.randomParameter(90, 270),
            t || this.randomParameter(4, 6) + "s",
        );
    }
    delete() {
        this.endAnimations();
        clearInterval(this.loopID);
        for (let cell of this.cells) {
            cell.el.remove();
        }
    }
}