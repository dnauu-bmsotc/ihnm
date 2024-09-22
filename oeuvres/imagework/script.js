"use strict"


document.addEventListener("DOMContentLoaded", function() {

    let currentCollageId = null;

    // callback used on user input.
    const callback = async function() {
        // get images
        const imgEls = document.querySelectorAll("#images li img");
        const images = Array.from(imgEls).map(img => img.src);
        // get settings
        if (!document.getElementById("rowcol-input").value) {
            const numberOfImages = document.getElementById("images").childElementCount;
            document.getElementById("rowcol-input").max = numberOfImages;
            document.getElementById("rowcol-input").value = Math.ceil(Math.sqrt(numberOfImages));
        }
        const firstRowcolSize = parseInt(document.getElementById("rowcol-input").value);
        const secondRowcolSize = Math.ceil(images.length / firstRowcolSize);
        const fillDirection = document.getElementById("dir-select").value;
        const firstAxis = document.getElementById("rowcol-select").value === "cols" ? "horizontal" : "vertical";
        const sizeLimit = document.getElementById("size-limited").checked ? parseInt(document.getElementById("size-limit").value) : 0;
        // create check for a case of an input while processing
        const id = Symbol();
        currentCollageId = id;
        // start processing
        const collager = new Collager(_ => id == currentCollageId,
            fillDirection, firstAxis, firstRowcolSize, secondRowcolSize, sizeLimit
        );
        const url = await collager.collage(images);
        // show result
        if (id == currentCollageId) {
            document.getElementById("result").src = url;
        }
        else {
            console.log("inputs changed before processing finished.");
        }
    }

    initSortables();

    implementImageDrop(callback);

    implementPaste(callback);

    implementBrowseButtonInput(callback);

    loadExampleImages(callback);

    limitRowColInputValues();

    watchSettings(callback);

});


function initSortables() {
    Sortable.create(document.getElementById("images"), {
        group: "images",
        animation: 150,
    });
    Sortable.create(document.getElementById("images-buffer"), {
        group: "images",
        animation: 150,
    });
}


async function addImages(files, to_buffer=false) {
    function isIterable(obj) {
        return typeof obj[Symbol.iterator] === "function";
    }

    if (!isIterable(files)) {
        files = [files];
    }

    for (let file of [...files]) {
        const li = document.createElement("li");
        const img = document.createElement("img");

        if (file.type == "image/heif") {
            file = await heic2any({ blob: file, toType: "image/jpeg" })
        }

        img.src = URL.createObjectURL(file);
        li.append(img);
        document.getElementById(to_buffer ? "images-buffer" : "images").append(li);
    }

}


function implementImageDrop(callback) {
    document.addEventListener("drop", async e => {
        e.preventDefault();
        await addImages(e.dataTransfer.files);
        callback();
    });
    document.addEventListener("dragover", e => {
        e.preventDefault();
    });
}


function implementPaste(callback) {
    document.addEventListener("paste", async e => {
        await addImages(e.clipboardData.files);
        callback();
    });
}


function implementBrowseButtonInput(callback) {
    document.getElementById("image-input").addEventListener("change", async e => {
        await addImages(e.target.files);
        callback();
    });
}


function limitRowColInputValues() {
    const observer = new MutationObserver(_ => {
        const numberOfImages = document.getElementById("images").childElementCount;
        document.getElementById("rowcol-input").max = numberOfImages;
    });

    observer.observe(
        document.getElementById("images"),
        { childList: true }
    );
}


function watchSettings(callback) {
    document.getElementById("settings").addEventListener("change", callback);
}


