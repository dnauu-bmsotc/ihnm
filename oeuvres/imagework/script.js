document.addEventListener("DOMContentLoaded", function() {

    collager = new Collager();

    const callback = async function() {
        const imgEls = document.querySelectorAll("#images li img");
        const images = Array.from(imgEls).map(img => img.src);
        clear_outut();
        limitRowcolInputValues(images.length);
        await collager.collage(images);
    }

    initSortables();

    implementImageDrop(callback);

    implementPaste(callback);

    implementBrowseButtonInput(callback);

    loadExampleImages();

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


function clear_outut() {
    // document.getElementById("result-image").src = "";

    // canvas = document.getElementById("result-canvas");
    // canvas.width = 100;
    // canvas.height = 100;
    // canvas.getContext('2d').clearRect(0, 0, 100, 100);
}


function limitRowcolInputValues(numberOfImages) {
    document.getElementById("rowcol-input").max = numberOfImages;
    document.getElementById("rowcol-input").value = Math.ceil(Math.sqrt(numberOfImages));
}


function loadExampleImages() {
//     const testImages = [];
//     for (let i = 0; i < nTestImages; i++) {
//         const url = `./testimages/test${i}.${testImagesExt}`;
//         const resp = await fetch(url);
//         testImages.push(await resp.blob());
//     }
//     return testImages;
}


class Collager {
    constructor() {
        this.layout = {
            // Symbol used if input was changed while processing so deprecated results
            // do not replace the newer ones.
            id: null,
            // array of {file, image, x, y, width, height, naturalWidth, naturalHeight, frames}
            // where x, y, width, height are parameters for drawing on canvas
            // frames is list of blobs of GIF frames.
            images: null,
            // way of ordering images, "horizontal" or "vertical".
            fillDirection: null,
            // firstAxis is perpendicular to orientation of straight lines
            // "horizontal" if images align into straight cols, "vertical" for rows.
            firstAxis: null,
            // inverse of firstAxis, corresponds to straight lines orientation.
            get secondAxis() {return this._horver("vertical", "horizontal")},
            // numbers of rows and cols into which images are placed.
            rows: null,
            cols: null,
            // alias.
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
        };
        this.l = this.layout;
    }

    async collage(blobs) {
        this.l.id = Symbol();
        const checkId = this.createIdCheck(this.l.id);

        try {
            await this.loadImages(blobs);
            checkId();

            const v = parseInt(document.getElementById("rowcol-input").value);
            const w = Math.ceil(this.l.images.length / v);

            this.l.fillDirection = document.getElementById("dir-select").value;
            this.l.firstAxis = document.getElementById("rowcol-select").value === "cols" ? "horizontal" : "vertical";
            this.l.rows = this.l._horver(w, v);
            this.l.cols = this.l._horver(v, w);

            // calculateImages();

            // await render(checkId);
        }
        catch (error) {
            if (error instanceof Collager.InputsChangedError)
                console.log("inputs changed before they were processed");
            else throw error;
        }
    }

    static Matrix = class {
        constructor(rows, cols, arr) {
            this.r, this.c, this.a = rows, cols, arr.slice();
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

    static InputsChangedError = class extends Error {}

    createIdCheck(id) {
        return function() {
            if (id !== this.l.id) {
                throw new this.InputsChangedError();
            }
        }.bind(this);
    }

    async loadImages(blobs) {
        this.l.images = [];

        for (let blob of blobs) {
            blob = await fetch(blob).then(r => r.blob());

            switch (blob.type) {
                case "image/jpeg":
                case "image/png": {
                    const image = new Image();
                    image.src = URL.createObjectURL(blob);
                    await image.decode();
                    this.l.images.push({
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
                    this.l.images.push({
                        file: blob,
                        el: image,
                        naturalWidth: image.naturalWidth,
                        naturalHeight: image.naturalHeight,
                    });
                } break;

                case "image/gif": {
                        const gif = await this.gifFileToFrames(blob);
                        this.l.images.push({
                            file: blob,
                            frames: gif.frames,
                            reader: gif.reader,
                            naturalWidth: gif.reader.width,
                            naturalHeight: gif.reader.height,
                        });
                    } break;

                default:
                    console.log(`unsupported file type ${blob.type}`);
                    break;
            }
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

    async render(checkId) {
        // const hasGifs = resetGifImagesReadParameters();
        // if (hasGifs) {
        //     const gif = new GIF({workerScript: "./lib/gif.worker.js"});
        //     addFramesToGif(gif);
        //     const url = await new Promise((resolve, reject) => {
        //         gif.on('finished', function(blob) {
        //             resolve(URL.createObjectURL(blob));
        //         });
        //         gif.render();
        //     });

        //     checkId();
        //     setOutputVariant("image");
        //     document.getElementById("result-image").src = url;
        // }
        // else {
        //     const canvas = drawImagesToCanvas();
        //     const res = document.getElementById("result-canvas");
            
        //     checkId();
        //     setOutputVariant("canvas");
        //     res.width = canvas.width;
        //     res.height = canvas.height;
        //     res.getContext("2d").drawImage(canvas, 0, 0);
        // }
    }

    resetGifImagesReadParameters() {
        let hasGifs = false;
        for (let image of this.l.images) {
            if (image.type == "image/gif") {
                hasGifs = true;
                image.currentFrameIdx = 0;
                image.nextFrameTime = image.reader.frameInfo(0).delay;
            }
        }
        return hasGifs;
    }

    addFramesToGif(gif) {
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

    drawImagesToCanvas() {
        // if (document.getElementById("size-limited").checked) {
        //     const limit = parseInt(document.getElementById("size-limit").value);
        //     const [w, h] = [calcWidth(), calcHeight()];
        //     const k = (w > h ? w : h) / limit;
        //     if (k > 1) {
        //         for (let image of layout.images) {
        //             image.width = Math.floor(image.width / k);
        //             image.height = Math.floor(image.height / k);
        //             image.x = Math.floor(image.x / k);
        //             image.y = Math.floor(image.y / k);
        //         }
        //     }
        // }

        // const canvas = document.createElement("canvas");
        // const ctx = canvas.getContext("2d");
        
        // canvas.width = calcWidth();
        // canvas.height = calcHeight();

        // document.getElementById("size-warning").hidden = (canvas.width*canvas.height < 4096*4096);

        // for (let img of l.images) {
        //     if (img.el) {
        //         ctx.drawImage(img.el, img.x, img.y, img.width, img.height);
        //     }
        //     if (img.frames) {
        //         const data = img.frames[img.currentFrameIdx];
        //         const renderer = document.createElement('canvas');
        //         renderer.width = img.naturalWidth;
        //         renderer.height = img.naturalHeight;
        //         renderer.getContext('2d').putImageData(data, 0, 0);
        //         ctx.drawImage(renderer, img.x, img.y, img.width, img.height);
        //     }
        // }

        // return canvas;
    }

    calculateImages() {
        l = this.layout;

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

    getImageLine(axis, n) {
        const matrix = this.l.fillDirection === "vertical"
            ? new Matrix(this.l.cols, this.l.rows, this.l.images)
            : new Matrix(this.l.rows, this.l.cols, this.l.images);

        // prevent last row/col being empty
        const cond1 = this.l.fillDirection == this.l.secondAxis;
        const cond2 = this.l.rows * this.l.cols - this.l.secondDim >= this.l.images.length;
        if (cond1 && cond2) {
            for (i = 0; i < this.l.firstDim - this.l.images.length % this.l.firstDim; i++) {
                matrix.a.splice(this.l.images.length - i, 0, null);
            }
        }

        if (this.l.fillDirection === "vertical") {
            matrix.transpose();
        }
        return axis === "horizontal" ? matrix.getRow(n) : matrix.getCol(n);
    }

    calcWidth() {
        return getImageLine("horizontal", 0).reduce((acc, val) => acc + val.width, 0);
    }

    calcHeight() {
        return getImageLine("vertical", 0).reduce((acc, val) => acc + val.height, 0);
    }

}








// // adding listeners
// document.addEventListener("DOMContentLoaded", function() {
//     document.getElementById("download-btn").addEventListener("click", _ => {
//         switch (setOutputVariant.variant) {
//             case "image":
//                 download(document.getElementById("result-image").src, "collage");
//                 break;
//             case "canvas":
//                 download(document.getElementById("result-canvas").toDataURL(), "collage");
//                 break;
//         }
//     });
// });


// setOutputVariant(variant) {
//     setOutputVariant.variant = variant;
//     switch (variant) {
//         case "image":
//             document.getElementById("result-image").hidden = false;
//             document.getElementById("result-canvas").hidden = true;
//             break;
    
//         case "canvas":
//             document.getElementById("result-image").hidden = true;
//             document.getElementById("result-canvas").hidden = false;
//             break;
//     }
// }
