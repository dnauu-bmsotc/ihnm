let removeTiling = null;
const sliders = [];
const ns = "http://www.w3.org/2000/svg";

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("tiling-buttons-container").firstElementChild.click();
});

function setPentagonalTiling() {
    removeTiling && removeTiling();
    // create lever and tiling
    const [leverEl, lever] = createLever("pattern");
    const tiling = new PentagonalTilingType5({
        size1: 2, size2: 2, angle: 120, nLayers: 3
    });
    tiling.deployAtSVG(
        document.getElementById("lens-svg"), 50, 50, {
            fill: "url(#pattern)", stroke: "black", strokeWidth: "0.1"
        }
    );
    // function for removing elements from dom
    removeTiling = function() {
        leverEl.remove();
        tiling.delete();
        removeTiling = null;
    }
    // initial settings
    setActiveLever(lever);
    document.getElementById("image-buttons-container").firstElementChild.click();
}

function setTriangularTiling() {
    removeTiling && removeTiling();
    
    removeTiling = function() {
        removeTiling = null;
    }
}

function setSquareTiling() {
    removeTiling && removeTiling();
    // create levers and tiling
    const [lever1El, lever1] = createLever("pattern1");
    const [lever2El, lever2] = createLever("pattern2");
    const tiling = new SquareTiling({size: 12, nLayers: 6});
    tiling.deployAtSVG(
        document.getElementById("lens-svg"), 50, 50,
        {fill: "url(#pattern1)", stroke: "black", strokeWidth: "0.1"},
        {fill: "url(#pattern2)", stroke: "black", strokeWidth: "0.1"}
    );
    // function for removing elements from dom
    removeTiling = function() {
        tiling.delete();
        lever1El.remove();
        lever2El.remove();
        removeTiling = null;
    }
    // initial settings
    setActiveLever(lever2);
    document.getElementById("image-buttons-container").firstElementChild.click();
    setActiveLever(lever1);
    document.getElementById("image-buttons-container").firstElementChild.click();
}

function setActiveLever(lever) {
    if (setActiveLever.activeLever) {
        setActiveLever.activeLever.svgcanvas.classList.remove("active-lever");
    }
    setActiveLever.activeLever = lever;
    setActiveLever.activeLever.svgcanvas.classList.add("active-lever");
}

function createLever(id) {
    const container = document.createElement("div");
    container.classList.add("lever-svg-container");
    document.getElementById("lever").appendChild(container);

    const leverEl = document.createElementNS(ns, "svg");
    leverEl.setAttributeNS(null, "width", 128);
    leverEl.setAttributeNS(null, "height", 128);
    leverEl.setAttributeNS(null, "viewBox", "0 0 100 100");
    leverEl.classList.add("lever-svg");
    container.appendChild(leverEl);

    const lever = new Lever(
        leverEl, id, Number(document.getElementById('speed-slider').value)
    );
    leverEl.addEventListener("click", () => setActiveLever(lever));
    leverEl.addEventListener("speedChange", e => lever.setSpeed(e.detail.value));

    return [container, lever];
}

function loadImage(el) {
    const image = el.files[0];
    setPatternImage(URL.createObjectURL(image));
}

function setPatternImage(href) {
    setActiveLever.activeLever.setImage(href);
    // reset blur animation
    // https://stackoverflow.com/questions/6268508
    document.getElementById("lens").style.animation = 'none';
    document.getElementById("lens").offsetHeight;
    document.getElementById("lens").style.animation = null;
}

function speedSliderInput(e) {
    document.querySelectorAll(".lever-svg").forEach(lever => lever.dispatchEvent(
        new CustomEvent("speedChange", { detail: { value: Number(e.target.value) } })
    ));
}