function loadExampleImages(callback) {
    const test_images = [
        "./testimages/test0.png",
        "./testimages/test1.png",
        "./testimages/test2.png",
        "./testimages/test3.png",
        "./testimages/test4.png",
        "./testimages/test5.png",
        "./testimages/test6.png",
        "./testimages/test7.png",
        "./testimages/test8.png",
        "./testimages/test9.png",
        // "./testimages/test0.gif",
        // "./testimages/test1.gif",
        // "./testimages/test2.gif",
        // "./testimages/test3.gif",
        // "./testimages/test4.gif",
        // "./testimages/test5.gif",
        // "./testimages/test6.gif",
        // "./testimages/test7.gif",
        // "./testimages/test8.gif",
        // "./testimages/test9.gif",
        // "./testimages/test0.heic",
        // "./testimages/test1.heic",
        // "./testimages/test2.heic",
        // "./testimages/test3.heic",
        // "./testimages/test4.heic",
    ];

    const promises = test_images.map(fname => fetch(fname).then(r => r.blob()));

    Promise.all(promises).then(blobs => {
        addImages(blobs);
        callback();
    });
}


class Collager {
    constructor(realityCheck, fillDirection, firstAxis, firstRowcolSize, secondRowcolSize, sizeLimit) {
        // fillDirection specifies the way of ordering images, "horizontal" or "vertical".
        // firstAxis is perpendicular to orientation of straight lines.
        // "horizontal" if images align into straight cols, "vertical" for rows.
        [this.realityCheck, this.fillDirection, this.firstAxis, this.sizeLimit] = 
            [realityCheck, fillDirection, firstAxis, sizeLimit];

        // derivative properties
        this.secondAxis = this.horver("vertical", "horizontal");

        this.rows = this.horver(secondRowcolSize, firstRowcolSize);
        this.cols = this.horver(firstRowcolSize, secondRowcolSize);

        this.firstDim = this.horver(this.cols, this.rows);
        this.secondDim = this.horver(this.rows, this.cols);

        this.firstSize = this.horver("width", "height");
        this.secondSize = this.horver("height", "width");
        
        this.firstNaturalSize = this.horver("naturalWidth", "naturalHeight");
        this.secondNaturalSize = this.horver("naturalHeight", "naturalWidth");
        
        this.firstCoor = this.horver("x", "y");
        this.secondCoor = this.horver("y", "x");

        // this.images is an array of {file, image, x, y, width, height, naturalWidth, naturalHeight, frames}
        // where x, y, width, height are parameters for drawing on canvas. frames is list of blobs of GIF frames.
        this.images = [];
    }

    async collage(blobs) {
        await this.loadImages(blobs);

        if (!this.realityCheck()) return;

        this.calculateImages();

        if (!this.realityCheck()) return;

        return await this.render();
    }

    static Matrix = class {
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
    }

    horver(hor, ver) {
        return this.firstAxis === "horizontal" ? hor : ver;
    }

    async loadImages(blobs) {
        for (let blob of blobs) {
            blob = await fetch(blob).then(r => r.blob());

            switch (blob.type) {
                case "image/jpeg":
                case "image/png": {
                    const image = new Image();
                    image.src = URL.createObjectURL(blob);
                    await image.decode();
                    this.images.push({
                        file: blob,
                        el: image,
                        naturalWidth: image.naturalWidth,
                        naturalHeight: image.naturalHeight,
                    });
                } break;

                case "image/heif": {
                    const image = new Image();
                    const from_heic = await heic2any({ blob: blob, toType: "image/jpeg" });
                    image.src = URL.createObjectURL(from_heic);
                    await image.decode();
                    this.images.push({
                        file: blob,
                        el: image,
                        naturalWidth: image.naturalWidth,
                        naturalHeight: image.naturalHeight,
                    });
                } break;

                case "image/gif": {
                        const gif = await this.gifFileToFrames(blob);
                        this.hasGifs = true;
                        this.images.push({
                            file: blob,
                            frames: gif.frames,
                            reader: gif.reader,
                            currentFrameIdx: 0,
                            nextFrameTime: gif.reader.frameInfo(0).delay,
                            naturalWidth: gif.reader.width,
                            naturalHeight: gif.reader.height,
                        });
                    } break;

                default:
                    console.error(`unsupported file type ${blob.type}`);
                    break;
            }

            if (!this.realityCheck()) return;
        }
    }

