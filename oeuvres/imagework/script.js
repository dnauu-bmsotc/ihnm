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


(function() {
    document.addEventListener("DOMContentLoaded", function() {

        getEl = c => document.querySelector("#collage-photo ." + c);

        getEl("image-drop").addEventListener("dragover", e => e.preventDefault());
    
        getEl("image-drop").addEventListener("drop", async e => {
            images = await loadImages([...e.dataTransfer.files]);
            processInputs();
            e.preventDefault();
        });
    
        getEl("image-input").addEventListener("change", async e => {
            images = await loadImages([...e.target.files]);
            processInputs();
        });

        getEl("rowcol-input").addEventListener("change", processInputs);
        getEl("rowcol-select").addEventListener("change", processInputs);


        let images = [];
        
        function getRowsCols() {
            const v = parseInt(getEl("rowcol-input").value);
            const w = Math.ceil(images.length / v);
            switch (getEl("rowcol-select").value) {
                case "rows": return [v, w];
                case "cols": return [w, v];
            }
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

        function getImageLine(axis, n, rows, cols) {
            switch (axis) {
                case "horizontal": return images.slice(n*cols, (n+1)*cols);
                case "vertical": return images.filter((v, i, arr) => ((cols-n) + i) % cols === 0);
            }
        }

        function processInputs() {
            const [rows, cols] = getRowsCols();

            // const table = getEl("image-table");
            // table.innerHTML = "";
            //
            // for (let i = 0; i < rows; i++) {
            //     const row = document.createElement("tr");
            //     table.append(row);
            //     for (let j = 0; j < cols; j++) {
            //         const idx = i*cols + j;
            //         if (idx < images.length) {
            //             const td = document.createElement("td");
            //             row.append(td);
            //             const img = document.createElement("img");
            //             td.append(images[idx].el);
            //         }
            //     }
            // }

            const firstAxis = getEl("rowcol-select").value === "cols" ? "horizontal" : "vertical";
            const secondAxis = getEl("rowcol-select").value === "cols" ? "vertical" : "horizontal";
            const firstDim = firstAxis === "horizontal" ? cols : rows;
            const secondDim = firstAxis === "vertical" ? cols : rows;
            const firstSize = firstAxis === "horizontal" ? "width" : "height";
            const secondSize = firstAxis === "vertical" ? "width" : "height";
            const firstNaturalSize = firstAxis === "horizontal" ? "naturalWidth" : "naturalHeight";
            const secondNaturalSize = firstAxis === "vertical" ? "naturalWidth" : "naturalHeight";
            const firstCoor = firstAxis === "horizontal" ? "x" : "y";
            const secondCoor = firstAxis === "vertical" ? "x" : "y";

            const line = getImageLine(secondAxis, 0, rows, cols);
            line[0].x = 0;
            line[0].y = 0;
            line[0].width = line[0].el.naturalWidth;
            line[0].height = line[0].el.naturalHeight;
            for (let i = 1; i < secondDim; i++) {
                const ratio = line[0][firstSize] / line[i].el[firstNaturalSize];
                line[i][firstSize] = line[0][firstSize];
                line[i][secondSize] = line[i].el[secondNaturalSize] * ratio;
                line[i][firstCoor] = line[0][firstCoor];
                line[i][secondCoor] = line[i-1][secondCoor] + line[i-1][secondSize];
            }

            for (let i = 1; i < firstDim; i++) {
                const line = getImageLine(secondAxis, i, rows, cols);
                const prevLine = getImageLine(secondAxis, i-1, rows, cols);
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
                        line[j][firstSize] *= ratio;
                        line[j][secondSize] *= ratio;
                        line[j][secondCoor] *= ratio;
                    }
                }
            }

            const canvas = getEl("result");
            canvas[firstSize] = getImageLine(firstAxis, 0, rows, cols).reduce((acc, val) => acc + val[firstSize], 0);
            canvas[secondSize] = getImageLine(secondAxis, 0, rows, cols).reduce((acc, val) => acc + val[secondSize], 0);
            const ctx = canvas.getContext("2d");
            for (let i of images) {
                ctx.drawImage(i.el, i.x, i.y, i.width, i.height);
            }
        }
    });
})();
