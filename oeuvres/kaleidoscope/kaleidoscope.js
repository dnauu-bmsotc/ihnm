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
        
        requestAnimationFrame(this.animateRotation.bind(this));
    }
    animateRotation(t) {
        this.backgrounds.setAttributeNS(null, "transform", `
            translate(+50 +50)
            rotate(${60 + t/2000})
            translate(-50 -50)
        `);
        requestAnimationFrame(this.animateRotation.bind(this));
    }
    reset() {
        this.svg.innerHTML = "";
        this.cell && this.cell.delete();
        this.cell = null;

        for (let lever of this.levers) {
            lever.delete();
        }
        this.levers = [];
        this.activeLever = null;

        this.defs = document.createElementNS(this.ns, "defs");
        this.svg.appendChild(this.defs);

        this.backgrounds = document.createElementNS(this.ns, "g");
        this.svg.appendChild(this.backgrounds);
    }
    createPattern(id, width, height, styles) {
        const pattern = document.createElementNS(this.ns, "pattern");
        pattern.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
        pattern.setAttributeNS(null, "viewBox", "-50 -50 100 100");
        pattern.setAttributeNS(null, "width", width);
        pattern.setAttributeNS(null, "height", height);
        pattern.setAttributeNS(null, "id", id);
        this.cell.deploy(pattern, this.ns, styles);
        this.defs.appendChild(pattern);
    }
    createBG(id, x, y) {
        const diagonal = 100*Math.sqrt(2);
        const bg = document.createElementNS(this.ns, "rect");
        bg.setAttributeNS(null, "x", -x - (diagonal - 100) / 2);
        bg.setAttributeNS(null, "y", -y - (diagonal - 100) / 2);
        bg.setAttributeNS(null, "width", diagonal);
        bg.setAttributeNS(null, "height", diagonal);
        bg.setAttributeNS(null, "fill", `url(#${id})`);
        bg.setAttributeNS(null, "transform", `translate(${x} ${y})`);
        this.backgrounds.appendChild(bg);
    }
    setTiling(type) {
        this.reset();
        switch(type) {
            case "pentagonal":
                this.setPentagonalType5Tiling();
                break;
            case "square":
                this.setSquareTiling();
                break;
            case "kisrhombille":
                this.setKisrhombilleTiling();
                break;
            default:
                console.log("invalid tiling type");
        }
        this.svg.dispatchEvent(new Event("sharpChange"));
    }
    setActiveLever(lever) {
        this.activeLever && this.activeLever.svg.classList.remove("active");
        this.activeLever = lever;
        this.activeLever.svg.classList.add("active");
    }
    createLever(id, patternSize, image) {
        const lever = new Lever(this.leversContainer, id, this.ns, this.speed, patternSize);
        this.setActiveLever(lever);
        this.levers.push(this.activeLever);
        this.activeLever.setImage(image);
        this.activeLever.svg.addEventListener("click", () => {
            this.setActiveLever(lever);
        });
    }
    setPentagonalType5Tiling() {
        this.cell = new PentagonalCellType5(100/6, 100/6, 180);

        const size = 50;
        const width = size, height = size * Math.sqrt(3);

        this.createLever("leverpattern", 30, "./images/img11.png");
        this.createPattern("pentapattern", width, height, {
            "fill": "url(#leverpattern)", "stroke": "black", "stroke-width": "0.1",
        });
        this.createBG("pentapattern", 0, 0);
        this.createBG("pentapattern", width/2, 0);
        this.createBG("pentapattern", width/2 - width/4, height*1/4);
        this.createBG("pentapattern", width/2 + width/4, height*1/4);
        this.createBG("pentapattern", width/2, height*2/4);
        this.createBG("pentapattern", width, height*2/4);
        this.createBG("pentapattern", width/2 - width/4, height*3/4);
        this.createBG("pentapattern", width/2 + width/4, height*3/4);
    }
    setSquareTiling() {
        this.cell = new SquareCell(100/2);

        const size = 100/3;
        const width = size, height = size;

        this.createLever("leverpattern1", 100, "./images/img6.png");
        this.createPattern("squarepattern1", width, height, {
            "fill": "url(#leverpattern1)", "stroke": "black", "stroke-width": "0.1",
        });
        this.createBG("squarepattern1", 0, 0);
        this.createBG("squarepattern1", size/2, size/2);

        this.createLever("leverpattern2", 100, "./images/img10.png");
        this.levers[this.levers.length - 1].setTransform(`
            translate(50 50) scale(-1 -1) translate(-50 -50)`);
        this.createPattern("squarepattern2", width, height, {
            "fill": "url(#leverpattern2)", "stroke": "black", "stroke-width": "0.1",
        });
        this.createBG("squarepattern2", size/2, 0);
        this.createBG("squarepattern2", 0, size/2);
    }
    setKisrhombilleTiling() {
        this.cell = new KisrhombilleCell(100/Math.sqrt(3));

        const size = 25;
        const width = size, height = size * Math.sqrt(3);

        this.createLever("leverpattern", 100, "./images/img2.png");
        this.createPattern("squarepattern", width, height, {
            "fill": "url(#leverpattern)", "stroke": "black", "stroke-width": "0.1",
        });
        this.createBG("squarepattern", 0, 0);
        this.createBG("squarepattern", width/2, height/2);
    }
    setImage(href) {
        if (this.activeLever) {
            this.activeLever.setImage(href);
            this.svg.dispatchEvent(new Event("sharpChange"));
        }
    }
    setSpeed(value) {
        this.speed = Number(value);
        for (let lever of this.levers) {
            lever.setSpeed(this.speed);
        }
    }
}