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
            getEl("rowcol-input").max = images.length;
            getEl("rowcol-input").value = Math.ceil(Math.sqrt(images.length));
            processInputs();
            e.preventDefault();
        });
    
        getEl("image-input").addEventListener("change", async e => {
            images = await loadImages([...e.target.files]);
            getEl("rowcol-input").max = images.length;
            getEl("rowcol-input").value = Math.ceil(Math.sqrt(images.length));
            processInputs();
        });

        getEl("rowcol-input").addEventListener("change", processInputs);
        getEl("rowcol-select").addEventListener("change", processInputs);


        let images = [];
        
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
                case "horizontal":return images.slice(n*cols, (n+1)*cols);
                case "vertical": return images.filter((v, i, arr) => ((cols-n) + i) % cols === 0);
            }
        }

        function calculateImages(secondAxis, rows, cols) {
            [firstDim, secondDim, firstSize, secondSize, firstNaturalSize,
                secondNaturalSize, firstCoor, secondCoor] = secondAxis === "vertical"
            ? [cols, rows, "width", "height", "naturalWidth", "naturalHeight", "x", "y"]
            : [rows, cols, "height", "width", "naturalHeight", "naturalWidth", "y", "x"];

            images[0].x = images[0].y = 0;
            images[0].width = images[0].height = 0;

            for (let i = 0; i < firstDim; i++) {
                const line = getImageLine(secondAxis, i, rows, cols);
                const prevLine = getImageLine(secondAxis, Math.max(0, i-1), rows, cols);
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
        }

        function drawImagesToURL(rows, cols) {
            const canvas = document.createElement("canvas");
            
            canvas.width = getImageLine("horizontal", 0, rows, cols).reduce((acc, val) => acc + val.width, 0);
            canvas.height = getImageLine("vertical", 0, rows, cols).reduce((acc, val) => acc + val.height, 0);

            const ctx = canvas.getContext("2d");
            for (let i of images) ctx.drawImage(i.el, i.x, i.y, i.width, i.height);
            
            return canvas.toDataURL('image/png');
        }

        function processInputs() {
            const v = parseInt(getEl("rowcol-input").value);
            const w = Math.ceil(images.length / v);

            [rows, cols, secondAxis] = getEl("rowcol-select").value === "cols"
                ? [w, v, "vertical"]
                : [v, w, "horizontal"];
            
            calculateImages(secondAxis, rows, cols);

            getEl("result").src = drawImagesToURL(rows, cols);
        }
    });
})();
