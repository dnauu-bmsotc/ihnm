
(function() {
    document.addEventListener("DOMContentLoaded", function() {
        hydrateNavigation();
        activateTab(document.getElementById("collage-photo"));
    });
    
    function hydrateNavigation() {
        const nav = document.getElementById("navigation");
        const tabs = document.querySelectorAll("main section.tab");

        tabs.forEach(tab => {
            const a = document.createElement("a");
            a.textContent = tab.querySelector("h2").textContent;
            a.addEventListener("click", _ => activateTab(tab));
            nav.append(a);
        });
    }
    
    function activateTab(tab) {
        if (activateTab.activeTab) {
            activateTab.activeTab.classList.remove("active");
        }
        activateTab.activeTab = tab;
        tab.classList.add("active");
    }
})();


(function(useTestImages=true, nTestImages=10) {
    
    const images = [];

    document.addEventListener("DOMContentLoaded", async function() {

        getEl = c => document.querySelector("#collage-photo ." + c);

        getEl("image-drop").addEventListener("dragover", e => e.preventDefault());
    
        getEl("image-drop").addEventListener("drop", async e => {
            e.preventDefault();
            images.splice(0, images.length, ...await loadImages([...e.dataTransfer.files]));
            getEl("rowcol-input").max = images.length;
            getEl("rowcol-input").value = Math.ceil(Math.sqrt(images.length));
            processInputs();
        });
    
        getEl("image-input").addEventListener("change", async e => {
            images.splice(0, images.length, ...await loadImages([...e.target.files]));
            getEl("rowcol-input").max = images.length;
            getEl("rowcol-input").value = Math.ceil(Math.sqrt(images.length));
            processInputs();
        });

        getEl("rowcol-input").addEventListener("change", processInputs);
        getEl("rowcol-select").addEventListener("change", processInputs);
        getEl("dir-select").addEventListener("change", processInputs);
        
        if (useTestImages) loadTestImages();
    });
    
    class Matrix {
        constructor(rows, cols, arr) {
            [this.r, this.c, this.a] = [rows, cols, arr.slice()];
        }
        set(row, col, val) {
            const i = row * this.c + col;
            this.a[i] = val;
        }
        get(row, col) {
            const i = row * this.c + col;
            return i >= this.a.length ? null : this.a[i];
        }
        transpose() {
            const m = new Matrix(this.r, this.c, this.a.slice());
            [this.r, this.c] = [this.c, this.r];
            for (let i = 0; i < this.r; i++) {
                for (let j = 0; j < this.c; j++) {
                    this.set(i, j, m.get(j, i));
                }
            }
        }
        getRow(i, fill=false) {
            const r = [];
            for (let j = 0; j < this.c; j++) {
                r.push(this.get(i, j));
            }
            return fill ? r : r.filter(x => x!==null);
        }
        getCol(j, fill=false) {
            const r = [];
            for (let i = 0; i < this.r; i++) {
                r.push(this.get(i, j));
            }
            return fill ? r : r.filter(x => x!==null);
        }
        log() {
            const rows = [];
            for (let i = 0; i < this.r; i++) {
                rows.push(this.getRow(i, true).join(', '));
            }
            console.log(rows.join(';\n') + '.')
        }
    };
    
    async function loadTestImages() {
        const testImages = [];
        for (let i = 0; i < 10; i++) {
            const resp = await fetch(`./testimages/test${i}.png`);
            testImages.push(await resp.blob());
        }
        images.splice(0, images.length, ...await loadImages(testImages.slice(0, nTestImages)));
        
        getEl("rowcol-input").max = images.length;
        getEl("rowcol-input").value = Math.ceil(Math.sqrt(images.length));
        
        processInputs();
    }

    async function loadImages(files) {
        return await Promise.all(files.map(async file => {
            const blob = URL.createObjectURL(file);
            const image = new Image();
            image.src = blob;
            await image.decode();
            return {
                file: file,
                el: image,
            }
        }));
    }

    function getImageLine(fillDirection, secondAxis, axis, n, rows, cols) {
        const matrix = fillDirection === "vertical"
            ? new Matrix(cols, rows, images)
            : new Matrix(rows, cols, images);

        // prevent last row/col being empty
        const firstDim = secondAxis === "horizontal" ? cols : rows;
        const secondDim = secondAxis === "vertical" ? cols : rows;
        if ((fillDirection == secondAxis) && (rows * cols - firstDim >= images.length)) {
            matrix.a = matrix.a.filter(x => x);
            for (i = 0; i < secondDim - images.length % secondDim; i++) {
                matrix.a.splice(images.length - i, 0, null);
            }
        }

        if (fillDirection === "vertical") {
            matrix.transpose();
        }
        return axis === "horizontal" ? matrix.getRow(n) : matrix.getCol(n);
    }

    function calculateImages(fillDirection, firstAxis, secondAxis, rows, cols) {
        [firstDim, secondDim, firstSize, secondSize, firstNaturalSize,
            secondNaturalSize, firstCoor, secondCoor] = firstAxis === "vertical"
            ? [rows, cols, "height", "width", "naturalHeight", "naturalWidth", "y", "x"]
            : [cols, rows, "width", "height", "naturalWidth", "naturalHeight", "x", "y"];

        images[0].x = images[0].y = 0;
        images[0].width = images[0].height = 0;

        for (let i = 0; i < firstDim; i++) {
            const line = getImageLine(fillDirection, secondAxis, secondAxis, i, rows, cols);
            const prevLine = getImageLine(fillDirection, secondAxis, secondAxis, Math.max(0, i-1), rows, cols);
            line[0][firstCoor] = prevLine[0][firstCoor] + prevLine[0][firstSize];
            line[0][secondCoor] = 0;

            // resize according to first element in current row/column.
            line[0][firstSize] = line[0].el[firstNaturalSize];
            line[0][secondSize] = line[0].el[secondNaturalSize];
            for (let j = 1; j < secondDim; j++) {
                if (line[j]) {
                    const ratio = line[0][firstSize] / line[j].el[firstNaturalSize];
                    line[j][firstSize] = line[0][firstSize];
                    line[j][secondSize] = line[j].el[secondNaturalSize] * ratio;
                    line[j][firstCoor] = line[0][firstCoor];
                    line[j][secondCoor] = line[j-1][secondCoor] + line[j-1][secondSize];
                }
            }
            
            // resize according to previous row/column.
            const naturalSumm = line.reduce((acc, val) => acc + val[secondSize], 0);
            const neededSumm = prevLine.reduce((acc, val) => acc + val[secondSize], 0);
            const ratio = neededSumm / naturalSumm;
            for (let j = 0; j < secondDim; j++) {
                if (line[j]) {
                    line[j][firstSize] = Math.ceil(line[j][firstSize] * ratio);
                    line[j][secondSize] = Math.ceil(line[j][secondSize] * ratio);
                    line[j][secondCoor] = Math.ceil(line[j][secondCoor] * ratio);
                }
            }
        }
    }

    function drawImagesToURL(fillDirection, secondAxis, rows, cols) {
        const canvas = document.createElement("canvas");
        
        const horLine = getImageLine(fillDirection, secondAxis, "horizontal", 0, rows, cols);
        const verLine = getImageLine(fillDirection, secondAxis, "vertical", 0, rows, cols);
        canvas.width = horLine.reduce((acc, val) => acc + val.width, 0);
        canvas.height = verLine.reduce((acc, val) => acc + val.height, 0);

        const ctx = canvas.getContext("2d");
        for (let i of images) ctx.drawImage(i.el, i.x, i.y, i.width, i.height);
        
        return canvas.toDataURL('image/png');
    }

    function processInputs() {
        const v = parseInt(getEl("rowcol-input").value);
        const w = Math.ceil(images.length / v);

        [rows, cols, firstAxis, secondAxis] = getEl("rowcol-select").value === "cols"
            ? [w, v, "horizontal", "vertical"]
            : [v, w, "vertical", "horizontal"];

        const fillDirection = getEl("dir-select").value;
        
        calculateImages(fillDirection, firstAxis, secondAxis, rows, cols);

        getEl("result").src = drawImagesToURL(fillDirection, secondAxis, rows, cols);
    }
})();

