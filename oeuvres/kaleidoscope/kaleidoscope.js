"use strict"

class Kaleidoscope {
    constructor(svgCanvas, leversContainer, ns, speed) {
        this.svg = svgCanvas;
        this.leversContainer = leversContainer;
        this.ns = ns;
        this.speed = speed;
        this.cell = null;
        this.levers = [];
        this.activeLever = null;
        this.reset();
    }
    reset() {
        this.svg.innerHTML = "";
        this.cell && this.cell.delete();
        this.cell = null;

        for (let lever of this.levers) {
            lever.delete();
        }
        this.levers = [];

        const defs = document.createElementNS(this.ns, "defs");
        this.svg.appendChild(defs);
    }
    createPattern(id, width, height, styles) {
        const pattern = document.createElementNS(this.ns, "pattern");
        pattern.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
        pattern.setAttributeNS(null, "viewBox", "-50 -50 100 100");
        pattern.setAttributeNS(null, "width", width);
        pattern.setAttributeNS(null, "height", height);
        pattern.setAttributeNS(null, "id", id);
        this.cell.deploy(pattern, this.ns, styles);
        this.svg.querySelector("defs").appendChild(pattern);
    }
    createBG(id, x, y) {
        const bg = document.createElementNS(this.ns, "rect");
        bg.setAttributeNS(null, "x", -x);
        bg.setAttributeNS(null, "y", -y);
        bg.setAttributeNS(null, "width", 100);
        bg.setAttributeNS(null, "height", 100);
        bg.setAttributeNS(null, "fill", `url(#${id})`);
        bg.setAttributeNS(null, "transform", `translate(${x} ${y})`);
        this.svg.appendChild(bg);
    }
    setTiling(type) {
        this.reset();
        switch(type) {
            case "pentagonal":
                this.levers.push(new Lever(this.leversContainer, "leverpattern", this.ns, this.speed));
                this.levers[0].setImage("./images/img9.jpg");
                this.activeLever = this.levers[0];

                this.cell = new PentagonalCellType5(100/6, 100/6, 180);
                const size = 50;
                const width = size, height = size * Math.sqrt(3);
                this.createPattern("pentapattern", width, height, {
                    "fill": "url(#leverpattern)", "stroke": "white", "stroke-width": "1",
                });
                this.createBG("pentapattern", 0, 0);
                this.createBG("pentapattern", width/2, 0);
                this.createBG("pentapattern", width/2 - width/4, height*1/4);
                this.createBG("pentapattern", width/2 + width/4, height*1/4);
                this.createBG("pentapattern", width/2, height*2/4);
                this.createBG("pentapattern", width, height*2/4);
                this.createBG("pentapattern", width/2 - width/4, height*3/4);
                this.createBG("pentapattern", width/2 + width/4, height*3/4);
                break;
            case "square":
                break;
            case "kisrhombille":
                break;
            default:
                console.log("invalid tiling type");
        }
        this.svg.dispatchEvent(new Event("sharpChange"));
    }
    setImage(href) {
        if (this.activeLever) {
            this.activeLever.setImage(href);
            this.svg.dispatchEvent(new Event("sharpChange"));
        }
    }
    setSpeed(value) {
        for (let lever of this.levers) {
            lever.setSpeed(Number(value));
        }
    }
}