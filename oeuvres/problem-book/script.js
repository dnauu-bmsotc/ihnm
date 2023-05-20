"use strict"

function round(n, d=0) {
    return Math.round(n * 10**d) / 10**d;
}

function degrees(r, d=0) {
    return round(r * 180 / Math.PI, d);
}

function register(name, callback) {
    const btn = document.createElement("button");
    btn.textContent = name;
    
    btn.addEventListener("click", function() {
        callback({
            error: function(error="") {
                console.log("There was an error, problem restarted. " + error);
                btn.click();
            },
        });
        document.querySelector("main").removeAttribute("hidden");
        document.querySelector("#welcome").style.display = "none";
    });

    document.getElementById("problem-buttons").append(btn);
}

class Problem {
    constructor() {
        this.dom = {
            condition: document.getElementById("condition"),
            sketch: document.getElementById("sketch"),
            solution: document.getElementById("solution"),
        }

        this.dom.condition.innerHTML = "";
        this.dom.sketch.innerHTML = "";
        this.dom.solution.innerHTML = "";

        this.ns = "http://www.w3.org/2000/svg";

        this.mouseout = true;

        Problem.currentProblem = this;
    }

    get stdsDark() {
        return `fill:gray; stroke:black; stroke-width: ${this.sketchScale}`;
    }

    get stdsLight() {
        return `fill:lightGray; stroke:black; stroke-width: ${this.sketchScale}`;
    }

    get stdsRed() {
        return `fill:pink; stroke:red; stroke-width: ${this.sketchScale}`;
    }

    createSVGSketch(minx=-50, miny=-50, width=100, height=100) {
        this.dom.sketchSVG = document.createElementNS(this.ns, "svg");
        this.dom.sketchSVG.setAttributeNS(null, "width", "100%");
        this.dom.sketchSVG.setAttributeNS(null, "height", "100%");
        this.dom.sketchSVG.setAttributeNS(null, "viewBox", [minx, miny, width, height].join(" "));

        this.dom.sketchSVGWrap = document.createElement("div");
        this.dom.sketchSVGWrap.append(this.dom.sketchSVG);
        this.dom.sketch.append(this.dom.sketchSVGWrap);

        this.sketchScale = Math.min(width, height) * .003;

        return this.dom.sketchSVG;
    }

    addSVGSketchHoverListener(onHover) {
        this.dom.sketchSVG.addEventListener("mousemove", function(e) {
            const rect = this.dom.sketchSVG.getBoundingClientRect();
            const x = (e.clientX - rect.left) / (rect.right - rect.left);
            const y = (e.clientY - rect.top) / (rect.bottom - rect.top);
            onHover(x, y, this.mouseout);
            this.mouseout = false;
        }.bind(this));

        this.dom.sketchSVG.addEventListener("touchmove", function(e) {
            const rect = this.dom.sketchSVG.getBoundingClientRect();
            const x = (e.touches[0].clientX - rect.left) / (rect.right - rect.left);
            const y = (e.touches[0].clientY - rect.top) / (rect.bottom - rect.top);
            onHover((x + 1) % 1, (y + 1) % 1, this.mouseout);
            this.mouseout = false;
        }.bind(this), {passive: true});
    }

    addSVGSketchLeaveListener(onLeave, invoke=false) {
        ["mouseleave", "touchend"].forEach(eveType => {
            this.dom.sketchSVG.addEventListener(eveType, function() {
                onLeave();
                this.mouseout = true;
            }.bind(this));
        });

        invoke && onLeave();
    }

    createSketchInfo() {
        this.sketchInfoElements = new Map();

        this.dom.infobox = document.createElement("div");
        this.dom.infobox.classList.add("infobox");
        this.dom.sketchSVGWrap.append(this.dom.infobox);
    }

    setSketchSVGInfo(map) {
        !this.sketchInfoElements && this.createSketchInfo();

        map.forEach((value, key, map) => {
            if (this.sketchInfoElements.has(key)) {
                this.sketchInfoElements.get(key).textContent = value;
            }
            else {
                const div = document.createElement("div");
                const keybox = document.createElement("span");
                const separator = document.createTextNode(": ");
                const valbox = document.createElement("span");

                keybox.textContent = key;
                valbox.textContent = value;
                
                div.appendChild(keybox);
                div.appendChild(separator);
                div.appendChild(valbox);
    
                this.dom.infobox.appendChild(div);

                this.sketchInfoElements.set(key, valbox);
            }
        });
    }

    setAdditionalSketchSVGInfo(text) {
        if (!this.dom.sketchAdditionalInfo) {
            this.dom.sketchAdditionalInfo = document.createElement("div");
            this.dom.sketchAdditionalInfo.classList.add("infobox-extra");
            this.dom.sketch.append(this.dom.sketchAdditionalInfo);
        }
        this.dom.sketchAdditionalInfo.textContent = text;
    }

    createSectorPath(startAngle, endAngle, r) {
        return `
            M ${r} ${0}
            A ${r} ${r} ${0} ${Number(endAngle > Math.PI)} ${0} ${r*Math.cos(endAngle)} ${-r*Math.sin(endAngle)}
            L ${0} ${0}
            Z
        `;
    }

    createTrianglePoints (x, y, turn1, go1, turn2, go2) {
        const points = [[x, y]];
        points.push([
            points[0][0] + go1 * Math.cos(turn1),
            points[0][1] - go1 * Math.sin(turn1)
        ]);
        points.push([
            points[1][0] + go2 * Math.cos(turn1 + Math.PI - turn2),
            points[1][1] - go2 * Math.sin(turn1 + Math.PI - turn2)
        ]);
        return points;
    }

    createTrianglePath () {
        return this.createTrianglePoints(...arguments).map(p => p.join(",")).join(" ");
    }
}
