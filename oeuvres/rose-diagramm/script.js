const nrows = 36;
const ncols = 9;
const ninputs = nrows * ncols;
const maxval = 10;
const minval = 0;
const ns = "http://www.w3.org/2000/svg";

let data = null;

window.addEventListener("load", (event) => {
    data = importFromStorage();

    createInputs();

    updateRoses();
});

function createInputs() {
    const tableEl = document.getElementById("table");

    // Headers

    tableEl.appendChild(htmlToElement(`<span></span>`));

    for (let j = 0; j < ncols; j++) {
        tableEl.appendChild(htmlToElement(`
            <span>${10*j + "-" + (10*(j+1))}</span>
        `));
    }

    tableEl.appendChild(htmlToElement(`<span>Summ</span>`));

    // Body

    for (let i = 0; i < nrows; i++) {
        tableEl.appendChild(htmlToElement(`
            <span>${10*i + "-" + (10*(i+1))}</span>
        `));

        for (let j = 0; j < ncols; j++) {
            tableEl.appendChild(htmlToElement(`
                <input data-id="${i*ncols + j}" type="number" min="${minval}" max="${maxval}" size="2"
                    value="${data[i*ncols + j]}" data-value="${data[i*ncols + j]}"></input>
            `));
        }

        const rowSum = data.slice(i*ncols, (i+1)*ncols).reduce((s, a) => s + a, 0);
        tableEl.appendChild(htmlToElement(`<span id="row-${i}" class="row-sum">${rowSum}<span>`));
    }

    // Bottom

    tableEl.appendChild(htmlToElement(`<span>Summ</span>`));

    for (let j = 0; j < ncols; j++) {
        const value = data.filter((_, idx) => (idx % ncols === j)).reduce((s, a) => s + a, 0);
        tableEl.appendChild(htmlToElement(`<span id="col-${j}" class="col-sum">${value}</span>`));
    }

    tableEl.appendChild(htmlToElement(`<span id="summ">${data.reduce((s, a) => s + a, 0)}</span>`));
}

function onInput(event) {
    // update data and export
    const el = event.target;
    el.dataset.value = el.value;
    data[el.dataset.id] = el.value;
    exportToStorage(data);

    // update row summ
    const rowNum = Math.trunc(el.dataset.id / ncols);
    const rowSum = data.slice(rowNum*ncols, (rowNum+1)*ncols).reduce((s, a) => s + +a, 0);
    document.getElementById("row-" + rowNum).textContent = rowSum;

    // update column summ
    const colNum = el.dataset.id % ncols;
    const colSum = data.filter((_, idx) => (idx % ncols === colNum)).reduce((s, a) => s + +a, 0);
    document.getElementById("col-" + colNum).textContent = colSum;

    // update summ
    document.getElementById("summ").textContent = data.reduce((s, a) => s + +a, 0);
}

function onReset() {
    clearStorage();
    location.reload();
}

function onRandom() {
    exportToStorage(Array.from({length: ninputs},
        () => Math.floor(minval + Math.random()**6 * maxval))
    );

    location.reload();
}

function onPreset1() {
    exportToStorage(["1",0,0,0,0,0,"1",0,0,0,0,"1",0,0,0,0,0,0,0,"1","1",0,0,0,0,0,0,0,"1",
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"1",0,0,0,0,0,0,0,0,"2","0","2",0,0,0,0,
        0,0,0,0,"1","2","2",0,0,0,0,0,0,0,0,"1",0,0,0,0,0,0,"2","1",0,0,0,0,"2",0,
        "1",0,"1",0,"2",0,0,0,0,"2","4",0,"1",0,0,"1","1",0,0,"3","1","1",0,0,"1",
        "1","0","1",0,0,0,"1","1",0,"2","1","1","1","1","1","2","2",0,0,"1","1","2",
        0,"2",0,"2",0,0,"1","2",0,0,0,"1",0,0,0,0,0,"1",0,0,0,0,0,0,0,0,0,0,"1",0,
        0,0,0,0,0,0,0,0,"1","1",0,0,0,"1",0,0,0,0,0,0,0,0,0,0,0,0,0,0,"1",0,0,"1",
        0,0,0,"1",0,0,0,"1",0,"1",0,0,0,0,0,0,"2",0,"1",0,0,0,0,0,"1","1",0,0,0,0,
        0,0,0,0,"1",0,"1",0,0,"1",0,0,"1","2","1",0,0,0,"1",0,0,"1","4","3","2","1",
        0,0,0,0,0,0,"4","1","4","2","1","1",0,"1","1","2","3","2","2","2","1",0,"2",
        "2","1","2","1","1",0,0,"1","1","1","2",0,"2","4","2","1","2",0,"1","2","2",
        "3","1","1","3",0,0,0,"1","1","1",0,0,0,0,"1",0,0,0,0,"2",0,"1",0]);

    location.reload();
}

function importFromStorage() {
    try {
        const item = localStorage.getItem("rose-diagramm-data");

        if (!item) {
            return new Array(ninputs).fill(0);
        } 

        const data = JSON.parse(item).map(x => parseInt(x));

        if (data.length !== ninputs) {
            throw new Error();
        }

        return data;
    }
    catch (error) {
        console.log("error loading from localStorage");
        return new Array(ninputs).fill(0);
    }
}

function exportToStorage(data) {
    localStorage.setItem("rose-diagramm-data", JSON.stringify(data));
}

function clearStorage() {
    localStorage.removeItem("rose-diagramm-data");
}