    async gifFileToFrames(file) {
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

    async render() {
        if (this.hasGifs) {
            const gif = new GIF({workerScript: "./lib/gif.worker.js"});
            this.addFramesToGif(gif);
            const url = await new Promise((resolve, reject) => {
                gif.on('finished', function(blob) {
                    resolve(URL.createObjectURL(blob));
                });
                gif.render();
            });
            return url;
        }
        else {
            const canvas = this.drawImagesToCanvas()
            const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
            return URL.createObjectURL(blob);
        }
    }

    addFramesToGif(gif) {
        let time = 0;
        while(true) {
            let minDelay = null;
            for (let image of this.images.filter(img => img.frames)) {
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
            const canvas = this.drawImagesToCanvas();
            gif.addFrame(canvas, {delay: minDelay});
            time += minDelay;
        }
    }

    drawImagesToCanvas() {
        if (this.sizeLimit) {
            const [w, h] = [this.calcWidth(), this.calcHeight()];
            const k = (w > h ? w : h) / this.sizeLimit;
            if (k > 1) {
                for (let image of this.images) {
                    image.width = Math.floor(image.width / k);
                    image.height = Math.floor(image.height / k);
                    image.x = Math.floor(image.x / k);
                    image.y = Math.floor(image.y / k);
                }
            }
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = this.calcWidth();
        canvas.height = this.calcHeight();

        for (let img of this.images) {
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

    calculateImages() {
        this.images[0].x = this.images[0].y = 0;
        this.images[0].width = this.images[0].height = 0;

        for (let i = 0; i < this.firstDim; i++) {
            const line = this.getImageLine(this.secondAxis, i);
            const prevLine = this.getImageLine(this.secondAxis, Math.max(0, i-1));
            line[0][this.firstCoor] = prevLine[0][this.firstCoor] + prevLine[0][this.firstSize];
            line[0][this.secondCoor] = 0;

            // resize according to first element in current row/column.
            line[0][this.firstSize] = line[0][this.firstNaturalSize];
            line[0][this.secondSize] = line[0][this.secondNaturalSize];
            for (let j = 1; j < this.secondDim; j++) {
                if (line[j]) {
                    const ratio = line[0][this.firstSize] / line[j][this.firstNaturalSize];
                    line[j][this.firstSize] = line[0][this.firstSize];
                    line[j][this.secondSize] = line[j][this.secondNaturalSize] * ratio;
                    line[j][this.firstCoor] = line[0][this.firstCoor];
                    line[j][this.secondCoor] = line[j-1][this.secondCoor] + line[j-1][this.secondSize];
                }
            }

            // resize according to previous row/column.
            const naturalSumm = line.reduce((acc, val) => acc + val[this.secondSize], 0);
            const neededSumm = prevLine.reduce((acc, val) => acc + val[this.secondSize], 0);
            const ratio = neededSumm / naturalSumm;
            for (let j = 0; j < this.secondDim; j++) {
                if (line[j]) {
                    line[j][this.firstSize] = Math.ceil(line[j][this.firstSize] * ratio);
                    line[j][this.secondSize] = Math.ceil(line[j][this.secondSize] * ratio);
                    line[j][this.secondCoor] = Math.ceil(line[j][this.secondCoor] * ratio);
                }
            }
        }
    }

    getImageLine(axis, n) {
        const matrix = this.fillDirection === "vertical"
            ? new Collager.Matrix(this.cols, this.rows, this.images)
            : new Collager.Matrix(this.rows, this.cols, this.images);

        // prevent last row/col being empty
        const cond1 = this.fillDirection == this.secondAxis;
        const cond2 = this.rows * this.cols - this.secondDim >= this.images.length;
        if (cond1 && cond2) {
            for (i = 0; i < this.firstDim - this.images.length % this.firstDim; i++) {
                matrix.a.splice(this.images.length - i, 0, null);
            }
        }

        if (this.fillDirection === "vertical") {
            matrix.transpose();
        }

        return axis === "horizontal" ? matrix.getRow(n) : matrix.getCol(n);
    }

    calcWidth() {
        return this.getImageLine("horizontal", 0).reduce((acc, val) => acc + val.width, 0);
    }

    calcHeight() {
        return this.getImageLine("vertical", 0).reduce((acc, val) => acc + val.height, 0);
    }

}