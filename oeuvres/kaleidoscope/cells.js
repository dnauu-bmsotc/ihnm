"use strict"

function cos(degrees) {
    return Math.cos(degrees / 180 * Math.PI);
}

function sin(degrees) {
    return Math.sin(degrees / 180 * Math.PI);
}

function asin(sin) {
    return Math.asin(sin) / Math.PI * 180;
}

// All classes have the same interface:
// - cell can be deployed into an svg container width deploy method.
// - cell parameters can be changed width calculate method. Can be called before deployment.
// - svg can be updated width updateSVG method
// class Cell {
//     calculate(parameters)
//     deploy(container, ns, tileStyle)
//     updateSVG()
//     delete()
// }

// this cell is a 6x5 matrix of points. 6 petals each of which consists of 5 points.
// initial parameters form the constArea, which is saved when parameters are changed via scale transform.
class PentagonalCellType5 {
    constructor(s1, s2, a) {
        this.tiles = Array.from(
            {length: 6}, _ => Array.from(
                {length: 5}, _ => ({x: 0, y: 0})
            )
        );
        this.calculate(s1, s2, a);
        this.constArea = this.computeArea(s1, s2, a);
        this.s1Animation = new SliderAnimation(val => {
            this.s1 = 10 + 10 * val;
        }, 200);
        this.aAnimation = new SliderAnimation(val => {
            this.a = 90 + 150 * val;
            this.calculate(this.s1, this.s2, this.a);
            this.updateSVG();
        }, 200);
    }
    calculateFurtherPoint(arr, ind, distance, angle) {
        arr[ind].x = arr[ind - 1].x + distance * cos(angle);
        arr[ind].y = arr[ind - 1].y - distance * sin(angle);
    }
    calculateTile(tile, s1, s2, a, baseOf120Triangle, angleBefore120Triangle) {
        tile[0].x = tile[0].y = 0;
        this.calculateFurtherPoint(tile, 1, s1, 0);
        this.calculateFurtherPoint(tile, 2, s2, a - 180);
        this.calculateFurtherPoint(tile, 3, baseOf120Triangle / Math.sqrt(3), a + angleBefore120Triangle);
        this.calculateFurtherPoint(tile, 4, baseOf120Triangle / Math.sqrt(3), a + angleBefore120Triangle - 60);
    }
    calculate(s1, s2, a) {
        this.s1 = s1;
        this.s2 = s2;
        this.a = a;
        const baseOf120Triangle = Math.sqrt(s1**2 + s2**2 - 2*s1*s2*cos(a-60));
        const angleBefore120Triangle = asin(s1 / baseOf120Triangle * sin(a-60)) + 30;
        const r = this.computeAdditionalRotation(s1, s2, a);
        for (let i = 0; i < 6; i++) {
            this.calculateTile(this.tiles[i], s1, s2, a, baseOf120Triangle, angleBefore120Triangle);
            this.tiles[i].rotation = i * 60 - r;
        }
    }
    deploy(container, ns, tileStyle) {
        this.el = document.createElementNS(ns, "g");
        for (let tile of this.tiles) {
            tile.el = document.createElementNS(ns, "polygon");
            for (let k in tileStyle) {
                tile.el.style[k]=tileStyle[k];
            }
            this.el.appendChild(tile.el);
        }
        container.appendChild(this.el);

        this.updateSVG();
    }
    computeArea(s1, s2, a) {
        const part1 = 2 * Math.sqrt(3) * s1**2;
        const part2 = 3 * s1*s2*sin(a - 60);
        const part3 = -Math.sqrt(3) * s1 * s2 * cos(a-60);
        const part4 = Math.sqrt(3) * s2**2 / 2;
        return part1 + part2 + part3 + part4;
    }
    computeAdditionalRotation(s1, s2, a) {
        // additional rotation is needed to combine two tiles
        const v = Math.sqrt(s1**2 + (s2/2)**2 - 2*s1*(s2/2)*cos(a));
        return asin(s2*sin(a) / (2*v));
    }
    updateSVG() {
        for (let tile of this.tiles) {
            const points = tile.map(p => p.x + "," + p.y).join(" ");
            tile.el.setAttributeNS(null, "points", points);
            tile.el.setAttributeNS(null, "transform", `rotate(${tile.rotation})`);
        }
        const scale = Math.sqrt(this.constArea / this.computeArea(this.s1, this.s2, this.a));
        this.el.setAttributeNS(null, "transform", `scale(${scale})`);
    }
    delete() {
        this.s1Animation.delete();
        this.aAnimation.delete();
        this.el.remove();
    }
}

class SquareCell {
    constructor(size) {
        this.tiles = Array.from(
            {length: 1}, _ => Array.from(
                {length: 4}, _ => ({x: 0, y: 0})
            )
        );
        this.calculate(size);
    }
    calculate(size) {
        this.tiles[0][0].x = 0;
        this.tiles[0][0].y = 0;

        this.tiles[0][1].x = size;
        this.tiles[0][1].y = 0;

        this.tiles[0][2].x = size;
        this.tiles[0][2].y = size;

        this.tiles[0][3].x = 0;
        this.tiles[0][3].y = size;
    }
    deploy(container, ns, tileStyle) {
        this.el = document.createElementNS(ns, "g");
        for (let tile of this.tiles) {
            tile.el = document.createElementNS(ns, "polygon");
            for (let k in tileStyle) {
                tile.el.style[k]=tileStyle[k];
            }
            this.el.appendChild(tile.el);
        }
        container.appendChild(this.el);

        this.updateSVG();
    }
    updateSVG() {
        for (let tile of this.tiles) {
            const points = tile.map(p => p.x + "," + p.y).join(" ");
            tile.el.setAttributeNS(null, "points", points);
        }
    }
    delete() {
        this.el.remove();
    }
}

class KisrhombilleCell {
    constructor(size) {
        this.tiles = Array.from(
            {length: 12}, _ => Array.from(
                {length: 3}, _ => ({x: 0, y: 0})
            )
        );
        this.calculate(size);
    }
    calculateTile(tile, size) {
        tile[0].x = 0;
        tile[0].y = 0;
        tile[1].x = size*cos(30);
        tile[1].y = 0;
        tile[2].x = size*cos(30);
        tile[2].y = size*sin(30);
    }
    calculate(size) {
        for (let i = 0; i < this.tiles.length; i++) {
            this.calculateTile(this.tiles[i], size);
        }
    }
    deploy(container, ns, tileStyle) {
        this.el = document.createElementNS(ns, "g");
        for (let tile of this.tiles) {
            tile.el = document.createElementNS(ns, "polygon");
            for (let k in tileStyle) {
                tile.el.style[k]=tileStyle[k];
            }
            this.el.appendChild(tile.el);
        }
        container.appendChild(this.el);

        this.updateSVG();
    }
    updateSVG() {
        for (let i = 0; i < this.tiles.length; i++) {
            const points = this.tiles[i].map(p => p.x + "," + p.y).join(" ");
            this.tiles[i].el.setAttributeNS(null, "points", points);
            this.tiles[i].el.setAttributeNS(null, "transform", `
                rotate(${30*i + 30*(i%2)}) scale(1, ${1-2*(i%2)})
            `);
        }
    }
    delete() {
        
    }
}