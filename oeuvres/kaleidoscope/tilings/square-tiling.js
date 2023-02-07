class SquareTiling {
    constructor({size, nLayers}) {
        this.parameters = {
            l: size,
            n: nLayers
        };
        this.initCells();
        this.calculateTiling();
    }
    initCells() {
        this.cells = Array.from(
            {length: this.parameters.n ** 2}, _ => Array.from(
                {length: 4}, _ => ({x: 0, y: 0})
            )
        );
    }
    calculatePrimitiveCell(cell, x, y, even) {
        const a = 0, b = this.parameters.l;
        cell[0].x = +a; cell[0].y = +a;
        cell[1].x = +b; cell[1].y = +a;
        cell[2].x = +b; cell[2].y = +b;
        cell[3].x = +a; cell[3].y = +b;
        cell.x = x;
        cell.y = y;
        cell.even = even;
        cell.transform = {rotate: 180 * cell.even};
    }
    calculateTiling() {
        const n = this.parameters.n;
        const l = this.parameters.l;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                this.calculatePrimitiveCell(this.cells[i*n + j], i*l, j*l, (i+j)%2);
            }
        }
    }
    deployAtSVG(svgcanvas, x, y, cellStyle1, cellStyle2, ns) {
        this.ns = ns || "http://www.w3.org/2000/svg";
        this.canvas = svgcanvas;
        this.cells.x = x;
        this.cells.y = y;
        const p = this.parameters;
        for (let cell of this.cells) {
            cell.el = document.createElementNS(this.ns, "polygon");
            for (let point of cell) {
                const p = svgcanvas.createSVGPoint();
                p.x = point.x;
                p.y = point.y;
                cell.el.points.appendItem(p);
            }
            const cellStyle = cell.even ? cellStyle1 : cellStyle2;
            for (let k in cellStyle) {
                cell.el.style[k]=cellStyle[k];
            }
            cell.el.setAttributeNS(null, 'transform', `
                translate(${x + cell.x - p.l*(p.n-1)/2} ${y + cell.y - p.l*(p.n-1)/2})
                rotate(${cell.transform.rotate})
                translate(${-p.l/2} ${-p.l/2})
            `);
            this.canvas.appendChild(cell.el);
        }
    }
    delete() {
        for (let cell of this.cells) {
            cell.el.remove();
        }
    }
}