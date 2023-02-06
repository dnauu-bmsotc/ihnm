let removeTiling = null;
let setImage = null;
let setSpeed = null;
const ns = "http://www.w3.org/2000/svg";

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("tiling-buttons-container").firstElementChild.click();
});

function setPentagonalTiling() {
    removeTiling && removeTiling();

    const leverEl = createLeverEl();
    const lever = new Lever(
        leverEl, "pattern1", Number(document.getElementById('speed-slider').value)
    );

    const tiling = new PentagonalTilingType5({
        size1: 2, size2: 2, angle: 120, nLayers: 3
    });

    tiling.deployAtSVG(
        document.getElementById("lens-svg"), 50, 50, {
            fill: "url(#pattern1)", stroke: "black", strokeWidth: "0.1"
        }
    );

    setImage = function(href) {
        lever.setImage(href);
    }

    setSpeed = function(speed) {
        lever.setSpeed(speed);
    }

    removeTiling = function() {
        leverEl.remove();
        tiling.delete();
        removeTiling = null;
        setImage = null;
        setSpeed = null;
    }

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
    
    removeTiling = function() {
        removeTiling = null;
    }
}

function createLeverEl() {
    const leverEl = document.createElementNS(ns, "svg");
    leverEl.setAttributeNS(null, "width", 128);
    leverEl.setAttributeNS(null, "height", 128);
    leverEl.setAttributeNS(null, "viewBox", "0 0 100 100");
    document.getElementById("lever").appendChild(leverEl);
    return leverEl;
}

function loadImage(el) {
    const image = el.files[0];
    setPatternImage(URL.createObjectURL(image));
}

function setPatternImage(href) {
    setImage(href)
    // reset blur animation
    // https://stackoverflow.com/questions/6268508
    document.getElementById("lens").style.animation = 'none';
    document.getElementById("lens").offsetHeight;
    document.getElementById("lens").style.animation = null;
}