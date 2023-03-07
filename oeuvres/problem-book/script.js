class Problem {
    constructor() {
        this.ns = "http://www.w3.org/2000/svg";
        this.stdsLight = "fill:lightGray; stroke:black; stroke-width:0.3";
        this.stdsDark = "fill:gray; stroke:black; stroke-width: 0.3";
        this.stdsRed = "fill:pink; stroke:red; stroke-width: 0.3";
    }
    makeCondition() {};
    makeSketch() {};
    makeSolution() {};
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
    deploy() {
        document.getElementById("condition").innerHTML = "";
        document.getElementById("sketch").innerHTML = "";
        document.getElementById("solution").innerHTML = "";
        this.makeCondition(document.getElementById("condition"));
        this.makeSketch(document.getElementById("sketch"));
        this.makeSolution(document.getElementById("solution"));

        document.querySelector("main").removeAttribute("hidden");
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