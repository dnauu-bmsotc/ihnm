"use strict"

class PentagonalTilingType5 {
    constructor({size1, size2, angle, nLayers}) {
        this.parameters = {
            s1: size1,
            s2: size2,
            a: angle,
            n: nLayers
        };
        this.cells = [];
        this.createTiling();
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
    pushPointTowards(arr, distance, angle) {
        arr.push({
            x: arr[arr.length - 1].x + distance * this.cos(angle),
            y: arr[arr.length - 1].y + distance * this.sin(angle)
        });
    }
    createSingleTile() {
        const points = [{x: 0, y: 0}];
        const p = this.parameters;
        const v = Math.sqrt(p.s1**2 + p.s2**2 - 2*p.s1*p.s2*this.cos(p.a - 60));
        const u = this.asin(p.s1 / v * this.sin(p.a - 60)) + 30;
        this.pushPointTowards(points, p.s1, 0);
        this.pushPointTowards(points, p.s2, p.a - 180);
        this.pushPointTowards(points, v / Math.sqrt(3), p.a + u - 360);
        this.pushPointTowards(points, v / Math.sqrt(3), p.a + u - 420);
        return points;
    }
    createPrimitiveCell(x, y) {
        const cell = {
            x: x,
            y: y,
            tiles: []
        };
        const p = this.parameters;
        const v = Math.sqrt(p.s1**2 + (p.s2/2)**2 - 2*p.s1*(p.s2/2)*this.cos(p.a));
        const r = this.asin((p.s2/2) / v * this.sin(p.a));
        for (let rotation = 0; rotation < 360; rotation += 60) {
            cell.tiles.push(this.createSingleTile());
            cell.tiles[cell.tiles.length - 1].transform = {
                rotate: rotation + r
            };
        }
        return cell;
    }
    createTiling() {
        const p = this.parameters;
        const s = 6 * (p.s1**2*Math.sqrt(3)/4 + 1/2*p.s1*p.s2*this.sin(p.a-60) + Math.sqrt(3)/12*(p.s1**2+p.s2**2-2*p.s1*p.s2*this.cos(p.a-60)));
        const step = Math.pow(108, 1/4)/3*Math.sqrt(s);
        this.cells.push(this.createPrimitiveCell(0, 0));
        for (let layer = 1; layer < p.n; layer++) {
            for (let angle = 0; angle < 360; angle += 60) {
                for (let i = 0; i < layer; i++) {
                    this.cells.push(this.createPrimitiveCell(
                        layer*step*this.cos(angle) + i*step*this.cos(angle + 120),
                        layer*step*this.sin(angle) + i*step*this.sin(angle + 120)
                    ));
                }
            }
        }
    }
    deployAtSVG(svgcanvas, x, y, tileStyle) {
        for (let cell of this.cells) {
            cell.el = document.createElementNS("http://www.w3.org/2000/svg", "g");
            for (let tile of cell.tiles) {
                tile.el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                for (let point of tile) {
                    const p = svgcanvas.createSVGPoint();
                    p.x = point.x;
                    p.y = point.y;
                    tile.el.points.appendItem(p);
                    for (let k in tileStyle) {
                        tile.el.style[k]=tileStyle[k];
                    }
                }
                tile.el.setAttribute("transform", `rotate(${tile.transform.rotate})`);
                cell.el.appendChild(tile.el);
                tile.animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                tile.el.appendChild(tile.animate);
            }
            cell.el.setAttribute("transform", `translate(${x + cell.x}, ${y + cell.y})`);
            svgcanvas.appendChild(cell.el);
            cell.animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            cell.el.appendChild(cell.animate);
        }
    }
    // animate(size1, size2, angle, callback) {
    //     this.cells = [];
    //     this.parameters.s1 = size1;
    //     this.parameters.s2 = size2;
    //     this.parameters.a = angle;
    //     this.createTiling();
    //     for (let cell of this.cells) {
    //         const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    //         animate.attributeName = "transform";
    //         animate.from = cell.transform;
    //         animate.to = `translate(${0}, ${0})`;
    //         cell.animate.replaceWith(animate);
    //     }
    // }
}