// https://stackoverflow.com/questions/494143
function htmlToElement(html) {
    const template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function updateRoses() {
    drawAzimuthsDipRose();
    drawAzimuthsStrikeRose();
    drawIncidenceRose();
    drawComplexRose();
}

function drawAzimuthsDipRose() {
    const radius = 50;
    const svg = document.getElementById("rose-azimuths-dip");
    drawSun(svg, 0, 0, radius);

    let p = "";
    const maxmax = Math.max.apply(null, [...document.querySelectorAll(".row-sum")].map(el => +el.textContent));
    for (let i = 0; i < nrows; i++) {
        const dist = radius / maxmax * +document.getElementById("row-" + i).textContent;
        const angle = (5 + i * 360 / nrows - 90) * Math.PI / 180;
        p += dist*Math.cos(angle);
        p += ",";
        p += dist*Math.sin(angle);
        p += " ";
    }

    const polygon = document.createElementNS(ns, "polygon");
    polygon.setAttributeNS(null, "points", p);
    polygon.setAttributeNS(null, "fill", "black");
    svg.appendChild(polygon);
}

function drawAzimuthsStrikeRose() {
    const radius = 100;
    const cx = 0, cy = -50;
    const svg = document.getElementById("rose-azimuths-strike");
    drawSun(svg, cx, cy, radius);

    let arr = [];
    for (let i = 0; i < nrows / 2; i++) {
        const a = +document.getElementById("row-" + (i)).textContent;
        const b = +document.getElementById("row-" + (i + nrows / 2)).textContent;
        arr.push(a + b);
    }

    let p = cx + "," + -cy + " ";
    const maxmax = Math.max.apply(null, arr);
    for (let i = 0; i < nrows / 2; i++) {
        const dist = radius / maxmax * arr[i];
        const angle = (175 - i * 10) * Math.PI / 180;
        p += cx + dist*Math.cos(angle);
        p += ",";
        p += -cy - dist*Math.sin(angle);
        p += " ";
    }

    const polygon = document.createElementNS(ns, "polygon");
    polygon.setAttributeNS(null, "points", p);
    polygon.setAttributeNS(null, "fill", "black");
    svg.appendChild(polygon);
}

function drawIncidenceRose() {
    const radius = 100;
    const cx = -50, cy = -50;
    const svg = document.getElementById("rose-incidence");
    drawSun(svg, cx, cy, radius);

    let p = cx + "," + -cy + " ";
    const maxmax = Math.max.apply(null, [...document.querySelectorAll(".col-sum")].map(el => +el.textContent));
    for (let i = 0; i < ncols; i++) {
        const dist = radius / maxmax * +document.getElementById("col-" + i).textContent;
        const angle = (5 + i * 90 / ncols) * Math.PI / 180;
        p += cx + dist*Math.cos(angle);
        p += ",";
        p += -cy - dist*Math.sin(angle);
        p += " ";
    }

    const polygon = document.createElementNS(ns, "polygon");
    polygon.setAttributeNS(null, "points", p);
    polygon.setAttributeNS(null, "fill", "black");
    svg.appendChild(polygon);
}

function drawSun(svg, cx, cy, radius) {
    const circle = document.createElementNS(ns, "circle");
    circle.setAttributeNS(null, "cx", cx);
    circle.setAttributeNS(null, "cy", -cy);
    circle.setAttributeNS(null, "r", radius);
    circle.setAttributeNS(null, "fill", "transparent");
    circle.setAttributeNS(null, "stroke", "black");
    circle.setAttributeNS(null, "stroke-width", 0.3);
    svg.appendChild(circle);

    for (let i = 5; i < 180; i += 10) {
        const line = document.createElementNS(ns, "line");
        line.setAttributeNS(null, "x1", cx + radius*Math.cos(i * Math.PI / 180));
        line.setAttributeNS(null, "y1", -cy - radius*Math.sin(i * Math.PI / 180));
        line.setAttributeNS(null, "x2", cx + radius*Math.cos(i * Math.PI / 180 + Math.PI));
        line.setAttributeNS(null, "y2", -cy - radius*Math.sin(i * Math.PI / 180 + Math.PI));
        line.setAttributeNS(null, "stroke", "black");
        line.setAttributeNS(null, "stroke-width", 0.3);
        svg.appendChild(line);
    }
}

function drawComplexRose() {
    const radius = 50;

    const xarr = [], yarr = [], zarr = [];

    data.map((z, index) => {
        const angle = 5 + Math.trunc(index / ncols) * 10;
        const dist = (index % ncols) * radius / ncols;
        
        xarr.push(dist * Math.cos(angle * Math.PI / 180 - Math.PI / 2));
        yarr.push(-dist * Math.sin(angle * Math.PI / 180 - Math.PI / 2));
        zarr.push(z-1);
    })

    var roseData = [{
		z: zarr,
		x: xarr,
		y: yarr,
		type: 'contour',
        contours: {
            start: 0,
            end: Math.max.apply(null, data),
            size: 1
        },
        colorscale: 'Viridis',
        autocontour: false,
        line: {
            width: 1,
            color: "white",
        }
	}];

    const shapes= [
        {
            type: 'circle',
            xref: 'x',
            yref: 'y',
            x0: -radius,
            y0: -radius,
            x1: radius,
            y1: radius,
            fillcolor: 'transparent',
            opacity: 0.5,
            line: {
                color: 'white',
                width: 1,
            }
        },
    ];

    for (let i = 5; i < 360; i += 10) {
        shapes.push({
            type: "line",
            xref: 'x',
            yref: 'y',
            x0: 0,
            y0: 0,
            x1: radius * Math.cos(i * Math.PI / 180),
            y1: radius * Math.sin(i * Math.PI / 180),
            opacity: 0.5,
            line: {
                color: 'white',
                width: 1,
            }
        });
    }

    var layout = {
        title: 'Комплексная роза-диаграмма',
        width: 600,
        height: 600,
        shapes: shapes,
    }

    Plotly.newPlot('rose-complex', roseData, layout);
}