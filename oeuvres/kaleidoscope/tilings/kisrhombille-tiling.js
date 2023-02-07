class KisrhombilleTiling {
    constructor({size, nLayers}) {
        this.parameters = {
            l: size,
            n: nLayers
        };
        this.initCells();
        this.calculateTiling();
    }
    initCells() {
        const n = 1 + 6 * this.parameters.n / 2 * (this.parameters.n - 1);
        this.cells = Array.from(
            {length: n}, _ => Array.from(
                {length: 12}, _ => Array.from(
                    {length: 3}, _ => ({x: 0, y: 0})
                )
            )
        );
    }
    calculateSingleTile(tile) {
        const l = this.parameters.l;
        tile[0].x = 0;
        tile[0].y = 0;
        
        tile[1].x = l*Math.cos(Math.PI/6);
        tile[1].y = 0;

        tile[2].x = l*Math.cos(Math.PI/6);
        tile[2].y = l*Math.sin(Math.PI/6);
    }
    calculatePrimitiveCell(cell, x, y) {
        cell.x = x;
        cell.y = y;
        for (let i = 0; i < 12; i++) {
            this.calculateSingleTile(cell[i]);
            cell[i].transform = {
                rotate: (i - (i%2)) * 30,
                scaleY: 1 - 2 * (i % 2)
            };
        }
    }
    cos(degrees) {
        return Math.cos(degrees / 180 * Math.PI);
    }
    sin(degrees) {
        return Math.sin(degrees / 180 * Math.PI);
    }
    calculateTiling() {
        const step = this.parameters.l * 2 * Math.cos(Math.PI/6);
        this.calculatePrimitiveCell(this.cells[0], 0, 0);
        let counter = 1;
        for (let layer = 1; layer < this.parameters.n; layer++) {
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
                }
                for (let k in tileStyle) {
                    tile.el.style[k]=tileStyle[k];
                }
                tile.el.setAttributeNS(null, 'transform', `
                    rotate(${tile.transform.rotate})
                    scale(1,${tile.transform.scaleY})
                `);
                cell.el.appendChild(tile.el);
            }
            cell.el.setAttributeNS(null, 'transform', `
                translate(${x + cell.x} ${y + cell.y})
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