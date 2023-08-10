const g = {
    loaded: false,
};

const settings = {};

document.addEventListener("DOMContentLoaded", async function() {
    const model = await tf.loadLayersModel('./generator/model.json');
    const params = await (await fetch("./generator/info.json", {cache: "no-store"})).json();

    g.loaded = true;
    g.model = model;
    g.latentDim = params.latent_dim;
    g.nClasses = params.n_classes;
    g.imageSize = params.image_size;
    g.nChannels = params.n_channels;
    g.mean = params.mean;
    g.stdDev = params.std_dev;
    g.outputMinApprox = params.output_min;
    g.outputMaxApprox = params.output_max;
    g.classList = params.class_list,

    fillBackground();
    enableGIFGeneration();
});

function createNoise(n=1, seed) {
    return tf.randomNormal([n, g.latentDim], g.mean, g.stdDev, "float32", seed);
}

function createLabel(intCl=null, n=1, seed) {
    if (intCl === null) intCl = tf.randomUniformInt([n], 0, maxval=g.nClasses, seed);
    return tf.oneHot(intCl, g.nClasses);
}

function normalize(img) {
    img = img.clipByValue(g.outputMinApprox, g.outputMaxApprox);
    img = img.sub(g.outputMinApprox);
    img = img.div(g.outputMaxApprox - g.outputMinApprox);
    return img;
}

function drawToCanvas(img, canvas, canvasSize=128, method="nearest") {
    img = normalize(img);
    if (canvasSize && method === "nearest") {
        img = tf.image.resizeNearestNeighbor(img, [canvasSize, canvasSize]);
    }
    if (canvasSize && method === "bilinear") {
        img = tf.image.resizeBilinear (img, [canvasSize, canvasSize]);
    }
    img = tf.squeeze(img, 0);
    return tf.browser.toPixels(img, canvas);
}

async function fillBackground(n=100, canvasSize, delay=50) {
    const box = document.getElementById("generations");
    for (let i = 0; i < n; i++) {
        const canvas = document.createElement("canvas");
        const image = g.model.predict(tf.concat([createNoise(), createLabel()], 1));
        await drawToCanvas(image, canvas, canvasSize);
        box.append(canvas);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

function interpolate(label1, label2, noise1, noise2, nInterpolations) {
    label1 = tf.cast(label1, "float32");
    label2 = tf.cast(label2, "float32");

    const frames = [];
    for (i = 0; i <= nInterpolations; i++) {
        const percent = i / nInterpolations;
        const interpolationLabels = tf.add(label1.mul(1-percent), label2.mul(percent));
        const interpolationNoises = tf.add(noise1.mul(1-percent), noise2.mul(percent));
        frames.push(tf.concat([interpolationNoises, interpolationLabels], 1));
    }

    return g.model.predict(tf.concat(frames, 0), verbose=true);
}


function hideLoadingScreen() {
    document.getElementById("gif-creator-loading").style.visibility = "hidden";
    document.getElementById("gif-creator").style.visibility = "visible";
}


function hydrateClassSelect() {
    function appendOption(select, value, text) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        select.append(option);
    }

    document.querySelectorAll(".ral-class-select").forEach(select => {
        appendOption(select, -1, "Случайный");
        for (let [i, c] of g.classList.entries()) {
            appendOption(select, i, c);
        }
    });
}

function setImageSrc(src) {
    const imgEl = document.getElementById("gif-img");
    const btnEl = document.getElementById("create-gif-btn");

    if (src) {
        imgEl.src = src;
        imgEl.addEventListener("load", _ => btnEl.disabled = false)
    }
    else {
        imgEl.src = "";
        btnEl.disabled = true;
    }
}

async function framesToGIF(frames, fps, resize) {
    const encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.start();
    encoder.setFrameRate(fps);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true });

    for (let frame of frames.arraySync()) {
        await drawToCanvas(tf.tensor4d([frame]), canvas, resize);
        encoder.addFrame(ctx);
    }

    encoder.finish();
    const binary_gif = encoder.stream().getData()
    const data_url = 'data:image/gif;base64,' + encode64(binary_gif);

    return data_url;
}

function limitInputs(ids) {
    for (let id of ids) {
        document.getElementById(id).addEventListener("input", e => {
            const input = e.target;
            if (parseInt(input.value) < parseInt(input.min)) input.value = input.min;
            if (parseInt(input.value) > parseInt(input.max)) input.value = input.max;
        });
    }
}

function getWordCaseByInt(n, imenit, single, many) {
    if ((n % 100 >= 11) && (n % 100 <= 19))
        return many;
    else if (n % 10 == 0)
        return many;
    else if (n % 10 == 1)
        return imenit;
    else if (n % 10 >= 2 && n % 10 <= 4)
        return single;
    else if (n % 10 >= 5 && n % 10 <= 20)
        return many;
}

function updateSettings() {
    function getSetting(id) {
        return parseInt(document.getElementById(id).value);
    }
    settings.seed1 = getSetting("seed1-input");
    settings.seed2 = getSetting("seed2-input");
    settings.intCl1 = getSetting("class1-input");
    settings.intCl2 = getSetting("class2-input");
    settings.nInterpolations = getSetting("nInterpolations-input");
    settings.fps = getSetting("fps-input");

    const dur = Math.round(1 / settings.fps * (settings.nInterpolations + 1) * 10) / 10;
    document.getElementById("dur-span").textContent = dur.toFixed(1);

    document.getElementById("frames1-span").textContent =
        getWordCaseByInt(settings.nInterpolations, "кадр", "кадра", "кадров");

    document.getElementById("frames2-span").textContent =
        getWordCaseByInt(settings.fps, "кадр", "кадра", "кадров");

    if (settings.nInterpolations % 10 == 1 && settings.nInterpolations % 100 != 11)
        document.getElementById("created-span").textContent = "создан";
    else
        document.getElementById("created-span").textContent = "создано";

    document.getElementById("random_seed1-span").hidden = settings.seed1 != 0;
    document.getElementById("random_seed2-span").hidden = settings.seed2 != 0;

}

function randomSeed(id) {
    const min = parseInt(document.getElementById(id).min);
    const max = parseInt(document.getElementById(id).max);
    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min) + min);
}

function enableGIFGeneration() {
    hydrateClassSelect();
    hideLoadingScreen();
    updateSettings();

    limitInputs(["seed1-input", "seed2-input", "nInterpolations-input", "fps-input"]);
    document.getElementById("settings").addEventListener("input", updateSettings);

    document.getElementById("create-gif-btn").addEventListener("click", async _ => {
        setImageSrc("");
        await new Promise(resolve => setTimeout(resolve, 20));
        
        const label1 = createLabel(settings.intCl1 === -1 ? null : [settings.intCl1], 1);
        const label2 = createLabel(settings.intCl2 === -1 ? null : [settings.intCl2], 1);

        const noise1 = createNoise(1, settings.seed1 === 0 ? randomSeed("seed1-input") : 0);
        const noise2 = createNoise(1, settings.seed2 === 0 ? randomSeed("seed2-input") : 0);

        const frames = interpolate(
            label1, label2, noise1, noise2, settings.nInterpolations);

        const data_url = await framesToGIF(frames, settings.fps, 128);
        
        setImageSrc(data_url);
    });
}
