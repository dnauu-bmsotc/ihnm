
(function() {
    document.addEventListener("DOMContentLoaded", function() {
        hydrateNavigation();
        activateTab(document.getElementById("collage-photo"));
    });
    
    // collect h2 headers from tabs and add it to navigation element
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
    
    // hide previous tab and show a new one
    function activateTab(tab) {
        if (activateTab.activeTab) {
            activateTab.activeTab.classList.remove("active");
        }
        activateTab.activeTab = tab;
        tab.classList.add("active");
    }
})();


(function(useTestImages=true, nTestImages=3, testImagesExt="gif") {

    const layout = {
        // 
        id: null,
        // array of {file, image, x, y, width, height, naturalWidth, naturalHeight, frames}
        // where x y w h - parameters for drawing on canvas
        // frames is list of blobs of GIF frames
        images: null,
        // way of ordering images, "horizontal" or "vertical"
        fillDirection: null,
        // firstAxis is perpendicular to orientation of straight lines
        // "horizontal" if images align into straight cols, "vertical" for rows
        firstAxis: null,
        // inverse of firstAxis, corresponds to straight lines orientation
        get secondAxis() {return this._horver("vertical", "horizontal")},
        // numbers of rows and cols into which images are placed
        rows: null,
        cols: null,
        // alias
        _horver(hor, ver) {return this.firstAxis === "horizontal" ? hor : ver},
        // 
        get firstDim() {return this._horver(this.cols, this.rows)},
        get secondDim() {return this._horver(this.rows, this.cols)},
        //
        get firstSize() {return this._horver("width", "height")},
        get secondSize() {return this._horver("height", "width")},
        //
        get firstNaturalSize() {return this._horver("naturalWidth", "naturalHeight")},
        get secondNaturalSize() {return this._horver("naturalHeight", "naturalWidth")},
        //
        get firstCoor() {return this._horver("x", "y")},
        get secondCoor() {return this._horver("y", "x")},
    },
    l = layout;
    
    // adding listeners
    document.addEventListener("DOMContentLoaded", function() {
        getEl("image-drop").addEventListener("drop", e => {
            startProcessing([...e.dataTransfer.files]);
            e.preventDefault();
        });
        getEl("image-drop").addEventListener("dragover", e => {
            e.preventDefault()
        });
        getEl("image-input").addEventListener("change", e => {
            startProcessing([...e.target.files]);
        });
        getEl("settings").addEventListener("change", _ => {
            startProcessing();
        })

        if (useTestImages) {
            loadTestImages().then(r => startProcessing(r));
        }
    });

    function getEl(classname) {
        return document.querySelector("#collage-photo ." + classname);
    }

    class InputsChangedError extends Error {}

    function createIdCheck(id) {
        return function() {
            if (id !== layout.id) {
                throw new InputsChangedError();
            }
        }
    }

    function clear() {
        getEl("result-image").src = "";

        canvas = getEl("result-canvas");
        canvas.width = 100;
        canvas.height = 100;
        canvas.getContext('2d').clearRect(0, 0, 100, 100);
    }

    async function startProcessing(files) {
        const timestamp = Date.now();
        const checkId = createIdCheck(timestamp);
        layout.id = timestamp;

        try {
            clear();
            setOutputVariant("image");

            if (files) {
                await loadImages(files);
                checkId();
                limitRowcolInputValues(layout.images.length);
            }

            const v = parseInt(getEl("rowcol-input").value);
            const w = Math.ceil(l.images.length / v);

            layout.fillDirection = getEl("dir-select").value;
            layout.firstAxis = getEl("rowcol-select").value === "cols" ? "horizontal" : "vertical";
            layout.rows = layout._horver(w, v);
            layout.cols = layout._horver(v, w);

            calculateImages();

            await render(checkId);
        }
        catch (error) {
            if (error instanceof InputsChangedError) {
                console.log("inputs changed before they were processed");
            }
            else {
                throw error;
            }
        }
    }
    
    function limitRowcolInputValues(numberOfImages) {
        getEl("rowcol-input").max = numberOfImages;
        getEl("rowcol-input").value = Math.ceil(Math.sqrt(numberOfImages));
    }

    function fileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    async function loadImages(files) {
        layout.images = [];

        for (let file of files) {
            if (file.type === "image/gif") {
                const gif = await gifFileToFrames(file);
                layout.images.push({
                    file: file,
                    frames: gif.frames,
                    reader: gif.reader,
                    naturalWidth: gif.reader.width,
                    naturalHeight: gif.reader.height,
                });
            }
            else {
                if (file.name && (fileExtension(file.name) === "heic")) {
                    file = await heic2any({ blob: file, toType: "image/jpeg" });
                }

                const blob = URL.createObjectURL(file);
                const image = new Image();
                image.src = blob;
                await image.decode();
                layout.images.push({
                    file: file,
                    el: image,
                    naturalWidth: image.naturalWidth,
                    naturalHeight: image.naturalHeight,
                });
            }
        }
    }

    async function loadTestImages() {
        const testImages = [];
        for (let i = 0; i < nTestImages; i++) {
            const url = `./testimages/test${i}.${testImagesExt}`;
            const resp = await fetch(url);
            testImages.push(await resp.blob());
        }
        return testImages;
    }

    async function gifFileToFrames(file) {
        const arrayBuffer = await new Response(file).arrayBuffer();
        const intArray = new Uint8Array(arrayBuffer);
        const reader = new GifReader(intArray);

        const frames = new Array(reader.numFrames()).fill(0).map((_, k) => {
            const image = new ImageData(reader.width, reader.height);
            reader.decodeAndBlitFrameRGBA(k, image.data);
            return image;
        });

        return {
            reader: reader,
            frames: frames,
        };
    }

    function setOutputVariant(variant) {
        switch (variant) {
            case "image":
                getEl("result-image").hidden = false;
                getEl("result-canvas").hidden = true;
                break;
        
            case "canvas":
                getEl("result-image").hidden = true;
                getEl("result-canvas").hidden = false;
                break;
        }
    }

    async function render(checkId) {
        const hasGifs = resetGifImagesReadParameters();
        if (hasGifs) {
            const gif = new GIF({workerScript: "./lib/gif.worker.js"});
            addFramesToGif(gif);
            const url = await new Promise((resolve, reject) => {
                gif.on('finished', function(blob) {
                    resolve(URL.createObjectURL(blob));
                });
                gif.render();
            });

            checkId();
            setOutputVariant("image");
            getEl("result-image").src = url;
        }
        else {
            const canvas = drawImagesToCanvas();
            const res = getEl("result-canvas");
            
            checkId();
            setOutputVariant("canvas");
            res.width = canvas.width;
            res.height = canvas.height;
            res.getContext("2d").drawImage(canvas, 0, 0);
        }
    }

    function resetGifImagesReadParameters() {
        let hasGifs = false;
        for (let image of layout.images) {
            if (image.frames) {
                hasGifs = true;
                image.currentFrameIdx = 0;
                image.nextFrameTime = image.reader.frameInfo(0).delay;
            }
        }
        return hasGifs;
    }

    function addFramesToGif(gif) {
        let time = 0;
        while(true) {
            let minDelay = null;
            for (let image of layout.images.filter(img => img.frames)) {
                if (image.currentFrameIdx + 1 < image.reader.numFrames()) {
                    if (time >= image.nextFrameTime) {
                        image.currentFrameIdx += 1;
                        const info = image.reader.frameInfo(image.currentFrameIdx);
                        image.nextFrameTime += info.delay;
                    }
                    const info = image.reader.frameInfo(image.currentFrameIdx);
                    if (minDelay === null || info.delay < minDelay) {
                        minDelay = info.delay;
                    }
                }
            }
            if (minDelay === null) {
                break;
            }
            gif.addFrame(drawImagesToCanvas(), {delay: minDelay});
            time += minDelay;
        }
    }

    function drawImagesToCanvas() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = getImageLine("horizontal", 0).reduce((acc, val) => acc + val.width, 0);
        canvas.height = getImageLine("vertical", 0).reduce((acc, val) => acc + val.height, 0);

        for (let img of l.images) {
            if (img.el) {
                ctx.drawImage(img.el, img.x, img.y, img.width, img.height);
            }
            if (img.frames) {
                const data = img.frames[img.currentFrameIdx];
                const renderer = document.createElement('canvas');
                renderer.width = img.naturalWidth;
                renderer.height = img.naturalHeight;
                renderer.getContext('2d').putImageData(data, 0, 0);
                ctx.drawImage(renderer, img.x, img.y, img.width, img.height);
            }
        }

        return canvas;
    }

    function calculateImages() {
        l.images[0].x = l.images[0].y = 0;
        l.images[0].width = l.images[0].height = 0;

        for (let i = 0; i < l.firstDim; i++) {
            const line = getImageLine(l.secondAxis, i);
            const prevLine = getImageLine(l.secondAxis, Math.max(0, i-1));
            line[0][l.firstCoor] = prevLine[0][l.firstCoor] + prevLine[0][l.firstSize];
            line[0][l.secondCoor] = 0;

            // resize according to first element in current row/column.
            line[0][l.firstSize] = line[0][l.firstNaturalSize];
            line[0][l.secondSize] = line[0][l.secondNaturalSize];
            for (let j = 1; j < l.secondDim; j++) {
                if (line[j]) {
                    const ratio = line[0][l.firstSize] / line[j][l.firstNaturalSize];
                    line[j][l.firstSize] = line[0][l.firstSize];
                    line[j][l.secondSize] = line[j][l.secondNaturalSize] * ratio;
                    line[j][l.firstCoor] = line[0][l.firstCoor];
                    line[j][l.secondCoor] = line[j-1][l.secondCoor] + line[j-1][l.secondSize];
                }
            }

            // resize according to previous row/column.
            const naturalSumm = line.reduce((acc, val) => acc + val[l.secondSize], 0);
            const neededSumm = prevLine.reduce((acc, val) => acc + val[l.secondSize], 0);
            const ratio = neededSumm / naturalSumm;
            for (let j = 0; j < l.secondDim; j++) {
                if (line[j]) {
                    line[j][l.firstSize] = Math.ceil(line[j][l.firstSize] * ratio);
                    line[j][l.secondSize] = Math.ceil(line[j][l.secondSize] * ratio);
                    line[j][l.secondCoor] = Math.ceil(line[j][l.secondCoor] * ratio);
                }
            }
        }
    }
    
    function getImageLine(axis, n) {
        const matrix = l.fillDirection === "vertical"
            ? new Matrix(l.cols, l.rows, l.images)
            : new Matrix(l.rows, l.cols, l.images);

        // prevent last row/col being empty
        const cond1 = l.fillDirection == l.secondAxis;
        const cond2 = l.rows * l.cols - l.secondDim >= l.images.length;
        if (cond1 && cond2) {
            for (i = 0; i < l.firstDim - l.images.length % l.firstDim; i++) {
                matrix.a.splice(l.images.length - i, 0, null);
            }
        }

        if (l.fillDirection === "vertical") {
            matrix.transpose();
        }
        return axis === "horizontal" ? matrix.getRow(n) : matrix.getCol(n);
    }

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
            return fill ? r : r.filter(x => x !== null);
        }
        getCol(j, fill=false) {
            const r = [];
            for (let i = 0; i < this.r; i++) {
                r.push(this.get(i, j));
            }
            return fill ? r : r.filter(x => x !== null);
        }
        log() {
            const rows = [];
            for (let i = 0; i < this.r; i++) {
                rows.push(this.getRow(i, true).join(', '));
            }
            console.log(rows.join(';\n') + '.')
        }
    };
})();

