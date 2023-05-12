class Problem {
    constructor() {
        this.ns = "http://www.w3.org/2000/svg";
        this.hashed = new Set();
        this.currentProblemId = null;
    }
    stdsDark(k=1) {
        return `fill:gray; stroke:black; stroke-width: ${0.3*k}`;
    }
    stdsLight(k=1) {
        return `fill:lightGray; stroke:black; stroke-width: ${0.3*k}`;
    }
    stdsRed(k=1) {
        return `fill:pink; stroke:red; stroke-width: ${0.3*k}`;
    }
    makeCondition() {}
    makeSketch() {}
    makeSolution() {}
    delete() {}
    createSketchSVG(html, onHover, onLeave) {
        const svg = document.createElementNS(this.ns, "svg");
        svg.setAttributeNS(null, "width", "100%");
        svg.setAttributeNS(null, "height", "100%");
        svg.setAttributeNS(null, "viewBox", "-50 -50 100 100");
        svg.innerHTML = html;

        svg.addEventListener("mousemove", e => {
            const rect = svg.getBoundingClientRect();
            const x = (e.clientX - rect.left) / (rect.right - rect.left);
            const y = (e.clientY - rect.top) / (rect.bottom - rect.top);
            onHover(x, y);
        });
        svg.addEventListener("touchmove", e => {
            const rect = svg.getBoundingClientRect();
            const x = (e.touches[0].clientX - rect.left) / (rect.right - rect.left);
            const y = (e.touches[0].clientY - rect.top) / (rect.bottom - rect.top);
            onHover((x + 1) % 1, (y + 1) % 1);
        });

        ["mouseleave", "touchend"].forEach(eveType => {
            svg.addEventListener(eveType, onLeave);
        });

        return svg;
    }
    createSketchSVGInfo(keys) {
        const hash = {};
        const infobox = document.createElement("div");
        infobox.classList.add("infobox");

        for (let k of keys) {
            const div = document.createElement("div");
            const keybox = document.createElement("span");
            const separator = document.createTextNode(": ");
            const valbox = document.createElement("span");

            hash[k] = valbox;

            keybox.textContent = k;
            
            div.appendChild(keybox);
            div.appendChild(separator);
            div.appendChild(valbox);

            infobox.appendChild(div);
        }

        return [infobox, hash];
    }
    updateSketchSVGInfo(hash, data) {
        for (let k of Object.keys(hash)) {
            hash[k].textContent = data[k];
        }
    }
    round(n, d) {
        return Math.round(n * 10**d) / 10**d;
    }
    degrees(r, d) {
        return this.round(r * 180 / Math.PI, d);
    }
    deploy(id) {
        this.currentProblem && this.currentProblem.delete();
        document.getElementById("condition").innerHTML = "";
        document.getElementById("sketch").innerHTML = "";
        document.getElementById("solution").innerHTML = "";

        if (this.hashed.has(id)) {
            this.createProblem(id);
        }
        else {
            this.hashed.add(id);
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = './problem' + id + "/script.js";
            script.onload = function() {
                this.createProblem(id);
            }.bind(this);
            head.appendChild(script);
        }

        document.querySelector("main").removeAttribute("hidden");
    }
    createProblem(id) {
        this.currentProblem = (Function('return new Problem' + id))();
        this.currentProblem.makeCondition(document.getElementById("condition"));
        this.currentProblem.makeSketch(document.getElementById("sketch"));
        this.currentProblem.makeSolution(document.getElementById("solution"));
    }
    calcTriangle(x, y, turn1, go1, turn2, go2) {
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
    points2Path(points) {
        return points.map(p => p.join(",")).join(" ");
    }
}

window.addEventListener("load", (event) => {
    window.problem = new Problem();
});